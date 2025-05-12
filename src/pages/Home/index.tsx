import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { SessionData } from '@/hooks/useSession';

const MAX_PARTICIPANTS = 20;
const API_BASE = import.meta.env.VITE_REACT_APP_API_BASE;

export const Home: React.FC = () => {
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
            const res = await fetch(
                `${API_BASE}/sessions/`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        participant_count: participantCount,
                        lead_user_id: userId
                    })
                }
            );
            if (!res.ok) throw new Error('Failed to create session');
            const { session_id } = await res.json();
            setSessionId(session_id);
            setCopied(false);
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
                const res = await fetch(`${API_BASE}/sessions/${sessionId}`);
                if (!res.ok) throw new Error('Invalid or full session');
                const json = await res.json();
                if (json.joined_count >= json.participant_count) throw new Error('Session is full');
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