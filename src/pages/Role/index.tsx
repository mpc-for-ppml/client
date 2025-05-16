import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Input, Button } from '@/components';
import { Card, CardContent } from '@/components/ui/card';
import { RoleApi } from '@/api';
import { useNavigate } from 'react-router-dom';
import { SessionData } from '@/hooks/useSession';
import { MAX_PARTICIPANTS } from '@/constant';

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
        navigate('/form-upload', { state: { session } });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6">
            <Card className="w-full max-w-md p-4">
                <CardContent className="space-y-4">
                <div className="flex justify-around">
                    <Button variant={userType === 'lead' ? 'default' : 'outline'} onClick={() => setUserType('lead')}>
                        I am the Lead
                    </Button>
                    <Button variant={userType === 'participant' ? 'default' : 'outline'} onClick={() => setUserType('participant')}>
                        I am a Participant
                    </Button>
                </div>

                {userType === 'lead' && (
                    <div className="space-y-2">
                    <label>Total Participants (incl. you)</label>
                    <Input
                        type="number"
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
                            <Input value={sessionId} readOnly className="w-full" />
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
                    <div className="space-y-2">
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