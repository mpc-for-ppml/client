import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { DivideSquare, Sigma, Activity, Repeat, Info, Download, FlaskConical, Eye, Database, Loader2, Target, BarChart3, Sparkle } from "lucide-react"
import Model from "@/assets/icons/model.png";
import Session from "@/assets/icons/session.png";
import { ChartPieInteractive } from "./time";
import { ChartLineLinear } from "./evaluation";
import { ChartAucRoc } from "./aucroc";
import { Button } from "@/components";
import { useState, useEffect } from "react";
import FormApi from "@/api/form-api";
import { SessionResult } from "@/types";
import { formatDuration } from "@/lib/utils";


const buildStatsFromSummary = (summary: SessionResult['summary'], config: SessionResult['config']) => {
    const isLinearRegression = summary.model.toLowerCase().includes('linear');
    
    const modelSpecificStats = isLinearRegression ? [
        {
            icon: <DivideSquare className="size-4 text-white/80" />,
            label: "RMSE",
            value: summary.rmse?.toFixed(3) || 'N/A',
        },
        {
            icon: <Sigma className="size-4 text-white/80" />,
            label: "R²",
            value: summary.r2?.toFixed(2) || 'N/A',
        }
    ] : [
        {
            icon: <Target className="size-4 text-white/80" />,
            label: "Accuracy",
            value: summary.accuracy ? (summary.accuracy * 100).toFixed(2) + "%" : 'N/A',
        },
        {
            icon: <BarChart3 className="size-4 text-white/80" />,
            label: "F1 Score",
            value: summary.f1?.toFixed(3) || 'N/A',
        }
    ];
    
    return [
        ...modelSpecificStats,
        {
            icon: <Activity className="size-4 text-white/80" />,
            label: "Learning Rate",
            value: summary.lr.toString(),
        },
        {
            icon: <Repeat className="size-4 text-white/80" />,
            label: "Epochs",
            value: summary.epochs.toString(),
        },
        {
            icon: <Database className="size-4 text-white/80" />,
            label: "Data Points",
            value: config.dataCount.toString(),
        }
    ];
}

