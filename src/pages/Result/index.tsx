import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { DivideSquare, Sigma, Activity, Repeat, Info, Download, FlaskConical, Eye, Database } from "lucide-react"
import Model from "@/assets/icons/model.png";
import Session from "@/assets/icons/session.png";
import { ChartPieInteractive } from "./time";
import { ChartLineLinear } from "./evaluation";
import { Button } from "@/components";

const dummyData = {
    summary: {
        model: "Linear Regression",
        milestoneData: [
            { phase: "Data Normalization", time: 1.2, fill: "#1B4F91" },        // Slightly lighter navy
            { phase: "Secure ID Exchange", time: 0.8, fill: "#336699" },        // Mid blue
            { phase: "Data Intersection", time: 1.0, fill: "#005B8F" },         // Cool blue
            { phase: "Privacy Filtering", time: 0.6, fill: "#4A80B3" },         // Muted blue
            { phase: "Model Initialization", time: 1.4, fill: "#003675" },      // Core navy
            { phase: "Federated Training", time: 2.5, fill: "#002B5B" },        // Deep navy
            { phase: "Model Evaluation", time: 0.7, fill: "#3C6E91" },          // Soft steel blue
            { phase: "Result Aggregation", time: 1.0, fill: "#2F5D88" },        // Desaturated cool blue
        ],
        rmse: 1382.12,
        r2: 0.87,
        epochs: 1000,
        lr: 0.5,
    },
    config: {
        dataCount: 6,
        parties: 3,
    },
    coefficients: [
        { feature: "age", value: 3.12, type: "feature" },
        { feature: "income", value: 0.52, type: "feature" },
        { feature: "web_visits", value: 1.87, type: "feature" },
        { feature: "location_score", value: -0.23, type: "feature" },
        { feature: "engagement_rate", value: 2.45, type: "feature" },
        { feature: "intercept", value: 15.67, type: "label" },
    ],
    actualVsPredicted: {
        actual: [100, 150, 200, 250, 300, 350],
        predicted: [110, 145, 195, 260, 310, 340],
    },
};

const buildStatsFromSummary = (summary: typeof dummyData.summary, config: typeof dummyData.config) => [
    {
        icon: <DivideSquare className="size-4 text-white/80" />,
        label: "RMSE",
        value: summary.rmse.toFixed(3),
    },
    {
        icon: <Sigma className="size-4 text-white/80" />,
        label: "R²",
        value: summary.r2.toFixed(2),
    },
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
]

