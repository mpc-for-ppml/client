import React, { useEffect, useRef } from 'react';
import { motion } from "framer-motion";
import { useProgress } from '@/hooks';
import { ProgressMessage } from '@/types';
import { Card } from '@/components';

const milestones = [
    "Normalization applied",
    "Data ID list distributed",
    "Intersected data found",
    "Data filtering completed",
    "Data loaded to model",
    "Training completed",
    "Evaluation completed",
    "MPC task completed",
];

export const Log: React.FC = () => {
    const { messages }: { messages: ProgressMessage[] } = useProgress();
    const logEndRef = useRef<HTMLDivElement | null>(null);

    // Filter logs that contain a green check
    const successLogs = messages.filter(({ message }) => message.includes("✅"));

    // Check if each milestone is reached in order based on logs
    const reached = milestones.map((_, idx) => idx < successLogs.length);

    // Scroll to newest message
    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <div className="relative flex flex-col items-center bg-main-dark justify-center min-h-screen p-4 space-y-6 overflow-hidden text-white">
            <Card className="w-full p-4 items-center justify-center bg-main-dark text-white">
                <h2 className="text-2xl md:text-3xl mb-4 font-semibold text-white leading-tight text-center">model training</h2>

                {/* Horizontal Progress Bar */}
                <div className="relative flex items-center justify-between w-full max-w-5xl mx-auto mt-8 px-4">
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

                {/* Logs */}
                <div className="space-y-1 z-20 mt-8 font-mono text-sm text-start text-gray-400 max-h-80 overflow-y-auto px-20 w-full scrollbar-hide scroll-smooth">
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
                    <div ref={logEndRef} />
                </div>
            </Card>
        </div>
    );
};
