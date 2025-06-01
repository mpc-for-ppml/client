import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSession } from "@/hooks/useSession";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Loader2, Download, ChevronRight, Sparkles, Database } from "lucide-react";
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
		if (!id || (session && id !== session.sessionId)) {
			navigate("/");
			return;
		}

		const fetchModelData = async () => {
			try {
				const result = await FormApi.result(id);
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
				toast.error("Failed to load model data");
				navigate(`/result/${id}`);
			} finally {
				setLoading(false);
			}
		};

		fetchModelData();
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
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="w-8 h-8 animate-spin text-primary" />
			</div>
		);
	}

  	if (!modelData) return null;

	const features = modelData.coefficients
		.filter(coef => coef.type === 'feature')
		.map(coef => coef.feature);
	const modelType = modelData.summary.model === "logistic_regression" ? "Logistic Regression" : "Linear Regression";

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
			<div className="container mx-auto px-4 py-8 max-w-6xl">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div className="mb-8">
						<Button
							variant="ghost"
							onClick={() => navigate(`/result/${id}`)}
							className="mb-4"
						>
							← Back to Results
						</Button>
						
						<div className="flex items-center gap-3 mb-2">
							<div className="p-2 bg-primary/10 rounded-lg">
								<Sparkles className="w-6 h-6 text-primary" />
							</div>
							<h1 className="text-3xl font-bold">Test Your Model</h1>
						</div>
						<p className="text-muted-foreground">
							Make predictions using your trained {modelType} model
						</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<div className="lg:col-span-2">
							<Card>
								<CardHeader>
									<CardTitle>Input Data</CardTitle>
									<CardDescription>
										Choose your preferred method to input test data
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v as "manual" | "file")}>
										<TabsList className="grid w-full grid-cols-2">
											<TabsTrigger value="manual">
												<FileText className="w-4 h-4 mr-2" />
												Manual Input
											</TabsTrigger>
											<TabsTrigger value="file">
												<Upload className="w-4 h-4 mr-2" />
												Upload CSV
											</TabsTrigger>
										</TabsList>
										
										<TabsContent value="manual" className="mt-6">
											<div className="space-y-4">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													{features.map((feature) => (
														<motion.div
															key={feature}
															initial={{ opacity: 0, x: -20 }}
															animate={{ opacity: 1, x: 0 }}
															transition={{ duration: 0.3 }}
														>
															<Label htmlFor={feature} className="text-sm font-medium">
																{feature}
															</Label>
															<Input
																id={feature}
																type="number"
																step="any"
																placeholder="Enter value"
																value={manualInputs[feature]}
																onChange={(e) => handleManualInputChange(feature, e.target.value)}
																className="mt-1"
															/>
														</motion.div>
													))}
												</div>
												
												<div className="flex items-center space-x-2 pt-4">
													<Switch
														id="advanced"
														checked={showAdvanced}
														onCheckedChange={setShowAdvanced}
													/>
													<Label htmlFor="advanced" className="text-sm">
														Show coefficient details
													</Label>
												</div>
												
												<AnimatePresence>
													{showAdvanced && (
														<motion.div
															initial={{ opacity: 0, height: 0 }}
															animate={{ opacity: 1, height: "auto" }}
															exit={{ opacity: 0, height: 0 }}
															className="bg-muted/50 rounded-lg p-4 space-y-2"
														>
														<p className="text-sm font-medium mb-2">Model Coefficients:</p>
															{modelData.coefficients.map((coef, idx) => (
																<div key={idx} className="flex justify-between text-sm">
																<span className="text-muted-foreground">{coef.feature}:</span>
																<span className="font-mono">{coef.value.toFixed(6)}</span>
																</div>
															))}
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
														<Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
														<p className="text-sm font-semibold text-muted-foreground mb-1">
															Upload a CSV file with the same features as your training data
														</p>
														<p className="text-xs text-muted-foreground mb-3">
															Required columns: {features.join(", ")}
														</p>
														<p className="text-sm font-normal text-black/70 text-center mt-1">
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
										className="w-full mt-6"
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
								</CardContent>
							</Card>
						
							<AnimatePresence>
								{predictionResult && (
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										className="mt-6"
									>
										<Card>
											<CardHeader>
												<CardTitle>Prediction Results</CardTitle>
												<CardDescription>
													{inputMethod === "manual" ? "Single prediction result" : `Batch predictions (${predictionResult.predictions.length} samples)`}
												</CardDescription>
											</CardHeader>
											<CardContent>
												{inputMethod === "manual" && predictionResult.inputData ? (
													<div className="space-y-4">
														<div className="bg-primary/10 rounded-lg p-6 text-center">
															<p className="text-sm text-muted-foreground mb-2">Prediction Result</p>
															<p className="text-4xl font-bold text-primary">
																{modelType === "Logistic Regression" 
																? predictionResult.predictions[0] === 1 ? "Positive" : "Negative"
																: predictionResult.predictions[0].toFixed(4)
																}
															</p>
															{modelType === "Logistic Regression" && (
																<p className="text-sm text-muted-foreground mt-2">
																Class: {predictionResult.predictions[0]}
																</p>
															)}
														</div>
														
														<div className="bg-muted/50 rounded-lg p-4">
															<p className="text-sm font-medium mb-2">Input Values:</p>
															<div className="space-y-1">
																{Object.entries(predictionResult.inputData[0]).map(([key, value]) => (
																<div key={key} className="flex justify-between text-sm">
																	<span className="text-muted-foreground">{key}:</span>
																	<span className="font-mono">{value}</span>
																</div>
																))}
															</div>
														</div>
													</div>
												) : (
													<div className="space-y-4">
														<div className="bg-muted/50 rounded-lg p-4">
															<p className="text-sm mb-2">
																Successfully predicted {predictionResult.predictions.length} samples
															</p>
															<div className="grid grid-cols-2 gap-4 mt-4">
																<div>
																	<p className="text-xs text-muted-foreground">First 5 predictions:</p>
																	<div className="mt-1 space-y-1">
																		{predictionResult.predictions.slice(0, 5).map((pred, idx) => (
																			<p key={idx} className="text-sm font-mono">
																				Sample {idx + 1}: {modelType === "Logistic Regression" ? (pred === 1 ? "Positive" : "Negative") : pred.toFixed(4)}
																			</p>
																		))}
																	</div>
																</div>
															</div>
														</div>
														
														<Button
															onClick={handleDownloadResults}
															variant="outline"
															className="w-full"
														>
															<Download className="w-4 h-4 mr-2" />
															Download Results as CSV
														</Button>
													</div>
												)}
											</CardContent>
										</Card>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
						
						<div className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Model Information</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<p className="text-sm text-muted-foreground">Model Type</p>
										<p className="font-medium">{modelType}</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Features</p>
										<p className="font-medium">{features.length} features</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Performance</p>
										<p className="font-medium">
											{modelData.summary.accuracy 
												? `${(modelData.summary.accuracy * 100).toFixed(2)}%`
												: modelData.summary.rmse 
												? `RMSE: ${modelData.summary.rmse.toFixed(3)}`
												: 'N/A'
											}
										</p>
									</div>
								</CardContent>
							</Card>
						
							<Card>
								<CardHeader>
									<CardTitle>Quick Stats</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">Training Samples</span>
										<span className="font-medium">{modelData.config.dataCount}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">Parties Involved</span>
										<span className="font-medium">{modelData.config.parties}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">Epochs</span>
										<span className="font-medium">{modelData.summary.epochs}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">Learning Rate</span>
										<span className="font-medium">{modelData.summary.lr}</span>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
}