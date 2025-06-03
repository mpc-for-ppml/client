import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import confetti from 'canvas-confetti';
import { useProgress } from '@/hooks';
import { ProgressMessage } from '@/types';
import { Button } from '@/components';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, Sparkles, Copy, Check, Terminal, Activity, Clock, Info, ChevronUp, ChevronDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const milestones = [
    { label: "Data Preprocessing", keyword: "Applied", icon: "🔄", color: "blue" },
    { label: "Secure ID Exchange", keyword: "Received", icon: "🔐", color: "purple" },
    { label: "Data Intersection", keyword: "Found", icon: "🔍", color: "indigo" },
    { label: "Privacy Data Filtering", keyword: "Completed", icon: "🛡️", color: "pink" },
    { label: "Model Initialization", keyword: "Loaded", icon: "🚀", color: "orange" },
    { label: "Federated Training", keyword: "Training complete", icon: "🧠", color: "yellow" },
    { label: "Model Evaluation", keyword: "Evaluation complete", icon: "📊", color: "green" },
    { label: "Result Aggregation", keyword: "MPyC task complete", icon: "✨", color: "cyan" },
];

export const Log: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { messages }: { messages: ProgressMessage[] } = useProgress();
    const logEndRef = useRef<HTMLDivElement | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const [messageRefs, setMessageRefs] = useState<(HTMLDivElement | null)[]>([]);
    const [showCompletionDialog, setShowCompletionDialog] = useState(false);
    const [hasTriggeredCompletion, setHasTriggeredCompletion] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        if (!id) {
            toast.error('Session invalid!');
            navigate("/");
        }
    }, []);

    const handleCopySessionId = () => {
        if (id) {
            navigator.clipboard.writeText(id);
            setCopied(true);
            toast.success("Session ID copied!");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Check which milestones have been reached based on keywords
    // Find the highest milestone reached
    let highestMilestoneIndex = -1;
    milestones.forEach((milestone, index) => {
        const isReached = messages.some(({ message }) => 
            message.includes("✅") && message.includes(milestone.keyword)
        );
        if (isReached) {
            highestMilestoneIndex = index;
        }
    });
    
    // Mark all milestones up to the highest one as reached
    const reached = milestones.map((_, idx) => idx <= highestMilestoneIndex);
    
    // Count how many milestones have been reached
    const reachedCount = highestMilestoneIndex + 1;
    
    // Check if MPC task is completed
    useEffect(() => {
        const isMPCCompleted = messages.some(msg => 
            msg.message.includes("MPyC task complete") && msg.message.includes("✅")
        );
        
        if (isMPCCompleted && !hasTriggeredCompletion) {
            setHasTriggeredCompletion(true);
            setShowCompletionDialog(true);
            
            // Trigger confetti
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

            function randomInRange(min: number, max: number) {
                return Math.random() * (max - min) + min;
            }

            const interval: any = setInterval(function() {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                // since particles fall down, start a bit higher than random
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
                });
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
                });
            }, 250);
        }
    }, [messages, hasTriggeredCompletion]);

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
        <div className="fixed inset-0 bg-main-dark text-white overflow-hidden">
            {/* Animated Blurry Bubbles */}
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: [0.3, 0.5, 0.3] }} 
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} 
                className="absolute -top-20 -right-20 w-[30rem] h-[30rem] bg-main-yellow rounded-full filter blur-[120px] opacity-50 z-0"
            />
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: [0.5, 0.7, 0.5] }} 
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} 
                className="absolute -bottom-20 -left-20 w-[30rem] h-[30rem] bg-main-blue rounded-full filter blur-[120px] opacity-50 z-0"
            />

            {/* Main Container */}
            <div className="relative z-10 h-full flex flex-col px-8 max-w-7xl mx-auto">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="pt-6 pb-4"
                >                    
                    <div className="flex items-center gap-3 my-2 mt-4">
                        <div className="p-2 bg-gradient-to-br from-main-blue/20 to-main-yellow/20 border border-white/10 rounded-xl">
                            <Terminal className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-semibold">
                            training progress.
                        </h1>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger>
                                <Info className="h-5 w-5 text-white/40 hover:text-white/60 transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-white text-black max-w-[200px]">
                                <p>Real-time logs from the secure multi-party computation training process</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <p className="text-white/60 text-base">
                        monitor your model's federated learning journey in real-time
                    </p>
                </motion.div>

                {/* Progress Timeline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                        opacity: 1, 
                        y: 0,
                        height: isCollapsed ? "auto" : "auto"
                    }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-6 z-50 rounded-xl"
                >
                    <Card className="bg-white/5 border border-white/10 backdrop-blur-sm z-50 rounded-xl overflow-hidden">
                        <CardContent className="p-6 z-50 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <Activity className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg text-white font-semibold">Training Milestones</h3>
                                    </div>
                                    <div className="ml-2 flex items-center gap-2 text-sm text-white/60">
                                        <Clock className="w-4 h-4" />
                                        <span>{reachedCount} of {milestones.length} completed</span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsCollapsed(!isCollapsed)}
                                    className="text-white/60 hover:text-white hover:bg-white/10 px-2 py-1"
                                >
                                    {isCollapsed ? (
                                        <>
                                            <ChevronDown className="w-4 h-4 mr-1" />
                                            Expand
                                        </>
                                    ) : (
                                        <>
                                            <ChevronUp className="w-4 h-4 mr-1" />
                                            Collapse
                                        </>
                                    )}
                                </Button>
                            </div>
                            
                            {/* Enhanced Progress Bar */}
                            <motion.div 
                                className="relative overflow-hidden pt-1"
                                initial={false}
                                animate={{ 
                                    height: isCollapsed ? 0 : "auto",
                                    opacity: isCollapsed ? 0 : 1,
                                    marginTop: isCollapsed ? 0 : 8
                                }}
                                transition={{ 
                                    duration: 0.3,
                                    ease: "easeInOut"
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    {milestones.map((milestone, idx) => (
                                        <motion.div
                                            key={milestone.label}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ 
                                                opacity: 1, 
                                                scale: reached[idx] ? 1 : 0.9,
                                            }}
                                            transition={{ 
                                                duration: 0.5, 
                                                delay: idx * 0.1,
                                                type: "spring",
                                                stiffness: 200
                                            }}
                                            className="flex flex-col items-center relative z-10"
                                            style={{ width: `${100 / milestones.length}%` }}
                                        >
                                            {/* Milestone Icon Circle */}
                                            <div className={`relative ${reached[idx] && !reached[idx + 1] ? "animate-pulse" : ""}`}>
                                                <div className={`
                                                    w-12 h-12 rounded-full flex items-center justify-center text-lg
                                                    transition-all duration-500 transform backdrop-blur-xl 
                                                    ${reached[idx] 
                                                        ? "bg-gradient-to-br from-main-blue/20 to-main-yellow/10 border-2 border-main-blue/50 scale-110" 
                                                        : "bg-white/10 border border-white/20"
                                                    }
                                                    ${reached[idx] && !reached[idx + 1] ? "shadow-lg shadow-main-blue/50" : ""}
                                                `}>
                                                    <span className={reached[idx] ? "" : "opacity-50"}>
                                                        {milestone.icon}
                                                    </span>
                                                </div>
                                                {reached[idx] && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                                                    >
                                                        <Check className="w-3 h-3 text-white" />
                                                    </motion.div>
                                                )}
                                            </div>
                                            
                                            {/* Label */}
                                            <span className={`text-xs mt-2 text-center max-w-[100px] leading-tight transition-colors duration-300 ${
                                                reached[idx] ? "text-white font-medium" : "text-white/50"
                                            }`}>
                                                {milestone.label}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                                
                                {/* Background Progress Line */}
                                <div className="absolute top-6 left-0 right-0 h-0.5 bg-white/10" style={{
                                    left: `${50 / milestones.length}%`,
                                    right: `${50 / milestones.length}%`
                                }} />
                                
                                {/* Active Progress Line */}
                                {reachedCount > 1 && (
                                    <motion.div 
                                        className="absolute top-6 h-0.5 bg-gradient-to-r from-main-blue to-main-yellow"
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${Math.min(
                                                (reachedCount - 1) * (100 - (100 / milestones.length)) / (milestones.length - 1),
                                                100 - (100 / milestones.length)
                                            )}%`
                                        }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        style={{
                                            left: `${50 / milestones.length}%`,
                                        }}
                                    />
                                )}
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Enhanced Logs Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex-1 overflow-hidden z-50 mb-8"
                >
                    <Card className="bg-white/5 border border-white/10 backdrop-blur-sm h-full z-50 rounded-xl">
                        <CardContent className="p-6 h-full flex flex-col rounded-xl z-50">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-lg">
                                        <Terminal className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg text-white font-semibold">Live Logs</h3>
                                        <p className="text-sm text-white/60">Real-time training updates</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-white/60">Active</span>
                                    </div>
                                    <div className="text-white/40">
                                        {messages.length} entries
                                    </div>
                                </div>
                            </div>
                            
                            {/* Log Container */}
                            <div className="flex-1 bg-black/20 rounded-xl border border-white/10 p-4 overflow-hidden">
                                <div 
                                    ref={scrollContainerRef}
                                    className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent flex flex-col-reverse"
                                >
                                    <div ref={logEndRef} />
                                    {messages.length === 0 ? (
                                        <div className="flex space-x-4 items-center justify-center h-full">
                                            <div className="text-center">
                                                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full">
                                                    <Clock className="w-4 h-4 text-white/40" />
                                                </div>
                                            </div>
                                            <div className="text-start">
                                                <p className="text-white/60">Waiting for training to begin...</p>
                                                <p className="text-sm text-white/40 mt-1">Logs will appear here in real-time</p>
                                            </div>
                                        </div>
                                    ) : (
                                        [...messages].reverse().map(({ message, timestamp }, idx) => {
                                            const originalIdx = messages.length - 1 - idx;
                                            const isSuccess = message.includes("✅");
                                            const isError = message.includes("🛑");
                                            const isMilestone = milestones.some(m => message.includes(m.keyword));
                                            
                                            return (
                                                <motion.div 
                                                    key={originalIdx}
                                                    ref={el => messageRefs[originalIdx] = el}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className={`
                                                        text-sm font-mono py-2 px-3 rounded-lg mb-2 transition-all duration-300
                                                        ${isSuccess ? "bg-green-500/10 border border-green-500/20 text-green-400" :
                                                          isError ? "bg-red-500/10 border border-red-500/20 text-red-400" :
                                                          isMilestone ? "bg-white/5 border border-white/10 text-white/90" :
                                                          "text-white/50"}
                                                    `}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <span className="text-white/30 text-xs shrink-0">
                                                            {new Date(timestamp).toLocaleTimeString()}
                                                        </span>
                                                        <span className="break-all">
                                                            {message.replace(/\[Party \d+\] /g, "")}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
            
            {/* Floating Info Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.6, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="absolute bottom-16 left-8 z-0"
            >
                <Card className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl w-48 p-4 opacity-70">
                    <CardContent className="p-0">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-blue-400/20 rounded border border-blue-400/30">
                                <Info className="w-3 h-3 text-blue-400" />
                            </div>
                            <h4 className="text-sm font-semibold text-white">Secure MPC</h4>
                        </div>
                        <p className="text-xs text-white/70">Multi-party computation ensures data privacy</p>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.6, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="absolute top-24 right-8 z-0"
            >
                <Card className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl w-52 p-4 opacity-70">
                    <CardContent className="p-0">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-purple-400/20 rounded border border-purple-400/30">
                                <Activity className="w-3 h-3 text-purple-400" />
                            </div>
                            <h4 className="text-sm font-semibold text-white">Real-time Progress</h4>
                        </div>
                        <p className="text-xs text-white/70">Monitor training milestones as they complete</p>
                    </CardContent>
                </Card>
            </motion.div>
            
            {/* Enhanced Completion Dialog */}
            <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
                <DialogContent className="bg-gradient-to-b from-main-dark via-main-dark to-black border border-white/20 text-white max-w-md backdrop-blur-xl">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", duration: 0.5 }}
                    >
                        <DialogHeader>
                            <div className="flex items-center justify-center mb-2">
                                <motion.div
                                    initial={{ rotate: -180, scale: 0 }}
                                    animate={{ rotate: 0, scale: 1 }}
                                    transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
                                    className="relative"
                                >
                                    <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="w-12 h-12 text-green-400" />
                                    </div>
                                    <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
                                </motion.div>
                            </div>
                            <DialogTitle className="text-2xl font-semibold text-white text-center">
                                Training Completed Successfully!
                            </DialogTitle>
                            <DialogDescription className="text-white/70 text-center mt-3 px-4">
                                Your model has been trained using secure multi-party computation. 
                                Privacy preserved
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-6 space-y-4">
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-xl p-4"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                            <span className="text-sm text-white/70">Training Status</span>
                                        </div>
                                        <span className="text-sm text-green-400 font-semibold">Completed</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-white/70">Session ID</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-white font-mono">{id?.slice(0, 16)}...</span>
                                            <button
                                                onClick={handleCopySessionId}
                                                className="p-1 rounded hover:bg-white/10 transition-colors"
                                                title="Copy full Session ID"
                                            >
                                                {copied ? 
                                                    <Check className="w-3 h-3 text-green-400" /> : 
                                                    <Copy className="w-3 h-3 text-white/60" />
                                                }
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-white/70">Total Time</span>
                                        <span className="text-sm text-white font-medium">
                                            {messages.length > 0 ? 
                                                `${Math.floor((Date.now() - new Date(messages[0].timestamp).getTime()) / 60000)} min` : 
                                                'N/A'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                            
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-3"
                            >
                                <div className="flex items-start gap-3">
                                    <Info className="w-4 h-4 text-yellow-400 mt-0.5" />
                                    <div className="text-xs text-yellow-200/80">
                                        <p className="font-medium mb-1">Pro tip:</p>
                                        <p>Save your Session ID to access results anytime at:</p>
                                        <code className="text-yellow-300 bg-black/30 px-1 py-0.5 rounded mt-1 inline-block">
                                            /result/{id?.slice(0, 8)}...
                                        </code>
                                    </div>
                                </div>
                            </motion.div>
                            
                            <div className="flex flex-col gap-3 pt-2">
                                <Button 
                                    className="w-full bg-gradient-to-r from-main-blue to-main-blue/80 hover:from-main-blue/90 hover:to-main-blue/70 text-white font-semibold transition-all duration-300"
                                    onClick={() => navigate(`/result/${id}`)}
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    View Training Results
                                </Button>
                                <Button 
                                    variant="ghost"
                                    className="w-full text-white/70 hover:text-white hover:bg-white/10"
                                    onClick={() => setShowCompletionDialog(false)}
                                >
                                    Continue Monitoring Logs
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