export const Result: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { summary, config, coefficients, actualVsPredicted } = dummyData;

    // validate sessionId valid

    const handleSave = async () => {
        toast.success("Model downloaded successfully!");
    }

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
                <Card className="bg-transparent mt-4 w-full p-5">
                    <CardContent className="flex items-center items-center justify-between w-full">
                        <div className="flex flex-col w-[40%]">
                            <h1 className="text-5xl font-semibold leading-tight mb-1.5 text-white">
                                training summary.
                            </h1>
                            <h1 className="text-white">
                                model final result and statistic displayed below
                            </h1>
                        </div>
                        <div className="flex space-x-4 w-[50%] justify-end text-white">
                            <div className="p-4 bg-white/20 hover:bg-white/10 w-[50%] rounded-xl text-2xl font-bold px-5">
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
                            <div className="p-4 bg-white/20 hover:bg-white/10 w-[50%] rounded-xl text-2xl font-bold px-5">
                                <span className="flex items-center gap-2 font-normal mb-1 text-base text-white/80">
                                    <img
                                        src={Session}
                                        className="h-5"
                                        draggable="false"
                                        alt="Session"
                                    />
                                    Session
                                </span>
                                {id?.slice(0, 18)}...
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
                            className="flex flex-col w-[30%] bg-white/10 hover:bg-white/5 p-6 pb-8 px-8 rounded-xl"
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
                                    <div className="bg-white/5 rounded-lg p-3">
                                        <h3 className="text-sm font-medium text-white mb-2">Performance Summary</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/60">Total time</span>
                                            <span className="text-white font-medium">{summary.milestoneData.reduce((a, b) => a + b.time, 0).toFixed(1)}s</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/60">Avg. per phase</span>
                                            <span className="text-white font-medium">
                                                {(summary.milestoneData.reduce((a, b) => a + b.time, 0) / summary.milestoneData.length).toFixed(2)}s
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-white/5 rounded-lg p-3">
                                    <h3 className="text-sm font-medium text-white mb-2">Critical Phases</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/60">Longest</span>
                                            <span className="text-white font-medium">
                                                {summary.milestoneData.reduce((max, phase) => phase.time > max.time ? phase : max).phase.split(' ')[0]}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/60">Fastest</span>
                                            <span className="text-white font-medium">
                                                {summary.milestoneData.reduce((min, phase) => phase.time < min.time ? phase : min).phase.split(' ')[0]}
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
                            <div className="bg-white/10 hover:bg-white/5 p-6 pb-8 px-8 rounded-xl flex-1">
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
                                <div className="flex flex-col gap-2">
                                    {buildStatsFromSummary(summary, config).map((stat, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between bg-white/10 rounded-xl px-3 py-2 text-sm"
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
                            <div className="bg-white/10 hover:bg-white/5 p-6 pb-8 px-8 rounded-xl flex flex-col flex-1">
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
                                    <div className="bg-white/5 rounded-lg p-3">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-white/60">Model size</span>
                                            <span className="text-white font-medium">2.4 KB</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/60">Format</span>
                                            <span className="text-white font-medium">Pickle (.pkl)</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-3">
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
                                    <Button className="w-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center gap-2" onClick={handleSave}>
                                        <Download className="h-4 w-4" />
                                        Save model to .pkl
                                    </Button>
                                    <Button className="w-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center gap-2" onClick={handleSave}>
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
                            <div className="bg-white/10 hover:bg-white/5 p-6 pb-8 px-8 rounded-xl flex-1">
                                <h1 className="text-xl font-semibold mb-1 flex items-center gap-3">
                                    Evaluation report
                                    <Tooltip delayDuration={0}>
                                        <TooltipTrigger>
                                            <Info className="h-4 w-4 text-white/60 hover:text-white/80 transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white text-black max-w-[200px]">
                                            <p>Visual comparison of actual vs predicted values with regression analysis</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </h1>
                                <h1 className="text-sm mb-6 text-white/80">Calculated for <span className="text-white font-semibold">{config.dataCount}</span> data points, gathered from <span className="text-white font-semibold">{config.parties}</span> different parties.</h1>
                                <ChartLineLinear data={actualVsPredicted} />
                            </div>
                            <div className="bg-white/10 hover:bg-white/5 p-6 pb-8 px-8 rounded-xl flex flex-col flex-1">
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
                                                <div className="w-2 h-2 rounded-full bg-main-blue" />
                                                <span className="text-sm text-white/80">{coef.feature.replace('_', ' ')}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 bg-main-blue/30 rounded-full" style={{
                                                    width: `${Math.abs(coef.value) * 20}px`
                                                }} />
                                                <span className="text-sm font-medium text-white tabular-nums">
                                                    {coef.value > 0 ? '+' : ''}{coef.value.toFixed(2)}
                                                </span>
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
                                        <Button className="w-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center gap-2">
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
                                                {coefficients.map((coef, index) => (
                                                    <div 
                                                        key={index} 
                                                        className="bg-white/10 rounded-lg p-4 flex items-center justify-between hover:bg-white/15 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                                coef.type === 'label' ? 'bg-main-yellow/20' : 'bg-main-blue/20'
                                                            }`}>
                                                                <span className={`font-semibold ${
                                                                    coef.type === 'label' ? 'text-main-yellow' : 'text-main-blue'
                                                                }`}>{coef.type === 'label' ? 'β₀' : index + 1}</span>
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
                                                                {coef.value > 0 ? '+' : ''}{coef.value.toFixed(3)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
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
