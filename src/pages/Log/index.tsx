import React from 'react';
import { useNavigate } from 'react-router-dom';
// import { motion } from "framer-motion";
import { useProgress } from '@/hooks';
import { Button } from '@/components';
import { ProgressMessage } from '@/types';

const milestones = [
    "Normalization applied",
    "Data ID list distributed",
    "Data intersection found",
    "Data filtered",
    "Data loaded to model",
    "Training completed",
    "Evaluation completed",
    "MPC task completed",
];

export const Log: React.FC = () => {
    const navigate = useNavigate();
    const { messages }: { messages: ProgressMessage[] } = useProgress();

    // Filter logs that contain a green check
    const successLogs = messages.filter(({ message }) => message.includes("✅"));

    // Check if each milestone is reached in order based on logs
    const reached = milestones.map((_, idx) => idx < successLogs.length);

    return (
        <div className="relative min-h-screen w-full bg-main-dark text-white overflow-hidden">
            <h2 className="text-xl font-bold mb-4">🧠 Module Progress</h2>

            {/* Horizontal Progress Bar */}
            <div className="relative flex items-center justify-between w-full mb-6 px-3">
                {/* Connector Line Behind Dots */}
                <div className="absolute top-3 left-6 right-6 h-0.5 z-0 flex">
                    {milestones.slice(1).map((_, idx) => (
                        <div
                            key={idx}
                            className={`flex-1 transition-all ${
                                reached[idx + 1] ? "bg-main-yellow" : "bg-gray-300"
                        }`}
                        />
                    ))}
                </div>

                {/* Milestones */}
                {milestones.map((milestone, idx) => (
                    <div key={milestone} className="relative z-10 flex flex-col items-center flex-1 text-center">
                        {/* Dot */}
                        <div
                            className={`w-6 h-6 rounded-full border-2 transition-all
                                ${reached[idx] ? "bg-main-yellow border-main-yellow" : "bg-white border-gray-300"}
                                ${reached[idx] && !reached[idx + 1] ? "scale-110 shadow" : ""}
                            `}
                        />
                        {/* Label */}
                        <span className="text-xs mt-2 max-w-[90px] break-words">
                            {milestone}
                        </span>
                    </div>
                ))}
            </div>

            {/* Optional Raw Logs */}
            <div className="space-y-1 font-mono text-sm text-start text-gray-400 max-h-40 overflow-y-auto">
                {messages.length === 0 && <div>No progress yet.</div>}
                {messages.map(({ message, timestamp }, idx) => (
                    <div key={idx} className={`text-sm font-mono ${
                        message.includes("✅") ? "text-green-500" :
                        message.includes("🛑") ? "text-red-500" :
                        "text-gray-400"
                    }`}>
                        [{new Date(timestamp).toLocaleTimeString()}] {message.replace("[Party 0] ", "")}
                    </div>
                ))}
            </div>

            <Button onClick={() => navigate("/")}>Go Back</Button>
        </div>
    );
};
