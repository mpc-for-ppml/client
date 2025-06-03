import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSession } from "@/hooks/useSession";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Loader2, Download, ChevronRight, Sparkles, Database, Info, FlaskConical, Eye, Target, BarChart3, Brain, Layers, Gauge, Users, Timer, TrendingUp, Binary, FileSpreadsheet } from "lucide-react";
import { FormApi } from "@/api";
import { SessionResult } from "@/types";
import { toast } from "react-toastify";

interface PredictionResult {
	predictions: number[];
	inputData?: Record<string, number>[];
}

export default function TestModel() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { session } = useSession();
	
	const [modelData, setModelData] = useState<SessionResult | null>(null);
	const [loading, setLoading] = useState(true);
	const [predicting, setPredicting] = useState(false);
	const [inputMethod, setInputMethod] = useState<"manual" | "file">("manual");
	const [manualInputs, setManualInputs] = useState<Record<string, string>>({});
	const [file, setFile] = useState<File | null>(null);
	const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
	const [showAdvanced, setShowAdvanced] = useState(false);
	const textRef = useRef<HTMLParagraphElement>(null);
	const infoRef = useRef<HTMLParagraphElement>(null);

	useEffect(() => {
		// Early return if no id
		if (!id) {
			navigate("/");
			return;
		}

		// Early return if session exists but doesn't match
		if (session && session.sessionId !== id) {
			navigate("/");
			return;
		}

		// Don't fetch if no session yet (still loading)
		if (!session) {
			return;
		}

		let isMounted = true;

		const fetchModelData = async () => {
			try {
				const result = await FormApi.result(id);
				
				if (!isMounted) return;
				
				setModelData(result);
				
				// Initialize manual inputs with empty values for each feature
				const features = result.coefficients
					.filter(coef => coef.type === 'feature')
					.map(coef => coef.feature);
				const initialInputs: Record<string, string> = {};
				features.forEach(feature => {
					initialInputs[feature] = "";
				});
				setManualInputs(initialInputs);
			} catch {
				if (!isMounted) return;
				
				toast.error("Failed to load model data");
				navigate(`/result/${id}`);
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		fetchModelData();

		return () => {
			isMounted = false;
		};
	}, [id, session?.sessionId, navigate]);


	const handleManualInputChange = (feature: string, value: string) => {
		setManualInputs(prev => ({ ...prev, [feature]: value }));
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
        const file = e.target.files?.[0];

		if (file) {
            if (textRef && textRef.current) {
                textRef.current.textContent = 'File uploaded sucessfully!';
            }
            if (infoRef && infoRef.current) {
                infoRef.current.textContent = `${file.name}`;
            }

            setPredictionResult(null);
        }
		setFile(e.target.files?.[0]||null)
	};

	const handlePredict = async () => {
		setPredicting(true);
		try {
			if (inputMethod === "manual") {
				// Validate all inputs are filled
				const features = modelData!.coefficients
					.filter(coef => coef.type === 'feature')
					.map(coef => coef.feature);
				for (const feature of features) {
					if (!manualInputs[feature]) {
						toast.error(`Please fill in all feature values`);
						setPredicting(false);
						return;
					}
				}
				
				// Convert to numbers and make prediction
				const inputData: Record<string, number> = {};
				for (const [key, value] of Object.entries(manualInputs)) {
					inputData[key] = parseFloat(value);
				}
				
				const result = await FormApi.predict(id!, { data: [inputData] });
				setPredictionResult({ predictions: result.predictions, inputData: [inputData] });
				
			} else if (inputMethod === "file" && file) {
				const formData = new FormData();
				formData.append("file", file);
				
				const result = await FormApi.predictBatch(id!, formData);
				setPredictionResult({ predictions: result.predictions });
			}
			
			toast.success("Prediction completed successfully!");
		} catch (error: any) {
			console.log(error.message);
			toast.error(error.message);
		} finally {
			setPredicting(false);
		}
	};

	const handleDownloadResults = () => {
		if (!predictionResult) return;
		
		const csv = predictionResult.predictions.map((pred, idx) => `${idx + 1},${pred}`).join('\n');
		const blob = new Blob([`Index,Prediction\n${csv}`], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `predictions_${id}.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	if (loading) {
        return (
            <div className="fixed inset-0 bg-main-dark text-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-white/60">Loading results...</p>
                </div>
            </div>
        );
    }

  	if (!modelData) return null;

	const features = modelData.coefficients
		.filter(coef => coef.type === 'feature')
		.map(coef => coef.feature);
	const isLogisticRegression = modelData.summary.model.toLowerCase().includes('logistic') || modelData.summary.model.toLowerCase().includes('logreg');
	const modelType = isLogisticRegression ? "Logistic Regression" : "Linear Regression";

	return (
		<div className="fixed inset-0 bg-main-dark text-white flex flex-col overflow-y-auto overflow-x-hidden">
			{/* Blurry Bubbles */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-20 -left-20 w-[20rem] h-[20rem] bg-main-yellow rounded-full filter blur-[120px] opacity-50 z-0"></motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.7, 0.9, 0.7] }} transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-20 -right-20 w-[20rem] h-[20rem] bg-main-blue rounded-full filter blur-[120px] opacity-50 z-0"></motion.div>
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.5, 0.7, 0.5] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-[25rem] right-40 w-[25rem] h-[25rem] bg-main-yellow/50 rounded-full filter blur-[120px] opacity-50 z-0"/>

			<motion.div
				initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="z-50"
			>
				<Card className="bg-transparent mt-4 w-full p-5 pb-2">
					<CardContent className="flex flex-col">
						<Button
							variant="ghost"
							onClick={() => navigate(`/result/${id}`)}
							className="mb-2 w-44 text-white hover:text-white hover:font-semibold hover:bg-white/10 z-50"
						>
							<ChevronRight className="w-4 h-4 mr-2 rotate-180" />
							Back to Results
						</Button>
						
						<div className="flex items-center gap-5 mb-1">
							<div className="p-2 bg-gradient-to-br from-main-blue/20 to-main-yellow/20 border border-white/10 rounded-xl">
								<FlaskConical className="w-8 h-8 text-primary text-white" />
							</div>
							<h1 className="text-5xl font-semibold leading-tight mb-1.5 text-white">
                                test your model.
                            </h1>
						</div>
						<h1 className="text-white">
							make predictions using your trained {modelType.toLowerCase()} model
						</h1>
					</CardContent>
				</Card>
			</motion.div>

			<motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
                className="z-50"
            >
				<Card className="bg-transparent w-full px-5 mb-4">
                    <CardContent className="flex items-stretch justify-between w-full text-white space-x-6">
						<motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex flex-col w-[70%] rounded-xl"
                        >
							<div className="bg-white/5 border border-white/20 rounded-2xl overflow-hidden">
								<div className="bg-gradient-to-r from-blue-500/20 to-yellow-400/10 p-6 border-b border-white/10">
									<div className="flex items-center gap-3 mb-2">
										<div className="p-2 bg-blue-500/20 rounded-lg">
											<Database className="w-5 h-5 text-blue-400" />
										</div>
										<h3 className="text-xl font-semibold text-white">Input Data</h3>
										<Tooltip delayDuration={0}>
											<TooltipTrigger>
												<Info className="h-4 w-4 text-white/60 hover:text-white/80 transition-colors" />
											</TooltipTrigger>
											<TooltipContent className="bg-white text-black max-w-[250px]">
												<p>Choose between manual feature input or CSV file upload to test your trained model with new data</p>
											</TooltipContent>
										</Tooltip>
									</div>
									<p className="text-sm text-white/70">
										Choose your preferred method to input test data and get instant predictions
									</p>
								</div>
								<div className="p-6">
									<Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v as "manual" | "file")}>
										<TabsList className="grid w-full grid-cols-2 bg-white/10 border border-white/20 rounded-xl p-1">
											<TabsTrigger 
												value="manual" 
												className="data-[state=active]:bg-main-blue data-[state=active]:text-white text-white/70 rounded-lg transition-all duration-300"
											>
												<FileText className="w-4 h-4 mr-2" />
												Manual Input
											</TabsTrigger>
											<TabsTrigger 
												value="file"
												className="data-[state=active]:bg-main-yellow data-[state=active]:text-black text-white/70 rounded-lg transition-all duration-300"
											>
												<Upload className="w-4 h-4 mr-2" />
												Upload CSV
											</TabsTrigger>
										</TabsList>
										
										<TabsContent value="manual" className="mt-6">
											<div className="space-y-4">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													{features.map((feature, index) => (
														<motion.div
															key={feature}
															initial={{ opacity: 0, x: -20 }}
															animate={{ opacity: 1, x: 0 }}
															transition={{ duration: 0.3, delay: index * 0.1 }}
															className="group"
														>
															<Label htmlFor={feature} className="text-sm font-medium text-white/90 mb-2 block">
																{feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
															</Label>
															<div className="relative">
																<Input
																	id={feature}
																	type="number"
																	step="any"
																	placeholder="0.00"
																	value={manualInputs[feature]}
																	onChange={(e) => handleManualInputChange(feature, e.target.value)}
																	className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-main-blue focus:bg-white/10 transition-all duration-300 rounded-lg"
																/>
																<div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
																	<div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
																		manualInputs[feature] ? 'bg-green-400' : 'bg-white/20'
																	}`} />
																</div>
															</div>
														</motion.div>
													))}
												</div>
												
												<div className="flex items-center justify-between bg-white/5 rounded-xl p-4 mt-6">
													<div className="flex items-center space-x-3">
														<div className="p-2 bg-white/10 rounded-lg">
															<Eye className="w-4 h-4 text-white/80" />
														</div>
														<div>
															<Label htmlFor="advanced" className="text-sm font-medium text-white">
																Advanced View
															</Label>
															<p className="text-xs text-white/60">Show model coefficients and weights</p>
														</div>
													</div>
													<Switch
														id="advanced"
														checked={showAdvanced}
														onCheckedChange={setShowAdvanced}
														className="data-[state=checked]:bg-main-blue"
													/>
												</div>
												
												<AnimatePresence>
													{showAdvanced && (
														<motion.div
															initial={{ opacity: 0, height: 0 }}
															animate={{ opacity: 1, height: "auto" }}
															exit={{ opacity: 0, height: 0 }}
															className="bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-xl p-6 mt-4"
														>
															<div className="flex items-center gap-2 mb-4">
																<FlaskConical className="w-5 h-5 text-main-yellow" />
																<p className="text-sm font-semibold text-white">Model Coefficients & Weights</p>
															</div>
															<div className="grid grid-cols-1 gap-3 max-h-40 overflow-y-auto">
																{modelData.coefficients.map((coef, idx) => (
																	<div key={idx} className="flex justify-between items-center bg-white/5 rounded-lg p-3 px-5">
																		<span className="text-white/80 font-medium">
																			{coef.feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
																		</span>
																		<div className="flex items-center gap-2">
																			<div className={`w-2 h-2 rounded-full ${
																				coef.value > 0 ? 'bg-green-400' : 'bg-red-400'
																			}`} />
																			<span className="font-mono text-white text-sm">
																				{coef.value.toFixed(6)}
																			</span>
																		</div>
																	</div>
																))}
															</div>
														</motion.div>
													)}
												</AnimatePresence>
											</div>
										</TabsContent>
										
										<TabsContent value="file" className="mt-6">
											<motion.div
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ duration: 0.3 }}
												className="space-y-4"
											>
												<input
													type="file"
													accept=".csv"
													onChange={(e) => handleFileChange(e)}
													onClick={(e) => (e.currentTarget.value = '')}
													hidden
													id="file-upload"
												/>
												<label htmlFor="file-upload" className="block cursor-pointer mt-2">
													<div className="border-2 border-dashed border-white/50 rounded-lg p-4 flex flex-col items-center bg-white/10 hover:bg-white/5">
														<FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-white/50" />
														<p className="text-sm font-semibold text-white/50 mb-1">
															Upload a CSV file with the same features as your training data
														</p>
														<p className="text-xs text-white/50 mb-3">
															Required columns: {features.join(", ")}
														</p>
														<p className="text-sm font-normal text-white/70 text-center mt-1">
															{file ? file.name : "You haven't uploaded anything!"}
														</p>
													</div>
												</label>
											</motion.div>
										</TabsContent>
									</Tabs>
								
									<Button
										onClick={handlePredict}
										disabled={
											predicting || 
											(inputMethod === "file" && !file) ||
											(inputMethod === "manual" && Object.values(manualInputs).some(value => !value))
										}
										className="w-full mt-6 bg-gradient-to-r from-main-blue to-main-blue/80 hover:from-main-blue/90 hover:to-main-blue/70 text-white font-semibold py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
										size="lg"
									>
										{predicting ? (
											<>
												<Loader2 className="w-4 h-4 mr-2 animate-spin" />
												Predicting...
											</>
										) : (
											<>
												<ChevronRight className="w-4 h-4 mr-2" />
												Make Prediction
											</>
										)}
									</Button>
								</div>
							</div>
						
							<AnimatePresence>
								{predictionResult && (
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										className="mt-6"
									>
										<div className="bg-gradient-to-br from-white/10 via-white/10 to-white/5 border border-white/20 rounded-2xl overflow-hidden">
											<div className="bg-gradient-to-r from-green-500/20 to-green-400/10 p-6 border-b border-white/10">
												<div className="flex items-center gap-3 mb-2">
													<div className="p-2 bg-green-500/20 rounded-lg">
														<Sparkles className="w-5 h-5 text-green-400" />
													</div>
													<h3 className="text-xl font-semibold text-white">Prediction Results</h3>
													<Tooltip delayDuration={0}>
														<TooltipTrigger>
															<Info className="h-4 w-4 text-white/60 hover:text-white/80 transition-colors" />
														</TooltipTrigger>
														<TooltipContent className="bg-white text-black max-w-[250px]">
															<p>Model predictions based on your input data. Results show the predicted output for each sample.</p>
														</TooltipContent>
													</Tooltip>
												</div>
												<p className="text-sm text-white/70">
													{inputMethod === "manual" ? "Single prediction result from manual input" : `Batch predictions for ${predictionResult.predictions.length} samples from CSV file`}
												</p>
											</div>
											<div className="p-6">
												{inputMethod === "manual" && predictionResult.inputData ? (
													<motion.div 
														initial={{ opacity: 0 }}
														animate={{ opacity: 1 }}
														transition={{ duration: 0.5 }}
														className="space-y-6"
													>
														<div className="bg-gradient-to-r from-green-500/10 to-green-400/5 border border-green-500/20 rounded-xl p-8 text-center relative overflow-hidden">
															<div className="absolute top-0 right-0 w-24 h-24 bg-green-400/10 rounded-full blur-2xl" />
															<div className="relative z-10">
																<div className="inline-flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full mb-4">
																	<Target className="w-4 h-4 text-green-400" />
																	<p className="text-sm font-medium text-green-300">Prediction Complete</p>
																</div>
																<p className="text-5xl font-bold text-white mb-2">
																	{isLogisticRegression 
																	? predictionResult.predictions[0] === 1 ? "Positive" : "Negative"
																	: predictionResult.predictions[0].toFixed(4)
																	}
																</p>
																{isLogisticRegression && (
																	<p className="text-sm text-white/60 mt-2">
																		Classification Result: Class {predictionResult.predictions[0]}
																	</p>
																)}
															</div>
														</div>
														
														<div className="py-2">
															<div className="flex items-center gap-2 mb-4">
																<Binary className="w-5 h-5 text-main-blue" />
																<p className="text-sm font-semibold text-white">Input Features Used</p>
															</div>
															<div className="grid grid-cols-2 gap-3">
																{Object.entries(predictionResult.inputData[0]).map(([key, value]) => (
																	<div key={key} className="bg-white/5 rounded-lg p-3 px-5 flex justify-between items-center">
																		<span className="text-white/70 text-sm">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
																		<span className="font-mono text-white font-medium">{value}</span>
																	</div>
																))}
															</div>
														</div>
													</motion.div>
												) : (
													<motion.div 
														initial={{ opacity: 0 }}
														animate={{ opacity: 1 }}
														transition={{ duration: 0.5 }}
														className="space-y-6"
													>
														<div className="bg-white/5 border border-white/20 rounded-xl p-6">
															<div className="flex items-center justify-between mb-4">
																<div className="flex items-center gap-3">
																	<div className="p-2 bg-green-500/20 rounded-lg">
																		<BarChart3 className="w-5 h-5 text-green-400" />
																	</div>
																	<div>
																		<p className="font-semibold text-white">Batch Prediction Complete</p>
																		<p className="text-sm text-white/60">Successfully predicted {predictionResult.predictions.length} samples</p>
																	</div>
																</div>
															</div>
															
															<div className="pt-4">
																<p className="text-sm font-medium text-white mb-3">Sample Results Preview</p>
																<div className="space-y-2 max-h-40 overflow-y-auto">
																	{predictionResult.predictions.slice(0, 10).map((pred, idx) => (
																		<div key={idx} className="flex items-center justify-between bg-white/5 rounded-lg p-2 px-5 text-sm">
																			<span className="text-white/70">Sample {idx + 1}</span>
																			<span className="font-mono text-white font-medium">
																				{isLogisticRegression ? (pred === 1 ? "Positive" : "Negative") : pred.toFixed(4)}
																			</span>
																		</div>
																	))}
																</div>
																{predictionResult.predictions.length > 10 && (
																	<p className="text-xs text-white/50 mt-2 text-center">
																		... and {predictionResult.predictions.length - 10} more predictions
																	</p>
																)}
															</div>
														</div>
														
														<Button
															onClick={handleDownloadResults}
															className="w-full bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white font-semibold py-3 rounded-xl transition-all duration-300"
															size="lg"
														>
															<Download className="w-5 h-5 mr-2" />
															Download All Results as CSV
														</Button>
													</motion.div>
												)}
											</div>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</motion.div>
						
						<motion.div 
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="flex flex-col w-[30%] min-w-[350px] space-y-6"
                        >
							<div className="bg-white/10 border border-white/20 rounded-2xl p-6 pb-8 px-8 h-[400px] relative overflow-hidden">								
								<div className="relative z-10 h-full flex flex-col">
									<div className="flex items-center gap-3 mb-2">
										<h1 className="text-xl font-semibold text-white">Model Overview</h1>
										<Tooltip delayDuration={0}>
											<TooltipTrigger>
												<Info className="h-4 w-4 text-white/60 hover:text-white/80 transition-colors" />
											</TooltipTrigger>
											<TooltipContent className="bg-white text-black max-w-[250px]">
												<p>Key information about your trained machine learning model including type, features, and performance metrics</p>
											</TooltipContent>
										</Tooltip>
									</div>
									<p className="text-sm mb-6 text-white/70">
										Essential details about your trained {modelType.toLowerCase()} model
									</p>

									<div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-2">
										<div className="bg-white/10 rounded-xl p-4 border border-white/20">
											<div className="flex items-center gap-3 mb-2">
												<Brain className="w-5 h-5 text-main-yellow" />
												<p className="text-sm font-semibold text-white">Model Architecture</p>
											</div>
											<p className="text-lg font-bold text-white">{modelType}</p>
											<p className="text-xs text-white/60">Machine learning algorithm type</p>
										</div>
										
										<div className="bg-white/10 rounded-xl p-4 border border-white/20">
											<div className="flex items-center gap-3 mb-2">
												<Layers className="w-5 h-5 text-green-400" />
												<p className="text-sm font-semibold text-white">Input Features</p>
											</div>
											<p className="text-lg font-bold text-white">{features.length} features</p>
											<p className="text-xs text-white/60">Number of input variables</p>
										</div>
										
										<div className="bg-white/10 rounded-xl p-4 border border-white/20">
											<div className="flex items-center gap-3 mb-2">
												<Gauge className="w-5 h-5 text-blue-400" />
												<p className="text-sm font-semibold text-white">Performance</p>
											</div>
											<p className="text-lg font-bold text-white">
												{modelData.summary.accuracy 
													? `${(modelData.summary.accuracy * 100).toFixed(1)}%`
													: modelData.summary.rmse 
													? modelData.summary.rmse.toFixed(3)
													: 'N/A'
												}
											</p>
											<p className="text-xs text-white/60">
												{modelData.summary.accuracy ? 'Classification accuracy' : 'Root mean square error (RMSE)'}
											</p>
										</div>
									</div>
								</div>
							</div>

							<div className="bg-white/10 border border-white/20 rounded-2xl p-6 pb-8 px-8 h-[400px] relative overflow-hidden">								
								<div className="relative z-10 h-full flex flex-col">
									<div className="flex items-center gap-3 mb-2">
										<h1 className="text-xl font-semibold text-white">Training Stats</h1>
										<Tooltip delayDuration={0}>
											<TooltipTrigger>
												<Info className="h-4 w-4 text-white/60 hover:text-white/80 transition-colors" />
											</TooltipTrigger>
											<TooltipContent className="bg-white text-black max-w-[250px]">
												<p>Key training statistics including dataset size, distributed learning parameters, and hyperparameters used during model training</p>
											</TooltipContent>
										</Tooltip>
									</div>
									<p className="text-sm mb-6 text-white/70">Configuration and metrics from your privacy-preserving training session</p>
									
									<div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-2">
										<motion.div
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ duration: 0.3, delay: 0.1 }}
											className="flex items-center justify-between bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-xl p-4 hover:from-white/15 hover:to-white/10 transition-all duration-300"
										>
											<div className="flex items-center gap-3">
												<div className="p-2 bg-blue-400/20 rounded-lg">
													<Database className="w-5 h-5 text-blue-400" />
												</div>
												<div>
													<p className="text-sm font-semibold text-white">Training Samples</p>
													<p className="text-xs text-white/60">Total dataset size</p>
												</div>
											</div>
											<div className="text-right">
												<p className="text-lg font-bold text-white tabular-nums">{modelData.config.dataCount}</p>
												<p className="text-xs text-white/60">records</p>
											</div>
										</motion.div>
										
										<motion.div
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ duration: 0.3, delay: 0.2 }}
											className="flex items-center justify-between bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-xl p-4 hover:from-white/15 hover:to-white/10 transition-all duration-300"
										>
											<div className="flex items-center gap-3">
												<div className="p-2 bg-purple-400/20 rounded-lg">
													<Users className="w-5 h-5 text-purple-400" />
												</div>
												<div>
													<p className="text-sm font-semibold text-white">Parties Involved</p>
													<p className="text-xs text-white/60">Federated participants</p>
												</div>
											</div>
											<div className="text-right">
												<p className="text-lg font-bold text-white tabular-nums">{modelData.config.parties}</p>
												<p className="text-xs text-white/60">parties</p>
											</div>
										</motion.div>
										
										<motion.div
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ duration: 0.3, delay: 0.3 }}
											className="flex items-center justify-between bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-xl p-4 hover:from-white/15 hover:to-white/10 transition-all duration-300"
										>
											<div className="flex items-center gap-3">
												<div className="p-2 bg-orange-400/20 rounded-lg">
													<Timer className="w-5 h-5 text-orange-400" />
												</div>
												<div>
													<p className="text-sm font-semibold text-white">Training Epochs</p>
													<p className="text-xs text-white/60">Iterations completed</p>
												</div>
											</div>
											<div className="text-right">
												<p className="text-lg font-bold text-white tabular-nums">{modelData.summary.epochs}</p>
												<p className="text-xs text-white/60">epochs</p>
											</div>
										</motion.div>
										
										<motion.div
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ duration: 0.3, delay: 0.4 }}
											className="flex items-center justify-between bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-xl p-4 hover:from-white/15 hover:to-white/10 transition-all duration-300"
										>
											<div className="flex items-center gap-3">
												<div className="p-2 bg-pink-400/20 rounded-lg">
													<TrendingUp className="w-5 h-5 text-pink-400" />
												</div>
												<div>
													<p className="text-sm font-semibold text-white">Learning Rate</p>
													<p className="text-xs text-white/60">Optimization step size</p>
												</div>
											</div>
											<div className="text-right">
												<p className="text-lg font-bold text-white tabular-nums">{modelData.summary.lr}</p>
												<p className="text-xs text-white/60">α value</p>
											</div>
										</motion.div>
									</div>
								</div>
							</div>
						</motion.div>
					</CardContent>
                </Card>
			</motion.div>
		</div>
	);
}