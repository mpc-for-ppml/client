import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import confetti from 'canvas-confetti';
import { useProgress } from '@/hooks';
import { ProgressMessage } from '@/types';
import { Card, Button } from '@/components';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, Sparkles, Copy, Check } from "lucide-react";

const milestones = [
    "Data Normalization",
    "Secure ID Exchange",
    "Data Intersection",
    "Privacy Filtering",
    "Model Initialization",
    "Federated Training",
    "Model Evaluation",
    "Result Aggregation",
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

    // Filter logs that contain a green check
    const successLogs = messages.filter(({ message }) => message.includes("✅"));

    // Check if each milestone is reached in order based on logs
    const reached = milestones.map((_, idx) => idx < successLogs.length);
    
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
        <div className="fixed inset-0 bg-main-dark text-white flex flex-col">
            {/* Blurry Bubbles */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-20 -right-20 w-[30rem] h-[30rem] bg-main-yellow rounded-full filter blur-[120px] opacity-50 z-0"></motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-20 -left-20 w-[30rem] h-[30rem] bg-main-blue rounded-full filter blur-[120px] opacity-50 z-0"></motion.div>

            {/* Fixed Header Section */}
            <div className="flex-shrink-0 z-30">
                <Card className="w-full max-w-6xl mx-auto p-4 mt-8 bg-transparent text-white">
                    <h2 className="text-2xl md:text-3xl mb-8 font-semibold text-white leading-tight text-center">model training</h2>

                    {/* Horizontal Progress Bar */}
                    <div className="relative w-full max-w-5xl mx-auto px-4 overflow-hidden">
                        {/* Container for dots and lines */}
                        <div className="relative">
                            {/* Milestones */}
                            <div className="relative flex items-start justify-between">
                                {milestones.map((milestone, idx) => (
                                    <div 
                                        key={milestone} 
                                        className="flex flex-col items-center"
                                        style={{ width: `${100 / milestones.length}%` }}
                                    >
                                        {/* Dot */}
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 transition-all relative z-10
                                                ${reached[idx] ? "bg-main-yellow border-main-yellow" : "bg-white border-gray-300"}
                                                ${reached[idx] && !reached[idx + 1] ? "scale-110 shadow-lg" : ""}
                                            `}
                                        />
                                        {/* Label */}
                                        <span className="text-xs mt-2 text-center max-w-[80px] leading-tight">
                                            {milestone}
                                        </span>
                                    </div>
                                ))}
                                
                                {/* Background line */}
                                <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-300" style={{
                                    left: `${50 / milestones.length}%`,
                                    right: `${50 / milestones.length}%`
                                }} />
                                
                                {/* Progress line */}
                                {successLogs.length > 1 && (
                                    <div 
                                        className="absolute top-3 h-0.5 bg-main-yellow transition-all duration-500"
                                        style={{
                                            left: `${50 / milestones.length}%`,
                                            width: `${Math.min(
                                                (successLogs.length - 1) * (100 - (100 / milestones.length)) / (milestones.length - 1),
                                                100 - (100 / milestones.length)
                                            )}%`
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Scrollable Logs Section */}
            <div className="flex-1 px-4 pb-6 overflow-hidden z-50">
                <Card className="w-full max-w-6xl mx-auto pb-6 pt-4 px-4 bg-transparent relative h-full flex flex-col">             
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
            
            {/* Completion Dialog */}
            <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
                <DialogContent className="bg-main-dark border border-white/20 text-white max-w-md">
                    <DialogHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="relative">
                                <CheckCircle2 className="w-16 h-16 text-green-400" />
                                <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1" />
                            </div>
                        </div>
                        <DialogTitle className="text-2xl font-semibold text-white text-center">
                            Training Completed! 🎉
                        </DialogTitle>
                        <DialogDescription className="text-white/60 text-center mt-2">
                            Your model has been successfully trained using secure multi-party computation. 
                            The results are now ready for viewing.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-2 space-y-3">
                        <div className="bg-white/10 rounded-lg p-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-white/60">Session ID</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-mono">{id?.slice(0, 18)}...</span>
                                    <button
                                        onClick={handleCopySessionId}
                                        className="text-white/60 hover:text-white transition-colors"
                                        title="Copy full Session ID"
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-white/60">Status</span>
                                <span className="text-green-400 font-medium">✓ Completed</span>
                            </div>
                        </div>
                        <div className="text-xs text-white/50 text-center px-2">
                            <p>Save this Session ID to view your results later at</p>
                            <p className="font-mono mt-1">/result/[your-session-id]</p>
                        </div>
                        <Button 
                            className="w-full bg-main-yellow hover:bg-main-yellow/90 text-black font-medium"
                            onClick={() => navigate(`/result/${id}`)}
                        >
                            View Results
                        </Button>
                        <Button 
                            className="w-full bg-white/20 hover:bg-white/30 text-white"
                            onClick={() => setShowCompletionDialog(false)}
                        >
                            Continue Watching Logs
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
