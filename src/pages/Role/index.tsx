import React, { useEffect, useState } from 'react';
import { Copy } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Input, Button, Label } from '@/components';
import { Card, CardContent } from '@/components/ui/card';
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
        setSessionId(uuidv4());
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
        <div className="relative flex flex-col items-center bg-main-dark justify-center min-h-screen p-4 space-y-6 overflow-hidden">
            {/* Blurry Bubbles */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ duration: 1 }} className="absolute -bottom-20 -right-20 w-[20rem] h-[20rem] bg-main-yellow rounded-full filter blur-[120px] opacity-50 z-0"></motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} transition={{ duration: 0.25 }} className="absolute -top-20 -left-20 w-[20rem] h-[20rem] bg-main-blue rounded-full filter blur-[120px] opacity-50 z-0"></motion.div>

            <Button
                variant="ghost"
                onClick={() => navigate(`/`)}
                className="absolute top-3 left-8 mb-1 w-40 text-white"
            >
                ← &nbsp; Back to Home
            </Button>

            <Card className="w-full max-w-lg p-4 bg-main-dark z">
                <CardContent className="space-y-4 z-10">
                    <h1 className="text-2xl md:text-3xl text-center font-semibold leading-tight mb-8 text-white ">choose your role.</h1>
                    <div className="flex space-x-10">
                        <Button
                            className={
                                `flex flex-col w-52 rounded-xl py-24 items-center justify-center hover:bg-white/60 hover:text-black/90 ` +
                                (userType === "lead"
                                    ? "bg-white text-black"
                                    : "bg-white/5 text-white ring-1 ring-white/20")
                            }
                            variant="defaulted"
                            onClick={() => setUserType("lead")}
                        >
                            <img
                                src={Leader}
                                className="block h-28"
                                draggable="false"
                                alt="Leader"
                            />
                            <span className="mt-2">I am the <b>Leader</b></span>
                        </Button>

                        <Button
                            className={
                                `flex flex-col w-52 rounded-xl py-24 items-center justify-center hover:bg-white/60 hover:text-black/90 ` +
                                (userType === "participant"
                                    ? "bg-white text-black"
                                    : "bg-white/5 text-white ring-1 ring-white/20")
                            }
                            variant="defaulted"
                            onClick={() => setUserType("participant")}
                        >
                            <img
                                src={Participant}
                                className="block h-28"
                                draggable="false"
                                alt="Participant"
                            />
                            <span className="mt-2">I am a <b>Participant</b></span>
                        </Button>
                    </div>

                    {userType === 'lead' && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                            className="group space-y-2.5"
                        >
                            <Label className="text-sm font-medium text-white/90 mb-2 block">
                                Total Participants (incl. you)
                            </Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    step="any"
                                    placeholder="0"
                                    value={participantCount}
                                    onChange={e => setParticipantCount(
                                        Math.max(2, Math.min(MAX_PARTICIPANTS, parseInt(e.target.value)))
                                    )}
                                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-main-blue focus:bg-white/10 transition-all duration-300 rounded-lg"
                                />
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                    <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                                        participantCount ? 'bg-green-400' : 'bg-white/20'
                                    }`} />
                                </div>
                            </div>
                            <Button onClick={handleGenerateSession} className='px-6 bg-gradient-to-r from-main-yellow/80 to-main-yellow/60 hover:from-main-yellow/70 hover:to-main-yellow/50 text-white font-semibold rounded-xl transition-all duration-300'>Generate Session ID</Button>
                            {sessionId && (
                                <div className="relative w-full">
                                    <Input
                                        value={sessionId}
                                        readOnly
                                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-main-blue focus:bg-white/10 transition-all duration-300 rounded-lg w-full pl-4 pr-10 py-4"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => { navigator.clipboard.writeText(sessionId); setCopied(true); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition"
                                    >
                                        <Copy size={18} />
                                    </button>
                                </div>
                            )}
                            {sessionId && !copied && (
                                <p className="text-sm text-red-500">Be sure to copy your session ID before proceeding!</p>
                            )}
                        </motion.div>
                    )}

                    {userType === 'participant' && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                            className="group"
                        >
                            <Label className="text-sm font-medium text-white/90 mb-2 block">
                                Enter Session ID
                            </Label>
                            <div className="relative">
                                <Input
                                    placeholder="e.g, fd7f1f66-6736-4967-ad80-7fa97634841c"
                                    value={sessionId}
                                    onChange={e => setSessionId(e.target.value)}
                                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-main-blue focus:bg-white/10 transition-all duration-300 rounded-lg"
                                />
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                    <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                                        sessionId ? 'bg-green-400' : 'bg-white/20'
                                    }`} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {userType && (
                        <Button
                            className="w-full bg-gradient-to-r from-main-blue to-main-blue/80 hover:from-main-blue/90 hover:to-main-blue/70 text-white font-semibold rounded-xl transition-all duration-300"
                            onClick={handleProceed}
                            disabled={!sessionId || (userType==='lead' && !copied)}
                        >Proceed to Form
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};