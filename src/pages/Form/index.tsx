import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { SessionData } from '@/hooks/useSession';

const WS_URL = import.meta.env.VITE_REACT_APP_WS_URL || "ws://localhost:8000";
const RECONNECT_BASE = 1000; // 1s
const MAX_RECONNECT = 5;

export const FormUpload: React.FC<SessionData> = ({ userType, userId, sessionId, participantCount }) => {
    const [orgName, setOrgName] = useState('');
    const [label, setLabel] = useState('');
    const [file, setFile] = useState<File|null>(null);
    const [statusMap, setStatusMap] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string|null>(null);
    const [uploaded, setUploaded] = useState(false);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    const [sessionError, setSessionError] = useState<string|null>(null);
    const socketRef = useRef<WebSocket|null>(null);
    const navigate = useNavigate();

    const isReady = Object.keys(statusMap).length === participantCount && Object.values(statusMap).every(Boolean);

    useEffect(() => {
        let socket: WebSocket;
        const connect = () => {
            socket = new WebSocket(`${WS_URL}/api/v1/ws/${sessionId}`);
            socketRef.current = socket;

            socket.onopen = () => {
                setReconnectAttempts(0);
                socket.send(JSON.stringify({ userId, status: false }));
            };

            socket.onmessage = e => {
                const data = JSON.parse(e.data);
                if (Object.keys(data.statusMap).length > participantCount) {
                    setSessionError('Too many participants in session.');
                } else {
                    setStatusMap(data.statusMap);
                }
            };

            socket.onclose = () => {
                if (reconnectAttempts < MAX_RECONNECT) {
                const delay = RECONNECT_BASE * Math.pow(2, reconnectAttempts);
                    setTimeout(() => { setReconnectAttempts(prev => prev+1); connect(); }, delay);
                }
            };

            socket.onerror = () => setError('WebSocket error');
        };
        connect();
        return () => socket && socket.close();
    }, [sessionId, userId, participantCount, reconnectAttempts]);

    const handleSubmit = async () => {
        setError(null);
        if (!file) return;
        if (userType === 'lead' && (!orgName || !label)) {
            setError('Organization name and label are required');
            return;
        }
        setUploaded(false);
        
        const form = new FormData();
        form.append('group_id', sessionId);
        form.append('user_id', userId);
        form.append('file', file);
        if (userType === 'lead') {
            form.append('org_name', orgName);
            form.append('label', label);
        }

        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/v1/upload/`, { method: 'POST', body: form });
            const json = await res.json();
            if (!res.ok) throw new Error(json.detail || 'Upload failed');
            setUploaded(true);
            socketRef.current?.send(JSON.stringify({ userId, status: true }));
        } catch (e: any) {
            setError(e.message);
        }
    };

    const handleProceed = () => navigate(`/result/${sessionId}`);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6">
            <Card className="w-full max-w-md p-4">
                <CardContent className="space-y-4">
                    {userType === 'lead' && (
                        <>  
                            <Label>Organization Name</Label>
                            <Input value={orgName} onChange={e => setOrgName(e.target.value)} />
                            <Label>Label</Label>
                            <Input value={label} onChange={e => setLabel(e.target.value)} />
                        </>
                    )}
                    <Label>Upload CSV File</Label>
                    <Input type="file" accept=".csv" onChange={e => setFile(e.target.files?.[0]||null)} />

                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {sessionError && <p className="text-sm text-red-600">{sessionError}</p>}

                    <Button onClick={handleSubmit} disabled={uploaded || !file || (userType==='lead' && (!orgName||!label))}>
                        {uploaded ? 'Uploaded ✓' : 'Upload'}
                    </Button>

                    <Button disabled={!isReady} variant={isReady ? 'default' : 'outline'} onClick={handleProceed}>
                        Proceed (Enabled when all are ready)
                    </Button>

                    <div className="mt-4 text-sm text-muted-foreground">
                        <p className="font-semibold mb-1">Participant Status:</p>
                        {Object.entries(statusMap).map(([id, status]) => (
                            <p key={id}>{id===userId?'You':id}: {status? '✅ Uploaded':'⏳ Waiting'}</p>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};