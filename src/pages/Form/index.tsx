import React, { useEffect, useRef, useState } from 'react';
import { Input, Button, Label } from '@/components';
import { FormApi } from '@/api';
import { SessionData } from '@/hooks/useSession';
import { toast } from "react-toastify";
import { WS_URL, RECONNECT_BASE, MAX_RECONNECT } from '@/constant';
import illustrationImg from "@/assets/images/side2.png";
import UploadImage from "@/assets/icons/upload.png";

export const FormUpload: React.FC<SessionData> = ({ userType, userId, sessionId, participantCount }) => {
    const [orgName, setOrgName] = useState('');
    const [label, setLabel] = useState('');
    const [file, setFile] = useState<File|null>(null);
    const [statusMap, setStatusMap] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string|null>(null);
    const [uploaded, setUploaded] = useState(false);
    const [step, setStep] = useState(1);
    const [headers, setHeaders] = useState<string[]>([]);
    const socketRef = useRef<WebSocket|null>(null);
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
                const initPayload = {
                    userId,
                    userType,
                    orgName: userType === 'lead' ? orgName : '',
                    status: false
                };
                socket.send(JSON.stringify(initPayload));
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
                toast.success("Dataset added successfully!");
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

            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result as string;
                const firstLine = text.split('\n')[0];
                const parsedHeaders = firstLine.replace('\r', '').split(',');
                setHeaders(parsedHeaders);
            };
            reader.readAsText(file);
        }
        setFile(e.target.files?.[0]||null)
    }

    const handleProceed = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/v1/sessions/${sessionId}/proceed`, {
                method: 'POST',
            });

            if (!res.ok) {
                const errorText = await res.text(); // Read actual response
                console.error('Server responded with:', res.status, errorText);
                throw new Error(errorText || 'Failed to proceed with the session.');
            }

            toast.success("Computation started!");
            // navigate(`/result/${sessionId}`);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Failed to proceed.');
        }
    };

    return (
        <main className="flex flex-row w-full min-h-screen bg-main-dark">
            {/* Left Pane */}
            <div className="relative w-[47%] h-screen">
                <div className="absolute border-white bg-white font-semibold border rounded-[3rem] p-2 rounded-xl top-8 left-9 w-32 text-center text-sm z-20">{userType.charAt(0).toUpperCase() + userType.slice(1)}</div>

                {/* Bottom-left Title & Subtitle */}
                <div className="absolute bottom-20 left-9 z-20 text-white">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-[#FFFFFF] to-[#999999] bg-clip-text text-transparent">Your Data.</h1>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-[#FFFFFF] to-[#5B5B5B] bg-clip-text text-transparent">Your Insights.</h1>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-[#E6E6E6] to-[#454545] bg-clip-text text-transparent">Your Security.</h1>
                </div>
                <div className="absolute bottom-8 left-9 z-20 text-white">
                    <p className="text-sm font-base">Take control of your dataset, ensuring only you and </p>
                    <p className="text-sm font-base">your team have access to the insights!</p>
                </div>

                {/* Bottom-right Participant Status */}
                <div className="absolute top-24 left-9 z-20 text-white text-muted-foreground">
                    <p className="font-semibold mb-4 text-[1.4rem] text-base">Participant Status</p>
                    <div className="space-y-3">
                        {Object.entries(safeStatusMap).map(([id, status]) => (
                            <div className={`flex w-full text-sm align-center ${status ? "border-[#00C20A] bg-[#00C20A]/10" : "border-white bg-white/10"} border rounded-[3rem]`} key={id}>
                                <div className={`p-2 px-4 pt-2.5 ${status ? "border-[#00C20A] bg-[#00C20A]/10" : "border-white bg-white/10"} border rounded-[3rem]`}>{status ? '✅' : '⏳'}</div> 
                                <div className="p-2 px-4 pt-2.5 pr-5">{id === userId ? 'You' : id}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Illustration Image */}
                <img
                    src={illustrationImg}
                    className="z-0 h-full w-full object-cover"
                    alt="Illustration"
                    draggable="false"
                />
            </div>

            {/* Right Pane */}
            <div className="w-[53%] flex flex-col items-center justify-center min-h-screen p-4 space-y-6">
                <div className="w-full max-w-md">
                    <div className="flex flex-col w-full gap-1 mb-4">
                        <p className="text-4xl font-semibold text-white">submit your dataset</p>
                        <p className="text-base mb-4 text-white">ready your data. once all join, we compute together</p>
                    </div>

                    {/* Vertical Stepper */}
                    <div className="flex space-x-4 text-white mt-6">
                        {/* Stepper Line */}
                        <div className="flex flex-col items-center mt-0.5">
                            {/* Step 1 Circle */}
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${step === 1 ? 'bg-main-blue text-white' : 'bg-white/30 text-white/50'}`}>
                                {userType === 'lead' ? 1 : "-"}
                            </div>
                            {/* Vertical Line */}
                            {userType === 'lead' && <div className={`w-px ${step >= 2 ? 'bg-main-blue h-[0.75rem]' : 'bg-white/30 h-[20.75rem]'}`} />}
                            {/* Step 2 Circle */}
                            {userType === 'lead' && <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm mt-2 ${step === 2 ? 'bg-main-blue text-white' : 'bg-white/30 text-white/50'}`}>
                                2
                            </div>}
                        </div>

                        {/* Stepper Content */}
                        <div className="flex flex-col space-y-6 w-full">
                            {/* Step 1 Content */}
                            <div className="space-y-4">
                                <p className={`font-semibold ${step === 1 ? "text-blue-500" : "text-white/50"} py-0.5`}>Organization & File Upload</p>

                                {step === 1 && (
                                    <>
                                        <div className="space-y-2">
                                            <Label>Organization Name</Label>
                                            <Input
                                                className="pl-4 py-4"
                                                placeholder="Enter your organization name..."
                                                value={orgName}
                                                onChange={(e) => setOrgName(e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <Label>Upload your CSV Dataset</Label>
                                            <input
                                                type="file"
                                                accept=".csv"
                                                onChange={(e) => handleUpload(e)}
                                                onClick={(e) => (e.currentTarget.value = '')}
                                                hidden
                                                id="file-upload"
                                            />
                                            <label htmlFor="file-upload" className="block cursor-pointer mt-2">
                                                <div className="border-2 border-dashed border-white/50 rounded-lg p-4 flex flex-col items-center bg-white/10 hover:bg-white/5">
                                                    <img src={UploadImage} className="h-14" alt="" />
                                                    <p className="text-sm font-bold text-white/70 text-center">
                                                        Upload CSV file here...
                                                    </p>
                                                    <p className="text-sm font-normal text-white/70 text-center mt-1">
                                                        {file ? file.name : "You haven't uploaded anything!"}
                                                    </p>
                                                </div>
                                            </label>
                                        </div>

                                        {userType === 'lead' && 
                                            <Button
                                                className="mt-2"
                                                onClick={() => setStep(2)}
                                                disabled={!orgName || !file}
                                            >
                                                Continue
                                            </Button>
                                        }

                                        {userType !== 'lead' && 
                                            <div className="flex flex-row space-x-4">
                                                <Button
                                                    onClick={handleSubmit}
                                                    disabled={uploaded || !file}
                                                >
                                                    {uploaded ? 'Uploaded ✓' : 'Upload'}
                                                </Button>
                                                <Button
                                                    variant={isReady ? 'default' : 'outline'}
                                                    disabled={!isReady}
                                                    onClick={handleProceed}
                                                >
                                                    Proceed
                                                </Button>
                                            </div>
                                        }

                                        {userType !== 'lead' && uploaded && (
                                            <div className="text-sm mt-2 text-yellow-600">⚠️ Wait for the leader to proceed</div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Step 2 Content */}
                            <div className="space-y-4">
                                {userType === 'lead' && <p className={`font-semibold ${step === 2 ? "text-blue-500" : "text-white/50"} py-0.5`}>Choose Label</p>}

                                {step === 2 && (
                                    <>
                                        {userType === 'lead' && (
                                            <div className="space-y-2">
                                                <Label>Choose the Label</Label>
                                                <select
                                                    className="w-full pl-4 pr-[200px] py-1.5 rounded-lg bg-white text-black"
                                                    value={label}
                                                    onChange={(e) => setLabel(e.target.value)}
                                                >
                                                    <option value="">Select label...</option>
                                                    {headers.map((header, idx) => (
                                                        <option key={idx} value={header}>{header}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {error && <p className="text-sm text-red-600">{error}</p>}

                                        {userType === 'lead' && <div className="flex flex-row space-x-4">
                                            <Button
                                                onClick={handleSubmit}
                                                disabled={uploaded || !file || (userType === 'lead' && !label)}
                                            >
                                                {uploaded ? 'Uploaded ✓' : 'Upload'}
                                            </Button>
                                            <Button
                                                variant={isReady ? 'default' : 'outline'}
                                                disabled={!isReady}
                                                onClick={handleProceed}
                                            >
                                                Proceed
                                            </Button>
                                        </div>}

                                        {userType !== 'lead' && uploaded && (
                                            <div className="text-sm mt-2 text-yellow-600">⚠️ Wait for the leader to proceed</div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};