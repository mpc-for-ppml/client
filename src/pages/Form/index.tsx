import React, { useEffect, useRef, useState } from 'react';
import { Input, Button, Label } from '@/components';
import { FormApi } from '@/api';
import { useNavigate } from 'react-router-dom';
import { SessionData } from '@/hooks/useSession';
import { toast } from "react-toastify";
import illustrationImg from "@/assets/images/side.png";
import UploadImage from "@/assets/icons/upload.png";

const WS_URL = import.meta.env.VITE_REACT_APP_WS_URL;
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
    const textRef = useRef<HTMLParagraphElement>(null);
    const infoRef = useRef<HTMLParagraphElement>(null);

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
        
            // socket.onerror = () => setError("WebSocket error");
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

        await FormApi.upload(form)
            .then(() => {
                toast.success("Course added successfully!");
                socketRef.current?.send(JSON.stringify({ userId, status: true }));
            })
            .catch((error: any) => {
                setError(error.message || 'Upload failed');
                toast.error(error || 'Server is unreachable. Please try again later.');
            })
            .finally(() => {
                setUploaded(true);
            });
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const file = e.target.files?.[0];

        if (file) {
            if (textRef && textRef.current) {
                textRef.current.textContent = 'File uploaded sucessfully!';
            }
            if (infoRef && infoRef.current) {
                infoRef.current.textContent = `${file.name}`;
            }
        }
        setFile(e.target.files?.[0]||null)
    }

    const handleProceed = () => navigate(`/result/${sessionId}`);

    return (
        <main className="flex flex-row w-full min-h-screen bg-gradient-to-r from-[#003675] to-black">
            <div className="w-[40%] flex flex-col items-center justify-center min-h-screen p-4 space-y-6">
                <div className="w-full max-w-md">
                    <div className="absolute border-white bg-slate-900 font-semibold border rounded-3xl p-2 rounded-xl top-8 left-10 w-28 text-center text-white text-sm z-20">{userType.charAt(0).toUpperCase() + userType.slice(1)}</div>
                    <div className="flex flex-col w-full gap-1 mb-4">
                        <p className="text-4xl font-bold text-white">Submit Your Dataset!</p>
                        <p className="text-lg mb-4 text-white">Ready your data. Once all join, we compute together</p>
                    </div>
                    <div className="space-y-3">
                        {userType === 'lead' && (
                            <>  
                                <div className='space-y-2'>
                                    <Label className="mt-2 text-white/80">Organization Name</Label>
                                    <Input className="bg-white/60 rounded-2xl pl-4 py-4 hover:bg-white/20 duration-200" value={orgName} onChange={e => setOrgName(e.target.value)} />
                                </div>
                                <div className='space-y-2'>
                                    <Label className="mt-2 text-white/80">Label</Label>
                                    <Input className="bg-white/60 rounded-2xl pl-4 py-4 hover:bg-white/20 duration-200" value={label} onChange={e => setLabel(e.target.value)} />
                                </div>
                            </>
                        )}
                        <div className="flex flex-col space-y-2">
                            <Label className="mt-2 text-white/80">Upload CSV File</Label>
                            <input
                                type="file"
                                id="file-btn"
                                accept=".csv"
                                onChange={(e) => handleUpload(e)}
                                onClick={(e) => {
                                    const target = e.currentTarget as HTMLInputElement;
                                    target.value = "";
                                }}
                                hidden
                            />
                            <label htmlFor="file-btn" className="w-full">
                                <div className="border-2 border-dashed border-white-3 rounded-2xl p-6 py-2.5 w-full flex flex-col items-center cursor-pointer bg-white/60 hover:bg-white/20 duration-200 mt-2">
                                    <img
                                        src={UploadImage}
                                        className="block h-14"
                                        alt=""
                                    />
                                    <p className="text-sm font-bold text-slate-800 text-center" ref={textRef}>
                                        Upload CSV file here...
                                    </p>
                                    <p className="text-sm font-normal text-slate-800 text-center mt-1" ref={infoRef}>
                                        You haven't uploaded anything!
                                    </p>
                                </div>
                            </label>
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <div className="w-full flex flex-col pt-2">
                            <div className="flex flex-row space-x-4">
                                <Button onClick={handleSubmit} disabled={uploaded || !file || (userType==='lead' && (!orgName||!label))}>
                                    {uploaded ? 'Uploaded ✓' : 'Upload'}
                                </Button>
                                {userType === 'lead' && <Button disabled={!isReady} variant={isReady ? 'default' : 'outline'} onClick={handleProceed}>
                                    Proceed
                                </Button>}
                            </div>
                            <div className='flex'>
                                {userType !== 'lead' && uploaded && <div className='text-sm mt-2 text-yellow-600'>⚠️ Wait for the leader to proceed</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative w-[60%] h-screen p-6">
                <div className="absolute inset-0 bg-green-gradient z-10 opacity-90" />
                <p className="absolute bg-white/20 p-4 rounded-xl bottom-14 right-14 w-[45%] justify-right align-right w-full text-white text-sm text-muted-foreground z-20">
                    <p className="font-semibold mb-2 text-base">Participant Status:</p>
                    {Object.entries(safeStatusMap).map(([id, status]) => (
                        <p key={id}>{id===userId?'You':id}: {status? '✅ Uploaded':'⏳ Waiting'}</p>
                    ))}
                </p>
                <img src={illustrationImg} className="rounded-3xl z-0 h-full w-full object-cover" alt="Illustration" />
            </div>
        </main>
    );
};