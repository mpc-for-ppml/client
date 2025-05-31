import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { DivideSquare, Sigma, Activity, Repeat, Info } from "lucide-react"
import Model from "@/assets/icons/model.png";
import Session from "@/assets/icons/session.png";
import { ChartPieInteractive } from "./time";
import { ChartLineLinear } from "./evaluation";

const dummyData = {
    summary: {
        model: "Linear Regression",
        milestoneData: [
            { phase: "Normalization applied", time: 1.2, fill: "#1B4F91" },   // Slightly lighter navy
            { phase: "Data ID list distributed", time: 0.8, fill: "#336699" }, // Mid blue
            { phase: "Intersected data found", time: 1.0, fill: "#005B8F" },   // Cool blue
            { phase: "Data filtering completed", time: 0.6, fill: "#4A80B3" }, // Muted blue
            { phase: "Data loaded to model", time: 1.4, fill: "#003675" },     // Core navy
            { phase: "Training completed", time: 2.5, fill: "#002B5B" },       // Deep navy
            { phase: "Evaluation completed", time: 0.7, fill: "#3C6E91" },     // Soft steel blue
            { phase: "MPC task completed", time: 1.0, fill: "#2F5D88" },       // Desaturated cool blue
        ],
        iterations: 12,
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
        { feature: "age", value: 3.12 },
        { feature: "income", value: 0.52 },
        { feature: "web_visits", value: 1.87 },
    ],
    actualVsPredicted: {
        actual: [100, 150, 200, 250, 300, 350],
        predicted: [110, 145, 195, 260, 310, 340],
    },
};

const buildStatsFromSummary = (summary: typeof dummyData.summary) => [
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
    }
]

export const Result: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { summary, config, coefficients, actualVsPredicted } = dummyData;

    // validate sessionId valid

    return (
        <div className="fixed inset-0 bg-main-dark text-white flex flex-col overflow-y-auto overflow-x-hidden">
            {/* Blurry Bubbles */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ duration: 1 }} className="absolute -bottom-20 -right-20 w-[20rem] h-[20rem] bg-main-yellow rounded-full filter blur-[120px] opacity-50 z-0"></motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} transition={{ duration: 0.25 }} className="absolute -top-20 -left-20 w-[20rem] h-[20rem] bg-main-blue rounded-full filter blur-[120px] opacity-50 z-0"></motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
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
                <Card className="bg-transparent w-full px-5">
                    <CardContent className="flex items-start justify-between align-start w-full text-white space-x-4">
                        <div className="flex flex-col w-[30%] bg-white/10 hover:bg-white/5 p-6 pb-8 px-8 rounded-xl">
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
                            <h1 className="text-sm mb-6 text-white/80">Time spent on each milestone training process.</h1>
                            <ChartPieInteractive timeData={summary.milestoneData}/>
                        </div>
                        <div className="flex flex-col flex-1 bg-white/10 hover:bg-white/5 p-6 pb-8 px-8 rounded-xl">
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
                                {buildStatsFromSummary(summary).map((stat, i) => (
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
                        <div className="flex flex-col w-[40%] bg-white/10 hover:bg-white/5 p-6 pb-8 px-8 rounded-xl">
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
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
