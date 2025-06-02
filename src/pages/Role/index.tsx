import React, { useEffect, useState } from 'react';
import { Copy, Crown, Users, Sparkles, ChevronRight, Info, Hash, UserCheck, PersonStanding } from 'lucide-react';
import { AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from 'uuid';
import { Input, Button, Label } from '@/components';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RoleApi } from '@/api';
import { useNavigate } from 'react-router-dom';
import { SessionData } from '@/hooks/useSession';
import { MAX_PARTICIPANTS } from '@/constant';
import { motion } from "framer-motion";
import Leader from "@/assets/icons/leader.png";
import Participant from "@/assets/icons/participant.png";

export const Role: React.FC = () => {
    const navigate = useNavigate();
    const [userType, setUserType] = useState<'lead' | 'participant' | null>(null);
    const [participantCount, setParticipantCount] = useState(2);
    const [sessionId, setSessionId] = useState('');
    const [userId] = useState(() => uuidv4());
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    // reset when switching roles
    useEffect(() => {
        setSessionId('');
        setCopied(false);
        setError('');
    }, [userType]);

    const handleGenerateSession = async () => {
        setCopied(false);
        try {
            const newSessionId = await RoleApi.createSession(participantCount, userId);
            setSessionId(newSessionId);
        } catch (e: any) {
            setError(e.message);
        }
    };

    const handleProceed = async () => {
        setError('');
        if (!sessionId || !userType) return;

        if (userType === 'participant') {
            // validate session via API
            try {
                const session = await RoleApi.validateSession(sessionId);
                if (session.joined_count >= session.participant_count) {
                    throw new Error('Session is full');
                }
            } catch (e: any) {
                setError(e.message);
                return;
            }
        }

        const session: SessionData = { userType, userId, sessionId, participantCount };
        navigate(`/form/${sessionId}`, { state: { session } });
    };

    return (
        <div className="relative h-screen bg-main-dark text-white overflow-hidden">
            {/* Animated Blurry Bubbles */}
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: [0.3, 0.5, 0.3] }} 
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} 
                className="absolute -bottom-20 -right-20 w-[25rem] h-[25rem] bg-main-yellow rounded-full filter blur-[120px] opacity-50 z-0"
            />
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: [0.5, 0.7, 0.5] }} 
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} 
                className="absolute -top-20 -left-20 w-[30rem] h-[30rem] bg-main-blue rounded-full filter blur-[120px] opacity-50 z-0"
            />
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: [0.2, 0.4, 0.2] }} 
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-main-blue/30 rounded-full filter blur-[150px] opacity-30 z-0"
            />

            <Button
                variant="ghost"
                onClick={() => navigate(`/`)}
                className="absolute top-6 left-8 text-white hover:text-white hover:font-semibold hover:bg-white/10 z-50"
            >
                <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                Back to Home
            </Button>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col h-full px-8 max-w-7xl mx-auto">
                {/* Title Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center pt-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <PersonStanding className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-semibold mb-1">
                        choose your role.
                    </h1>
                    <p className="text-white/60 text-base">
                        Select whether you'll lead or participate in the training session
                    </p>
                </motion.div>

                {/* Cards Section */}
                <motion.div 
                    animate={{ 
                        marginTop: userType ? 0 : 40,
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className={`${userType ? "flex-1" : "mt-10" } flex items-center justify-center`}
                >
                    <div className='flex items-center gap-16 w-full justify-center'>
                        <motion.div className={`flex ${userType ? "space-x-2" : "space-x-6"}`}>
                            {/* Role Selection Cards */}
                            <motion.div
                                animate={{ 
                                    scale: userType === "lead" ? 0.95 : 1,
                                    x: userType && userType !== "lead" ? -20 : 0
                                }}
                                whileHover={{ scale: userType === "lead" ? 0.97 : 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="group"
                            >
                                <motion.div
                                    animate={{
                                        width: userType ? 256 : 288,
                                        height: userType ? 288 : 320
                                    }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                >
                                <Card
                                    className={`w-full h-full cursor-pointer transition-all duration-500 ${
                                        userType === "lead"
                                            ? "bg-gradient-to-br from-main-blue/30 to-main-blue/20 border-main-blue/50 shadow-lg shadow-main-blue/20"
                                            : "bg-white/10 border-white/20 hover:bg-white/15"
                                    } backdrop-blur-md rounded-2xl hover:rounded-3xl overflow-hidden`}
                                    onClick={() => setUserType("lead")}
                                >
                                    <CardContent className="flex flex-col items-center justify-center h-full p-4">
                                        <div className={`p-3 rounded-full mb-3 transition-all duration-300 ${
                                            userType === "lead" ? "bg-main-blue/20" : "bg-white/10 group-hover:bg-white/20"
                                        }`}>
                                            <Crown className={`w-8 h-8 ${
                                                userType === "lead" ? "text-main-blue" : "text-white/80"
                                            }`} />
                                        </div>
                                        <img
                                            src={Leader}
                                            className={`block ${userType ? "h-20" : "h-24" } mb-3`}
                                            draggable="false"
                                            alt="Leader"
                                        />
                                        <h3 className={`${userType ? "text-lg" : "text-xl" } font-semibold mb-1 ${userType === "lead" ? "text-black" : "text-white"}`}>Leader</h3>
                                        <p className={`text-center ${userType ? "text-xs" : "text-sm" } ${userType === "lead" ? "text-black/60" : "text-white/60"}`}>
                                            Create and manage a training session
                                        </p>
                                    </CardContent>
                                </Card>
                                </motion.div>
                            </motion.div>

                            <motion.div
                                animate={{ 
                                    scale: userType === "participant" ? 0.95 : 1,
                                    x: userType && userType !== "participant" ? 20 : 0
                                }}
                                whileHover={{ scale: userType === "participant" ? 0.97 : 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="group"
                            >
                                <motion.div
                                    animate={{
                                        width: userType ? 256 : 288,
                                        height: userType ? 288 : 320
                                    }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                >
                                <Card
                                    className={`w-full h-full cursor-pointer transition-all duration-500 ${
                                        userType === "participant"
                                            ? "bg-gradient-to-br from-main-yellow/30 to-main-yellow/20 border-main-yellow/50 shadow-lg shadow-main-yellow/20"
                                            : "bg-white/10 border-white/20 hover:bg-white/15"
                                    } backdrop-blur-md rounded-2xl hover:rounded-3xl overflow-hidden`}
                                    onClick={() => setUserType("participant")}
                                >
                                    <CardContent className="flex flex-col items-center justify-center h-full p-4">
                                        <div className={`p-3 rounded-full mb-3 transition-all duration-300 ${
                                            userType === "participant" ? "bg-main-yellow/20" : "bg-white/10 group-hover:bg-white/20"
                                        }`}>
                                            <Users className={`w-8 h-8 ${
                                                userType === "participant" ? "text-main-yellow" : "text-white/80"
                                            }`} />
                                        </div>
                                        <img
                                            src={Participant}
                                            className={`block ${userType ? "h-20" : "h-24" } mb-3`}
                                            draggable="false"
                                            alt="Participant"
                                        />
                                        <h3 className={`${userType ? "text-lg" : "text-xl" } font-semibold mb-1 ${userType === "participant" ? "text-black" : "text-white"}`}>Participant</h3>
                                        <p className={`text-center ${userType ? "text-xs" : "text-sm" } ${userType === "participant" ? "text-black/60" : "text-white/60"}`}>
                                            Join an existing training session created
                                        </p>
                                    </CardContent>
                                </Card>
                                </motion.div>
                            </motion.div>
                        </motion.div>

                    {/* Action Panel */}
                        <AnimatePresence>
                        {userType && (
                            <motion.div
                                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 30, scale: 0.95 }}
                                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                                className="w-full max-w-md z-50"
                            >
                            <Card className="bg-white/10 border-white/20 backdrop-blur-md rounded-2xl p-4">
                                <CardContent className="space-y-3 p-3 px-5">
                                    {userType === 'lead' && (
                                        <>
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-1.5 bg-main-blue/20 rounded-lg border border-main-blue/30">
                                                    <Crown className="w-4 h-4 text-main-blue" />
                                                </div>
                                                <div>
                                                    <h3 className="text-base text-white font-semibold">Leader Settings</h3>
                                                    <p className="text-white/60 text-xs">Configure your training session</p>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs font-medium text-white/90">
                                                        Total Participants
                                                    </Label>
                                                    <Tooltip delayDuration={0}>
                                                        <TooltipTrigger>
                                                            <Info className="h-3 w-3 text-white/40 hover:text-white/60 transition-colors" />
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-white text-black max-w-[200px]">
                                                            <p>Number of parties including yourself (min: 2, max: {MAX_PARTICIPANTS})</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <div className="relative">
                                                    <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                                    <Input
                                                        type="number"
                                                        step="any"
                                                        placeholder="2"
                                                        value={participantCount}
                                                        onChange={e => setParticipantCount(
                                                            Math.max(2, Math.min(MAX_PARTICIPANTS, parseInt(e.target.value) || 2))
                                                        )}
                                                        className="bg-black/20 border-white/20 text-white placeholder:text-white/40 focus:border-main-blue focus:bg-black/30 transition-all duration-300 rounded-xl pl-10 py-2 text-sm"
                                                    />
                                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                                        <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                                                            participantCount >= 2 ? 'bg-green-400' : 'bg-white/20'
                                                        }`} />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <Button 
                                                onClick={handleGenerateSession} 
                                                className='w-full bg-gradient-to-r from-main-yellow to-main-yellow/80 hover:from-main-yellow/90 hover:to-main-yellow/70 text-black font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 py-2 text-sm'
                                            >
                                                <Hash className="w-4 h-4" />
                                                Generate Session ID
                                            </Button>
                                            
                                            {sessionId && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="space-y-2"
                                                >
                                                    <div className="relative">
                                                        <Input
                                                            value={sessionId}
                                                            readOnly
                                                            className="bg-black/20 border-white/20 text-white placeholder:text-white/40 transition-all duration-300 rounded-xl pl-4 pr-12 py-2 font-mono text-xs"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => { navigator.clipboard.writeText(sessionId); setCopied(true); }}
                                                            className={`absolute right-3 top-1/2 -translate-y-1/2 transition-all duration-300 ${
                                                                copied ? 'text-green-400' : 'text-white/60 hover:text-white'
                                                            }`}
                                                        >
                                                            <Copy size={16} />
                                                        </button>
                                                    </div>
                                                    {!copied && (
                                                        <p className="text-xs text-main-yellow flex items-center gap-2">
                                                            <Info className="w-3 h-3" />
                                                            Copy your session ID before proceeding
                                                        </p>
                                                    )}
                                                </motion.div>
                                            )}
                                        </>
                                    )}

                                    {userType === 'participant' && (
                                        <>
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-1.5 bg-main-yellow/20 rounded-lg border border-main-yellow/30">
                                                    <Users className="w-4 h-4 text-main-yellow" />
                                                </div>
                                                <div>
                                                    <h3 className="text-base text-white font-semibold">Participant Settings</h3>
                                                    <p className="text-white/60 text-xs">Join an existing session</p>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs font-medium text-white/90">
                                                        Session ID
                                                    </Label>
                                                    <Tooltip delayDuration={0}>
                                                        <TooltipTrigger>
                                                            <Info className="h-3 w-3 text-white/40 hover:text-white/60 transition-colors" />
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-white text-black max-w-[200px]">
                                                            <p>Enter the session ID provided by your leader</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <div className="relative">
                                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                                    <Input
                                                        placeholder="Enter session ID"
                                                        value={sessionId}
                                                        onChange={e => setSessionId(e.target.value)}
                                                        className="bg-black/20 border-white/20 text-white placeholder:text-white/40 focus:border-main-yellow focus:bg-black/30 transition-all duration-300 rounded-xl pl-10 font-mono text-sm py-2"
                                                    />
                                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                                        <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                                                            sessionId ? 'bg-green-400' : 'bg-white/20'
                                                        }`} />
                                                    </div>
                                                </div>
                                                <p className="text-xs text-white/50">
                                                    Example: fd7f1f66-6736-4967-ad80-7fa97634841c
                                                </p>
                                            </div>
                                        </>
                                    )}

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-red-500/10 border border-red-500/20 rounded-xl p-2 px-3"
                                        >
                                            <p className="text-xs text-red-400 flex items-center gap-2">
                                                <Info className="w-3 h-3" />
                                                {error}
                                            </p>
                                        </motion.div>
                                    )}
                                    
                                    <Button
                                        className="w-full bg-gradient-to-r from-main-blue to-main-blue/80 hover:from-main-blue/90 hover:to-main-blue/70 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 py-2 text-sm"
                                        onClick={handleProceed}
                                        disabled={!sessionId || (userType==='lead' && !copied)}
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Proceed to Form
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Floating Info Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 0.6, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="absolute top-24 left-8 z-0"
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
                    className="absolute bottom-16 right-8 z-0"
                >
                    <Card className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl w-52 p-4 opacity-70">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-purple-400/20 rounded border border-purple-400/30">
                                    <Users className="w-3 h-3 text-purple-400" />
                                </div>
                                <h4 className="text-sm font-semibold text-white">Collaborate</h4>
                            </div>
                            <p className="text-xs text-white/70">Train models together without sharing raw data</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};