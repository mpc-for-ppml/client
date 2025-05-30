import React, { useEffect, useRef, useState } from 'react';
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
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const [messageRefs, setMessageRefs] = useState<(HTMLDivElement | null)[]>([]);

    // Filter logs that contain a green check
    const successLogs = messages.filter(({ message }) => message.includes("✅"));

    // Check if each milestone is reached in order based on logs
    const reached = milestones.map((_, idx) => idx < successLogs.length);

    // Update refs array when messages change
    useEffect(() => {
        setMessageRefs(refs => 
            Array(messages.length).fill(null).map((_, i) => refs[i] || null)
        );
    }, [messages.length]);

    // Scroll to newest message (bottom)
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
            // Recalculate opacity after scroll completes
            setTimeout(() => {
                updateOpacities();
            }, 100);
        }
    }, [messages]);

    // Calculate opacity based on element position
    const calculateOpacity = (element: HTMLElement | null): number => {
        if (!element || !scrollContainerRef.current) return 1;
        
        const containerRect = scrollContainerRef.current.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        // Distance from top of container
        const distanceFromTop = elementRect.top - containerRect.top;
        
        // Fade zone is top 100px of container
        const fadeZone = 100;
        
        if (distanceFromTop < 0) return 0.2; // Above visible area
        if (distanceFromTop > fadeZone) return 1; // Below fade zone
        
        // Linear fade from 0.2 to 1 within fade zone
        return 0.2 + (0.8 * (distanceFromTop / fadeZone));
    };

    // Update all message opacities
    const updateOpacities = () => {
        messageRefs.forEach((ref) => {
            if (ref) {
                ref.style.opacity = calculateOpacity(ref).toString();
            }
        });
    };

    // Update opacity on scroll
    useEffect(() => {
        const handleScroll = () => {
            updateOpacities();
        };

        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            // Delay initial calculation to ensure proper layout
            setTimeout(() => {
                updateOpacities();
            }, 100);
        }

        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, [messageRefs]);

    return (
        <div className="fixed inset-0 bg-main-dark text-white flex flex-col">
            {/* Blurry Bubbles */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-20 -right-20 w-[30rem] h-[30rem] bg-main-yellow rounded-full filter blur-[120px] opacity-50 z-0"></motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-20 -left-20 w-[30rem] h-[30rem] bg-main-blue rounded-full filter blur-[120px] opacity-50 z-0"></motion.div>

            {/* Fixed Header Section */}
            <div className="flex-shrink-0 z-30">
                <Card className="w-full max-w-6xl mx-auto p-4 mt-8 bg-transparent text-white">
                    <h2 className="text-2xl md:text-3xl mb-8 font-semibold text-white leading-tight text-center">model training</h2>

                    {/* Horizontal Progress Bar */}
                    <div className="relative w-full max-w-5xl mx-auto">
                        {/* Container for dots and lines */}
                        <div className="relative">
                            {/* Background line */}
                            <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-300" />
                            
                            {/* Progress line */}
                            {successLogs.length > 0 && (
                                <div 
                                    className="absolute top-3 left-0 h-0.5 bg-main-yellow transition-all duration-500"
                                    style={{
                                        width: `${(successLogs.length - 1) * (100 / (milestones.length - 1))}%`
                                    }}
                                />
                            )}
                            
                            {/* Milestones */}
                            <div className="relative flex items-start justify-between">
                                {milestones.map((milestone, idx) => (
                                    <div 
                                        key={milestone} 
                                        className="flex flex-col items-center flex-1"
                                    >
                                        {/* Dot */}
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 transition-all relative z-10
                                                ${reached[idx] ? "bg-main-yellow border-main-yellow" : "bg-white border-gray-300"}
                                                ${reached[idx] && !reached[idx + 1] ? "scale-110 shadow-lg" : ""}
                                            `}
                                        />
                                        {/* Label */}
                                        <span className="text-xs mt-2 text-center" style={{ width: '90px' }}>
                                            {milestone}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Scrollable Logs Section */}
            <div className="flex-1 px-4 pb-6 overflow-hidden z-50">
                <Card className="w-full max-w-6xl mx-auto pb-6 pt-4 px-4 bg-transparent relative h-full flex flex-col">
                    {/* Gradient overlay at the top - adjusted for transparent background */}
                    {/* <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/60 via-black/30 to-transparent z-10 pointer-events-none" /> */}
                    
                    {/* Log container with padding to account for gradient */}
                    <div 
                        ref={scrollContainerRef}
                        className="font-mono text-sm text-gray-400 flex-1 overflow-y-auto scrollbar-hide flex flex-col-reverse"
                    >
                        <div ref={logEndRef} />
                        {messages.length === 0 ? (
                            <div className="pb-2">No progress yet.</div>
                        ) : (
                            [...messages].reverse().map(({ message, timestamp }, idx) => {
                                const originalIdx = messages.length - 1 - idx;
                                return (
                                    <div 
                                        key={originalIdx}
                                        ref={el => messageRefs[originalIdx] = el}
                                        className={`text-sm font-mono transition-opacity duration-300 pb-1 ${
                                            message.includes("✅") ? "text-green-500" :
                                            message.includes("🛑") ? "text-red-500" :
                                            "text-gray-400"
                                        }`}
                                    >
                                        [{new Date(timestamp).toLocaleTimeString()}] {message.replace("[Party 0] ", "")}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};