export const Result: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<SessionResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchResult = async () => {
            if (!id) {
                toast.error('Session ID is required');
                navigate('/');
                return;
            }

            try {
                setLoading(true);
                const result = await FormApi.result(id);
                setData(result);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch results');
                toast.error(err.message || 'Failed to fetch results');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [id, navigate]);

    const handleSave = async () => {
        if (!id) return;
        
        try {
            await FormApi.downloadModel(id);
            toast.success("Model downloaded successfully!");
        } catch (err: any) {
            toast.error(err.message || "Failed to download model");
        }
    }

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

    if (error || !data) {
        return (
            <div className="fixed inset-0 bg-main-dark text-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <p className="text-red-400">Error: {error || 'No data available'}</p>
                    <Button onClick={() => navigate('/')} className="bg-white/20 hover:bg-white/30">
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    const { summary, config, coefficients, actualVsPredicted, aucRocData } = data;
    const isLogisticRegression = summary.model.toLowerCase().includes('logistic') || summary.model.toLowerCase().includes('logreg');
    
    // Normalize coefficient values for bar visualization
    const maxCoefficient = Math.max(...coefficients.map(c => Math.abs(c.value)));
    const normalizeCoefficient = (value: number) => {
        return (Math.abs(value) / maxCoefficient) * 200; // Scale
    };
    
    // Format coefficient values for display
    const formatCoefficient = (value: number, precision: number = 2) => {
        const absValue = Math.abs(value);
        const sign = value > 0 ? '+' : '';
        
        if (absValue >= 1e6) {
            return sign + value.toExponential(precision);
        } else if (absValue >= 1000) {
            return sign + value.toLocaleString(undefined, { maximumFractionDigits: precision });
        }
        return sign + value.toFixed(precision);
    };

    return (
        <div className="fixed inset-0 bg-main-dark text-white flex flex-col overflow-y-auto overflow-x-hidden">
            {/* Blurry Bubbles */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.5, 0.7, 0.5] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-20 -right-20 w-[20rem] h-[20rem] bg-main-yellow rounded-full filter blur-[120px] opacity-50 z-0"></motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.7, 0.9, 0.7] }} transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-20 -left-20 w-[20rem] h-[20rem] bg-main-blue rounded-full filter blur-[120px] opacity-50 z-0"></motion.div>

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="z-50"
            >
                <Card className="bg-transparent mt-4 w-full p-5 pb-3">
                    <CardContent className="flex items-center items-center justify-between w-full">
                        <div className="flex flex-col w-[40%]">
                            <div className="flex items-center gap-5 mb-1">
                                <div className="p-2 bg-gradient-to-br from-main-blue/20 to-main-yellow/20 border border-white/10 rounded-xl">
                                    <Sparkle className="w-8 h-8 text-primary text-white" />
                                </div>
                                <h1 className="text-5xl font-semibold leading-tight mb-1.5 text-white">
                                    training summary.
                                </h1>
                            </div>
                            <h1 className="text-white">
                                model final result and statistic displayed below
                            </h1>
                        </div>
                        <div className="flex space-x-4 w-[50%] justify-end text-white">
                            <div className="bg-gradient-to-r from-white/10 to-white/5 border-b border-white/10 p-4 bg-white/20 w-[50%] rounded-2xl text-2xl font-bold px-5">
                                <span className="flex items-center gap-2 font-normal mb-1 text-base text-white/80">
                                    <img
                                        src={Model}
                                        className="h-5"
                                        draggable="false"
                                        alt="Model"
                                    />
                                    Model
                                </span>
                                {summary.model}
                            </div>
                            <div className="bg-gradient-to-r from-white/10 to-white/5 border-b border-white/10 p-4 bg-white/20 w-[50%] rounded-2xl text-2xl font-bold px-5">
                                <span className="flex items-center gap-2 font-normal mb-1 text-base text-white/80">
                                    <img
                                        src={Session}
                                        className="h-5"
                                        draggable="false"
                                        alt="Session"
                                    />
                                    Session
                                </span>
                                {id?.slice(0, 15)}...
                            </div>
                        </div>
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
                    <CardContent className="flex items-stretch justify-between w-full text-white space-x-4">
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="border border-white/20 rounded-2xl flex flex-col w-[30%] bg-white/10 p-6 pb-8 px-8"
                        >
                            <h1 className="text-xl font-semibold mb-1 flex items-center gap-3">
                                Model training time
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger>
                                        <Info className="h-4 w-4 text-white/60 hover:text-white/80 transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-white text-black max-w-[200px]">
                                        <p>Breakdown of time spent in each phase of the MPC-PPML training process</p>
                                    </TooltipContent>
                                </Tooltip>
                            </h1>
                            <h1 className="text-sm text-white/80 mb-4">Time spent on each milestone training process.</h1>
                            <div className="flex-1 flex items-center justify-center">
                                <ChartPieInteractive timeData={summary.milestoneData}/>
                            </div>
                            
                            {/* Training Summary */}
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <h2 className="text-sm font-medium text-white mb-3">Time Statistics</h2>
                                <div className="space-y-3">
                                    <div className="bg-gradient-to-br from-white/10 via-white/10 to-white/5 border border-white/20 rounded-xl px-4 p-3">
                                        <h3 className="text-sm font-medium text-white mb-2">Performance Summary</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-white/60">Total time</span>
                                                <span className="text-white font-medium">{formatDuration(summary.milestoneData.reduce((a, b) => a + b.time, 0))}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-white/60">Avg. per phase</span>
                                                <span className="text-white font-medium">
                                                    {formatDuration(summary.milestoneData.reduce((a, b) => a + b.time, 0) / summary.milestoneData.length)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-br from-white/10 via-white/10 to-white/5 border border-white/20 rounded-xl px-4 p-3">
                                        <h3 className="text-sm font-medium text-white mb-2">Critical Phases</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-white/60">Longest</span>
                                                <span className="text-white font-medium">
                                                    {summary.milestoneData.reduce((max, phase) => phase.time > max.time ? phase : max).phase}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-white/60">Fastest</span>
                                                <span className="text-white font-medium">
                                                    {summary.milestoneData.reduce((min, phase) => phase.time < min.time ? phase : min).phase}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="flex flex-col flex-1 space-y-4"
                        >
                            <div className="border border-white/20 rounded-2xl flex flex-col bg-white/10 p-6 pb-8 px-8 flex-1">
                                <h1 className="text-xl font-semibold mb-1 flex items-center gap-3">
                                    Model statistic
                                    <Tooltip delayDuration={0}>
                                        <TooltipTrigger>
                                            <Info className="h-4 w-4 text-white/60 hover:text-white/80 transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white text-black max-w-[200px]">
                                            <p>Performance metrics and hyperparameters from the federated learning model</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </h1>
                                <h1 className="text-sm mb-6 text-white/80">Metrics and training parameters used and produced during model training.</h1>
                                <div className="flex flex-col gap-2.5">
                                    {buildStatsFromSummary(summary, config).map((stat, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm"
                                        >
                                            <div className="flex items-center gap-3 text-white">
                                                {stat.icon}
                                                <span>{stat.label}</span>
                                            </div>
                                            <div className="text-right font-medium text-white tabular-nums">
                                                {stat.value}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="border border-white/20 rounded-2xl flex flex-col bg-white/10 p-6 pb-8 px-8 flex-1">
                                <h1 className="text-xl font-semibold mb-1 flex items-center gap-3">
                                    Process Model
                                    <Tooltip delayDuration={0}>
                                        <TooltipTrigger>
                                            <Info className="h-4 w-4 text-white/60 hover:text-white/80 transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white text-black max-w-[200px]">
                                            <p>Save the trained model so it could be use to predict other data</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </h1>
                                <h1 className="text-sm mb-6 text-white/80">Export and test your trained model with new data.</h1>
                                
                                {/* Model info */}
                                <div className="mb-6 space-y-3">
                                    <div className="bg-gradient-to-br from-white/10 via-white/10 to-white/5 border border-white/20 rounded-xl px-4 p-3">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-white/60">Model size</span>
                                            <span className="text-white font-medium">{summary.modelSize || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/60">Format</span>
                                            <span className="text-white font-medium">Pickle (.pkl)</span>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-white/10 via-white/10 to-white/5 border border-white/20 rounded-xl px-4 p-3">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-white/60">Parties involved</span>
                                            <span className="text-white font-medium">{config.parties}</span>     
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/60">Privacy preserved</span>
                                            <span className="text-green-400 font-medium">✓ Yes</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-2 mt-auto">
                                    <Button className="w-full bg-gradient-to-r from-white/30 to-white/20 hover:from-white/20 hover:to-white/10 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2" onClick={handleSave}>
                                        <Download className="h-4 w-4" />
                                        Save model to .pkl
                                    </Button>
                                    <Button className="w-full bg-gradient-to-r from-main-blue to-main-blue/80 hover:from-main-blue/90 hover:to-main-blue/70 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2" onClick={() => navigate(`/test/${id}`)}>
                                        <FlaskConical className="h-4 w-4" />
                                        Test model using your data
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="flex flex-col w-[40%] flex-1 space-y-4"
                        >
                            <div className="border border-white/20 rounded-2xl flex flex-col bg-white/10 p-6 pb-8 px-8 flex-1">
                                <h1 className="text-xl font-semibold mb-1 flex items-center gap-3">
                                    Evaluation report
                                    <Tooltip delayDuration={0}>
                                        <TooltipTrigger>
                                            <Info className="h-4 w-4 text-white/60 hover:text-white/80 transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white text-black max-w-[200px]">
                                            <p>{isLogisticRegression ? "ROC curve showing model's ability to distinguish between classes" : "Visual comparison of actual vs predicted values with regression analysis"}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </h1>
                                <h1 className="text-sm mb-6 text-white/80">Calculated for <span className="text-white font-semibold">{config.dataCount}</span> data points, gathered from <span className="text-white font-semibold">{config.parties}</span> different parties.</h1>
                                {isLogisticRegression && aucRocData ? (
                                    <ChartAucRoc data={aucRocData} />
                                ) : (
                                    <ChartLineLinear data={actualVsPredicted} />
                                )}
                            </div>
                            <div className="border border-white/20 rounded-2xl flex flex-col bg-white/10 p-6 pb-8 px-8 flex flex-col flex-1">
                                <h1 className="text-xl font-semibold mb-1 flex items-center gap-3">
                                    Model Weight
                                    <Tooltip delayDuration={0}>
                                        <TooltipTrigger>
                                            <Info className="h-4 w-4 text-white/60 hover:text-white/80 transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white text-black max-w-[200px]">
                                            <p>Learned feature weights and coefficients from the trained model</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </h1>
                                <h1 className="text-sm mb-6 text-white/80">Feature importance and coefficients learned during training.</h1>
                                
                                {/* Feature importance preview */}
                                <div className="space-y-3 mb-6">
                                    {coefficients.filter(c => c.type === 'feature').slice(0, 3).map((coef, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`min-w-[8px] w-2 h-2 rounded-full flex-shrink-0 ${coef.value < 0 ? 'bg-red-500' : 'bg-main-blue'}`} />
                                                <span className="text-sm text-white/80">{coef.feature.replace('_', ' ')}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-white tabular-nums text-right" style={{ minWidth: '90px' }}>
                                                    {formatCoefficient(coef.value)}
                                                </span>
                                                <div className={`h-2 rounded-full ${coef.value < 0 ? 'bg-red-500/50' : 'bg-main-blue/50'}`} style={{
                                                    width: `${normalizeCoefficient(coef.value)}px`,
                                                    maxWidth: '200px'
                                                }} />
                                            </div>
                                        </div>
                                    ))}
                                    {coefficients.filter(c => c.type === 'feature').length > 3 && (
                                        <div className="text-sm text-white/60 text-center">
                                            +{coefficients.filter(c => c.type === 'feature').length - 3} more features
                                        </div>
                                    )}
                                </div>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="w-full bg-gradient-to-r from-main-yellow/80 to-main-yellow/60 hover:from-main-yellow/70 hover:to-main-yellow/50 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
                                            <Eye className="h-4 w-4" />
                                            View All Parameters
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-main-dark border border-white/20 text-white max-w-lg">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-semibold text-white">Model Parameters</DialogTitle>
                                            <DialogDescription className="text-white/60">
                                                Coefficient values for each feature in the {summary.model} model
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="mt-2">
                                            <div className={`space-y-4 ${coefficients.length > 3 ? 'max-h-[300px] overflow-y-auto pr-2' : ''}`}>
                                                {coefficients.map((coef, index) => {
                                                    const featureIndex = coefficients.slice(0, index).filter(c => c.type === 'feature').length + 1;
                                                    return (
                                                        <div 
                                                            key={index} 
                                                            className="bg-white/10 rounded-lg p-4 flex items-center justify-between hover:bg-white/15 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`min-w-[40px] w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                                    coef.type === 'label' ? 'bg-main-yellow/20' : 'bg-main-blue/20'
                                                                }`}>
                                                                    <span className={`font-semibold ${
                                                                        coef.type === 'label' ? 'text-main-yellow' : 'text-main-blue'
                                                                    }`}>{coef.type === 'label' ? 'β₀' : featureIndex}</span>
                                                                </div>
                                                            <div>
                                                                <h3 className="font-medium text-white capitalize">{coef.feature.replace('_', ' ')}</h3>
                                                                <p className="text-sm text-white/60">
                                                                    {coef.type === 'label' ? 'Model intercept' : 'Feature coefficient'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-2xl font-bold text-white tabular-nums">
                                                                {formatCoefficient(coef.value, 3)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="mt-6 pt-4 border-t border-white/10">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-white/60">Total features</span>
                                                    <span className="font-medium text-white">{coefficients.filter(c => c.type === 'feature').length}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm mt-2">
                                                    <span className="text-white/60">Model type</span>
                                                    <span className="font-medium text-white">{summary.model}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
