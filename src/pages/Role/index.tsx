import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Input, Button } from '@/components';
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
                className="absolute top-3 left-8 z-20 bg-white text-black hover:bg-gray-200 px-4 py-2 rounded shadow-md flex items-center space-x-2"
                onClick={() => navigate('/')}
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
            </Button>

            <Card className="w-full max-w-lg p-4 bg-main-dark z">
                <CardContent className="space-y-4 z-10">
                    <h1 className="text-2xl md:text-3xl text-center font-semibold leading-tight mb-8 text-white ">choose your role</h1>
                    <div className="flex space-x-10">
                        <Button
                            className={
                                `flex flex-col w-52 rounded-xl py-24 items-center justify-center hover:bg-white/60 hover:text-black/90 ` +
                                (userType === "lead"
                                    ? "bg-white text-black"
                                    : "bg-transparent text-white ring-1 ring-white")
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
                                    : "bg-transparent text-white ring-1 ring-white")
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
                        <div className="space-y-2 text-white">
                            <label>Total Participants (incl. you)</label>
                            <Input
                                type="number"
                                className="pl-4 py-4"
                                min={2}
                                max={MAX_PARTICIPANTS}
                                value={participantCount}
                                onChange={e => setParticipantCount(
                                    Math.max(2, Math.min(MAX_PARTICIPANTS, parseInt(e.target.value)))
                                )}
                            />
                            <Button onClick={handleGenerateSession}>Generate Session ID</Button>
                            {sessionId && (
                                <div className="flex items-center space-x-2">
                                    <Input value={sessionId} readOnly className="w-full pl-4 py-4" />
                                    <Button
                                        onClick={() => { navigator.clipboard.writeText(sessionId); setCopied(true); }}
                                    >Copy</Button>
                                </div>
                            )}
                            {sessionId && !copied && (
                                <p className="text-sm text-red-500">Be sure to copy your session ID before proceeding!</p>
                            )}
                        </div>
                    )}

                    {userType === 'participant' && (
                        <div className="space-y-2 text-white">
                            <label>Enter Session ID</label>
                            <Input
                                value={sessionId}
                                onChange={e => setSessionId(e.target.value)}
                            />
                        </div>
                    )}

                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {userType && (
                        <Button
                            className="w-full"
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