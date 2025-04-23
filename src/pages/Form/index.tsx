import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { SessionData } from '@/hooks/useSession';

const WS_URL = import.meta.env.VITE_REACT_APP_WS_URL || "ws://localhost:8080";
const API_BASE = import.meta.env.VITE_REACT_APP_API_BASE || 'http://localhost:8080';
const RECONNECT_BASE = 1000; // 1s
const MAX_RECONNECT = 5;

export const FormUpload: React.FC<SessionData> = ({ userType, userId, sessionId, participantCount }) => {
    const [orgName, setOrgName] = useState('');
    const [label, setLabel] = useState('');
    const [file, setFile] = useState<File|null>(null);
    const [statusMap, setStatusMap] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string|null>(null);
    const [uploaded, setUploaded] = useState(false);
    const socketRef = useRef<WebSocket|null>(null);
    const navigate = useNavigate();

    // Safely handle cases where statusMap might be undefined/null
    const safeStatusMap = statusMap || {};
    const isReady = Object.keys(safeStatusMap).length === participantCount && Object.values(safeStatusMap).every(Boolean);

    useEffect(() => {
        let socket: WebSocket;
        let retries = 0;
      
        const connect = () => {
            socket = new WebSocket(`${WS_URL}/ws/${sessionId}`);
            socketRef.current = socket;
        
            socket.onopen = () => {
                // reset retry counter on success
                retries = 0;
                socket.send(JSON.stringify({ userId, status: false }));
            };
        
            socket.onmessage = ({ data }) => {
                const { statusMap } = JSON.parse(data);
                setStatusMap(statusMap);
            };
        
            socket.onclose = () => {
                if (retries < MAX_RECONNECT) {
                    const delay = RECONNECT_BASE * 2 ** retries;
                    retries += 1;
                    setTimeout(connect, delay);
                }
            };
        
            socket.onerror = () => setError("WebSocket error");
        };
      
        connect();
      
        return () => socket && socket.close();
    }, [sessionId]);   // 🔑 only re-run when the sessionId changes

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
            const res = await fetch(`${API_BASE}/upload/`, { method: 'POST', body: form });
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

                    <Button onClick={handleSubmit} disabled={uploaded || !file || (userType==='lead' && (!orgName||!label))}>
                        {uploaded ? 'Uploaded ✓' : 'Upload'}
                    </Button>

                    <Button disabled={!isReady} variant={isReady ? 'default' : 'outline'} onClick={handleProceed}>
                        Proceed (Enabled when all are ready)
                    </Button>

                    <div className="mt-4 text-sm text-muted-foreground">
                        <p className="font-semibold mb-1">Participant Status:</p>
                        {Object.entries(safeStatusMap).map(([id, status]) => (
                            <p key={id}>{id===userId?'You':id}: {status? '✅ Uploaded':'⏳ Waiting'}</p>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};