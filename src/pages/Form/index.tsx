import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from 'react-router-dom';
import { Input, Button, Label, Switch, Card } from '@/components';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { FormApi } from '@/api';
import { SessionData, CommonColumnsResponse, IdentifierConfig } from '@/types';
import { toast } from "react-toastify";
import { WS_URL, RECONNECT_BASE, MAX_RECONNECT } from '@/constant';
import illustrationImg from "@/assets/images/side2.png";
import { RunConfig } from '@/types';
import { CardContent } from '@/components/ui/card';
import { Building, CheckCircle2, ChevronRight, Clock, Crown, Database, FileSpreadsheet, Info, Play, Settings, Sparkles, Upload, User, Users, Key, AlertTriangle, Home } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const FormUpload: React.FC<SessionData> = ({ userType, userId, sessionId, participantCount }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [orgName, setOrgName] = useState('');
    const [label, setLabel] = useState('');
    const [file, setFile] = useState<File|null>(null);
    const [statusMap, setStatusMap] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string|null>(null);
    const [uploaded, setUploaded] = useState(false);
    const [step, setStep] = useState(1);
    const [headers, setHeaders] = useState<string[]>([]);
    const [showOverlay, setShowOverlay] = useState(false);
    const socketRef = useRef<WebSocket|null>(null);
    const textRef = useRef<HTMLParagraphElement>(null);
    const infoRef = useRef<HTMLParagraphElement>(null);

    /* Usestate for submission */
    const [normalizer, setNormalizer] = useState("minmax")
    const [regression, setRegression] = useState("linear")
    const [learningRate, setLearningRate] = useState("0.01")
    const [epochs, setEpochs] = useState("100")
    const [isLogging, setIsLogging] = useState(false)

    /* Usestate for identifier selection */
    const [commonColumnsData, setCommonColumnsData] = useState<CommonColumnsResponse | null>(null);
    const [identifierMode, setIdentifierMode] = useState<'single' | 'combined'>('single');
    const [selectedIdentifiers, setSelectedIdentifiers] = useState<string[]>([]);
    const [showNoCommonColumnsDialog, setShowNoCommonColumnsDialog] = useState(false);
    const [isLoadingCommonColumns, setIsLoadingCommonColumns] = useState(false);

    // Safely handle cases where statusMap might be undefined/null
    const safeStatusMap = statusMap || {};
    const isReady = Object.keys(safeStatusMap).length === participantCount && Object.values(safeStatusMap).every(Boolean);

    useEffect(() => {
        if (id != sessionId) {
            toast.error('Session invalid!');
            navigate("/");
        }
    }, []);

    useEffect(() => {
        let socket: WebSocket | null = null;
        let retries = 0;
        let isComponentMounted = true;
        let connectionTimeout: NodeJS.Timeout;
      
        const connect = () => {
            if (!isComponentMounted) return;
            
            try {
                socket = new WebSocket(`${WS_URL}/ws/${sessionId}`);
                socketRef.current = socket;

                socket.onopen = () => {
                    if (!isComponentMounted || !socket) return;
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
                    if (!isComponentMounted) return;
                    try {
                        const parsed = JSON.parse(data);
                        const { statusMap, proceed, training } = parsed;

                        if (statusMap) setStatusMap(statusMap);
                        if (proceed) setShowOverlay(true);
                        if (training) navigate(`/log/${sessionId}`);
                    } catch (error) {
                        console.error('WebSocket message parse error:', error);
                    }
                };
            
                socket.onclose = (event) => {
                    if (!isComponentMounted) return;
                    
                    // Only retry if it wasn't a normal closure
                    if (event.code !== 1000 && retries < MAX_RECONNECT) {
                        const delay = RECONNECT_BASE * 2 ** retries;
                        retries += 1;
                        console.log(`WebSocket closed. Reconnecting in ${delay}ms... (attempt ${retries}/${MAX_RECONNECT})`);
                        connectionTimeout = setTimeout(connect, delay);
                    }
                };
            
                socket.onerror = (error) => {
                    console.error("WebSocket error:", error);
                    // Don't set error state here as it will be handled by onclose
                };
            } catch (error) {
                console.error("WebSocket connection error:", error);
                if (retries < MAX_RECONNECT) {
                    const delay = RECONNECT_BASE * 2 ** retries;
                    retries += 1;
                    connectionTimeout = setTimeout(connect, delay);
                }
            }
        };
      
        // Delay initial connection to ensure component is fully mounted
        connectionTimeout = setTimeout(connect, 100);
      
        return () => {
            isComponentMounted = false;
            if (connectionTimeout) clearTimeout(connectionTimeout);
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.close(1000, 'Component unmounting');
            }
        };
    }, [sessionId, userId, userType, navigate]);

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

    const fetchCommonColumns = async () => {
        setIsLoadingCommonColumns(true);
        try {
            const data = await FormApi.getCommonColumns(sessionId);
            setCommonColumnsData(data);
            
            if (data.common_columns.length === 0) {
                setShowNoCommonColumnsDialog(true);
            } else {
                // Auto-select first potential identifier
                const firstIdentifier = data.common_columns.find(col => col.is_potential_identifier);
                if (firstIdentifier) {
                    setSelectedIdentifiers([firstIdentifier.name]);
                }
                setShowOverlay(true);
                // Notify others that lead were proceeding
                socketRef.current?.send(JSON.stringify({ userId, proceed: true }));
            }
        } catch (error) {
            toast.error('Failed to fetch common columns');
        } finally {
            setIsLoadingCommonColumns(false);
        }
    };

    const handleProceed = async () => {
        if (userType === 'lead') {
            await fetchCommonColumns();
        } else {
            setShowOverlay(true);
            // Notify others that lead were proceeding
            socketRef.current?.send(JSON.stringify({ userId, proceed: true }));
        }
    };

    const handleTrain = async () => {
        const identifierConfig: IdentifierConfig = {
            mode: identifierMode,
            columns: selectedIdentifiers,
            separator: identifierMode === 'combined' ? '_' : undefined
        };

        const payload: RunConfig = {
            userId: userId,
            normalizer: normalizer,
            regression: regression,
            learningRate: parseFloat(learningRate),
            epochs: parseInt(epochs),
            label: label,
            isLogging: isLogging,
            identifierConfig: identifierConfig
        };

        await FormApi.run(sessionId, payload)
            .then(() => {
                toast.success("Training parameter configured successfully!");
                socketRef.current?.send(JSON.stringify({ userId, training: true }));
            })
            .catch((error: any) => {
                setError(error.message || 'Train config upload failed');
                toast.error(error || 'Server is unreachable. Please try again later.');
            })
    }


    return (
        <main className="relative flex md:flex-row flex-col-reverse w-full min-h-screen bg-main-dark overflow-hidden">
            {/* Left Pane */}
            <div className="relative md:w-[47%] w-full h-screen">
                {/* Role Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute hidden md:block top-6 left-8 z-50"
                >
                    <Card className="border rounded-[3rem]">
                        <CardContent className="flex items-center gap-2 p-2 px-8">
                            {userType === 'lead' ? (
                                <Crown className="w-4 h-4 text-main-blue" />
                            ) : (
                                <Users className="w-4 h-4 text-main-yellow" />
                            )}
                            <span className="font-semibold text-sm">
                                {userType.charAt(0).toUpperCase() + userType.slice(1)}
                            </span>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Bottom-left Title & Subtitle */}
                <div className="absolute md:bottom-20 bottom-[4.5rem] left-9 z-20 text-white">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="md:text-5xl text-4xl font-bold bg-gradient-to-r from-[#FFFFFF] to-[#999999] bg-clip-text text-transparent"
                    >
                        Your Data.
                    </motion.h1>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="md:text-5xl text-4xl font-bold bg-gradient-to-r from-[#FFFFFF] to-[#5B5B5B] bg-clip-text text-transparent"
                    >
                        Your Insights.
                    </motion.h1>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="md:text-5xl text-4xl font-bold bg-gradient-to-r from-[#E6E6E6] to-[#454545] bg-clip-text text-transparent"
                    >
                        Your Security.
                    </motion.h1>
                </div>

                <div className="absolute bottom-8 left-9 z-20 text-white">
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.0 }}
                        className="md:text-sm text-xs font-base"
                    >
                        Take control of your dataset, ensuring only you and
                    </motion.p>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.2 }}
                        className="md:text-sm text-xs font-base"
                    >
                        your team have access to the insights!
                    </motion.p>
                </div>

                {/* Participant Status Card */}
                <div className="absolute md:top-16 top-3 z-30 w-[90%] max-w-md">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <Card className="bg-transparent">
                            <CardContent className="p-6 px-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-white/10 rounded-lg">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Participants</h3>
                                        <p className="text-white/60 text-sm">Session status overview</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {Object.entries(safeStatusMap).map(([id, status]) => (
                                        <motion.div
                                            key={id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3 }}
                                            className={`flex items-center justify-between p-3 rounded-xl max-w-md border transition-all duration-300 ${
                                                status 
                                                    ? "bg-green-500/10 border-green-500/20" 
                                                    : "bg-white/5 border-white/20"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-full ${
                                                    status ? "bg-green-500/20" : "bg-white/10"
                                                }`}>
                                                    {status ? (
                                                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                                                    ) : (
                                                        <Clock className="w-3 h-3 text-white/60" />
                                                    )}
                                                </div>
                                                <span className="text-white text-sm font-medium">
                                                    {id === userId ? 'You' : `User ${id.slice(0, 8)}`}
                                                </span>
                                            </div>
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                status 
                                                    ? "bg-green-500/20 text-green-400" 
                                                    : "bg-white/10 text-white/60"
                                            }`}>
                                                {status ? 'Ready' : 'Waiting'}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Illustration Image */}
                <div className="z-0 h-full w-full absolute top-0">
                    <img
                        src={illustrationImg}
                        className="object-cover"
                        alt="Illustration"
                        draggable="false"
                    />
                </div>
            </div>

            {/* Right Pane */}
            <div className="md:w-[53%] w-full flex flex-col items-center justify-center min-h-screen p-4 space-y-6">
                {/* Role Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute block md:hidden top-8 left-8 z-50"
                >
                    <Card className="border rounded-[3rem]">
                        <CardContent className="flex items-center gap-2 p-2 px-8">
                            {userType === 'lead' ? (
                                <Crown className="w-4 h-4 text-main-blue" />
                            ) : (
                                <Users className="w-4 h-4 text-main-yellow" />
                            )}
                            <span className="font-semibold text-sm">
                                {userType.charAt(0).toUpperCase() + userType.slice(1)}
                            </span>
                        </CardContent>
                    </Card>
                </motion.div>
                <div className="w-full max-w-lg p-4 md:pt-0 pt-12">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-br from-main-blue/20 to-main-yellow/20 border border-white/10 rounded-xl">
                            <FileSpreadsheet className="w-6 h-6 text-primary text-white" />
                        </div>
                        <h1 className="text-4xl font-semibold text-white">
                            submit dataset.
                        </h1>
                    </div>
                    <h1 className="text-white/60 text-base">
                        ready your data. once all join, we compute together
                    </h1>

                    {/* Vertical Stepper */}
                    <div className="flex md:space-x-4 text-white mt-6">
                        {/* Stepper Line */}
                        <div className="md:flex md:flex-col items-center mt-3 hidden">
                            {/* Step 1 Circle */}
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${step === 1 ? 'bg-main-blue text-white' : 'bg-white/30 text-white/50'}`}>
                                {userType === 'lead' ? 1 : "-"}
                            </div>
                            {/* Vertical Line */}
                            {userType === 'lead' && <div className={`w-px ${step >= 2 ? 'bg-main-blue h-[2.75rem]' : 'bg-white/30 h-[21.3rem]'}`} />}
                            {/* Step 2 Circle */}
                            {userType === 'lead' && <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm mt-2 ${step === 2 ? 'bg-main-blue text-white' : 'bg-white/30 text-white/50'}`}>
                                2
                            </div>}
                        </div>

                        {/* Stepper Content */}
                        <div className="flex flex-col space-y-6 w-full">
                            {/* Step 1 Content */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-2 rounded-lg ${step === 1 ? 'bg-blue-500/20 border border-blue-600/30' : 'bg-white/10'}`}>
                                        {userType === 'lead' ? (
                                            <Building className={`w-5 h-5 ${step === 1 ? 'text-blue-400' : 'text-white/60'}`} />
                                        ) : (
                                            <Upload className={`w-5 h-5 ${step === 1 ? 'text-blue-400' : 'text-white/60'}`} />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className={`text-lg font-semibold ${step === 1 ? 'text-white' : 'text-white/60'}`}>
                                            {userType === 'lead' ? 'Organization & Dataset' : 'Dataset Upload'}
                                        </h3>
                                        <p className="text-white/60 text-sm">
                                            {userType === 'lead' ? 'Configure your organization details and upload data' : 'Upload your dataset to join the session'}
                                        </p>
                                    </div>
                                </div>

                                {step === 1 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: 0.1 }}
                                        className="space-y-3"
                                    >
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium text-white/90 flex items-center gap-2">
                                                <Building className="w-4 h-4" />
                                                Organization Name
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    placeholder="e.g., Acme Corporation"
                                                    value={orgName}
                                                    onChange={(e) => setOrgName(e.target.value)}
                                                    className="bg-black/20 border-white/20 text-white placeholder:text-white/40 focus:border-main-blue focus:bg-black/30 transition-all duration-300 rounded-xl pl-4 pr-10"
                                                />
                                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                                    <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                                                        orgName ? 'bg-green-400' : 'bg-white/20'
                                                    }`} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium text-white/90 flex items-center gap-2">
                                                <FileSpreadsheet className="w-4 h-4" />
                                                CSV Dataset
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger>
                                                        <Info className="h-3 w-3 text-white/40 hover:text-white/60 transition-colors" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="bg-white text-black max-w-[200px]">
                                                        <p>Upload a CSV file containing your training data</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </Label>
                                            <input
                                                type="file"
                                                accept=".csv"
                                                onChange={(e) => handleUpload(e)}
                                                onClick={(e) => (e.currentTarget.value = '')}
                                                hidden
                                                id="file-upload"
                                            />
                                            <label htmlFor="file-upload" className="block cursor-pointer">
                                                <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center transition-all duration-300 ${
                                                    file 
                                                        ? "border-green-400/50 bg-green-400/10" 
                                                        : "border-white/30 bg-white/5 hover:border-white/50 hover:bg-white/10"
                                                }`}>
                                                    {file ? (
                                                        <CheckCircle2 className="w-8 h-8 text-green-400 mb-3" />
                                                    ) : (
                                                        <Upload className="w-8 h-8 text-white/50 mb-3" />
                                                    )}
                                                    <p className={`text-sm font-semibold mb-1 ${
                                                        file ? "text-green-400" : "text-white/70"
                                                    }`}>
                                                        {file ? "File uploaded successfully!" : "Click to upload CSV dataset"}
                                                    </p>
                                                    <p className="text-xs text-white/60 text-center">
                                                        {file ? file.name : "Drag and drop or click to browse"}
                                                    </p>
                                                </div>
                                            </label>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            {userType === 'lead' ? (
                                                step === 1 ? (
                                                    <Button 
                                                        className="flex items-center gap-2 bg-gradient-to-r from-main-blue to-main-blue/80 hover:from-main-blue/90 hover:to-main-blue/70 text-white font-semibold rounded-xl transition-all duration-300" 
                                                        onClick={() => setStep(2)} 
                                                        disabled={!orgName || !file}
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                        Continue to Label Selection
                                                    </Button>
                                                ) : (
                                                    <div className="flex gap-3 w-full">
                                                        <Button 
                                                            onClick={handleSubmit} 
                                                            disabled={uploaded || !file}
                                                            className="flex items-center gap-2 bg-gradient-to-r from-main-yellow to-main-yellow/80 hover:from-main-yellow/90 hover:to-main-yellow/70 text-black font-semibold rounded-xl transition-all duration-300"
                                                        >
                                                            {uploaded ? <CheckCircle2 className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                                                            {uploaded ? 'Uploaded Successfully' : 'Upload Dataset'}
                                                        </Button>
                                                        <Button
                                                            disabled={!isReady || isLoadingCommonColumns}
                                                            onClick={handleProceed}
                                                            className={`flex items-center gap-2 font-semibold rounded-xl transition-all duration-300 ${
                                                                isReady 
                                                                    ? 'bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white'
                                                                    : 'bg-white/10 text-white/50 cursor-not-allowed'
                                                            }`}
                                                        >
                                                            {isLoadingCommonColumns ? (
                                                                <>
                                                                    <motion.div
                                                                        animate={{ rotate: 360 }}
                                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                                                    />
                                                                    Analyzing Columns...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Play className="w-4 h-4" />
                                                                    Proceed to Training
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                )
                                            ) : (
                                                <Button 
                                                    onClick={handleSubmit} 
                                                    disabled={uploaded || !file} 
                                                    className="flex items-center gap-2 bg-gradient-to-r from-main-blue to-main-blue/80 hover:from-main-blue/90 hover:to-main-blue/70 text-white font-semibold rounded-xl transition-all duration-300"
                                                >
                                                    {uploaded ? <CheckCircle2 className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                                                    {uploaded ? 'Uploaded Successfully' : 'Upload Dataset'}
                                                </Button>
                                            )}
                                        </div>

                                        {userType !== 'lead' && uploaded && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="flex items-center gap-2 mt-1"
                                            >
                                                <Clock className="w-4 h-4 text-yellow-400" />
                                                <p className="text-sm text-yellow-400">Waiting for leader to proceed with training configuration</p>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}
                            </div>

                            {/* Step 2 Content */}
                            <div className="space-y-4">
                                <div className={`flex items-center gap-3 ${step == 2 && "mb-6"}`}>
                                    {step == 2 && <div className='p-2 rounded-lg bg-blue-500/20 border border-blue-600/30'>
                                        <Settings className='w-5 h-5 text-blue-400' />
                                    </div>}
                                    <div>
                                        {userType === 'lead' && <h3 className={`text-lg font-semibold ${step === 2 ? 'text-white' : 'text-white/60'}`}>
                                            Label Configuration
                                        </h3>}
                                        {step == 2 && <p className="text-white/60 text-sm">
                                            Select the target column for training
                                        </p>}
                                    </div>
                                </div>

                                {step === 2 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: 0.1 }}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium text-white/90 flex items-center gap-2">
                                                <Database className="w-4 h-4" />
                                                Target Column (Label)
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger>
                                                        <Info className="h-3 w-3 text-white/40 hover:text-white/60 transition-colors" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="bg-white text-black max-w-[200px]">
                                                        <p>Choose the column that contains the target values for prediction</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </Label>
                                            <Select value={label} onValueChange={setLabel}>
                                                <SelectTrigger className="bg-black/20 border-white/20 text-white">
                                                    <SelectValue placeholder="Select target column..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {headers.map((header, idx) => (
                                                        <SelectItem key={idx} value={header}>{header}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                                            >
                                                <Info className="w-4 h-4 text-red-400" />
                                                <p className="text-sm text-red-400">{error}</p>
                                            </motion.div>
                                        )}

                                        <div className="flex gap-3 pt-2">
                                            <Button 
                                                onClick={handleSubmit}
                                                disabled={uploaded || !file || !label}
                                                className="flex items-center gap-2 bg-gradient-to-r from-main-yellow to-main-yellow/80 hover:from-main-yellow/90 hover:to-main-yellow/70 text-black font-semibold rounded-xl transition-all duration-300"
                                            >
                                                {uploaded ? <CheckCircle2 className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                                                {uploaded ? 'Uploaded Successfully' : 'Upload Dataset'}
                                            </Button>
                                            <Button
                                                disabled={!isReady || isLoadingCommonColumns}
                                                onClick={handleProceed}
                                                className={`flex items-center gap-2 font-semibold rounded-xl transition-all duration-300 ${
                                                    isReady 
                                                        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                                                        : 'bg-white/10 text-white/50 cursor-not-allowed'
                                                }`}
                                            >
                                                {isLoadingCommonColumns ? (
                                                    <>
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                                        />
                                                        Analyzing Columns...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="w-4 h-4" />
                                                        Proceed to Training
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sliding Overlay Layer */}
            <AnimatePresence>
                {showOverlay && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "tween", duration: 0.6 }}
                        className="absolute top-0 left-0 md:w-full w-screen md:h-full h-screen bg-main-dark z-50 overflow-hidden"
                    >
                        {/* Blurry Bubbles */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-20 -right-20 w-[30rem] h-[30rem] bg-main-yellow rounded-full filter blur-[120px] opacity-50 z-0"></motion.div>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-20 -left-20 w-[30rem] h-[30rem] bg-main-blue rounded-full filter blur-[120px] opacity-50 z-0"></motion.div>

                        {/* Main contents */}
                        <div className="relative z-10 flex items-center justify-center h-full px-6">
                            {userType !== "lead" ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="flex flex-col items-center gap-6 text-white"
                                >
                                    {/* Elegant Spinner */}
                                    <div className="relative">
                                        <motion.div 
                                            className="w-16 h-16 border border-white/10 rounded-full"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                        />
                                        <motion.div 
                                            className="absolute inset-2 border-2 border-t-main-blue border-r-main-yellow border-b-transparent border-l-transparent rounded-full"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        />
                                        <div className="absolute inset-6 bg-main-blue/20 rounded-full flex items-center justify-center">
                                            <Sparkles className="w-4 h-4 text-main-blue" />
                                        </div>
                                    </div>
                                    
                                    {/* Text Content */}
                                    <div className="text-center max-w-sm space-y-3">
                                        <motion.h3 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                            className="text-xl font-semibold"
                                        >
                                            Training Configuration
                                        </motion.h3>
                                        <motion.p 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                            className="text-white/70 leading-relaxed"
                                        >
                                            The leader is setting up training parameters. Your session will begin shortly.
                                        </motion.p>
                                        
                                        {/* Subtle Progress Dots */}
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.7 }}
                                            className="flex items-center justify-center gap-2 pt-2"
                                        >
                                            {[0, 1, 2].map((i) => (
                                                <motion.div
                                                    key={i}
                                                    className="w-1.5 h-1.5 bg-white/40 rounded-full"
                                                    animate={{ 
                                                        scale: [1, 1.3, 1],
                                                        opacity: [0.4, 1, 0.4]
                                                    }}
                                                    transition={{
                                                        duration: 1.5,
                                                        repeat: Infinity,
                                                        delay: i * 0.2
                                                    }}
                                                />
                                            ))}
                                        </motion.div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                                    className="w-full max-w-7xl"
                                >
                                    {/* Compact Header */}
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-center mb-6"
                                    >
                                        <div className="flex items-center justify-center gap-3 mb-2">
                                            <div className="inline-flex items-center justify-center p-2 bg-gradient-to-br from-main-blue/20 to-main-yellow/20 border border-white/10 rounded-xl">
                                                <Settings className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                        <h1 className="text-4xl font-semibold mb-1 text-white">
                                            training configuration.
                                        </h1>
                                        <p className="text-white/60 text-base">
                                            configure parameters for collaborative training
                                        </p>
                                    </motion.div>

                                    {/* Form Card */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <Card className="bg-white/5 border border-white/10 backdrop-blur-sm shadow-2xl rounded-2xl max-w-5xl mx-auto">
                                            <CardContent className="p-6">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    {/* Left Column */}
                                                    <div className="space-y-4">
                                                        {/* Identifier Selection */}
                                                        {commonColumnsData && commonColumnsData.common_columns.length > 0 && (
                                                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                                                <h3 className="text-sm font-medium text-white/90 mb-3 flex items-center gap-2">
                                                                    <div className="w-1 h-3 bg-green-500 rounded-full" />
                                                                    Identifier Configuration
                                                                </h3>
                                                                
                                                                {/* Mode Selection */}
                                                                <div className="space-y-3">
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <button
                                                                            onClick={() => {
                                                                                setIdentifierMode('single');
                                                                                setSelectedIdentifiers(selectedIdentifiers.slice(0, 1));
                                                                            }}
                                                                            className={`p-2 rounded-lg border transition-all duration-200 ${
                                                                                identifierMode === 'single'
                                                                                    ? 'bg-main-blue/20 border-main-blue text-white'
                                                                                    : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'
                                                                            }`}
                                                                        >
                                                                            <div className="flex items-center gap-2">
                                                                                <Key className="w-4 h-4" />
                                                                                <span className="text-xs font-medium">Single</span>
                                                                            </div>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                const availableIdentifiers = commonColumnsData.common_columns.filter(col => col.is_potential_identifier).length;
                                                                                if (availableIdentifiers > 1) {
                                                                                    setIdentifierMode('combined');
                                                                                }
                                                                            }}
                                                                            disabled={commonColumnsData.common_columns.filter(col => col.is_potential_identifier).length <= 1}
                                                                            className={`p-2 rounded-lg border transition-all duration-200 ${
                                                                                commonColumnsData.common_columns.filter(col => col.is_potential_identifier).length <= 1
                                                                                    ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed opacity-50'
                                                                                    : identifierMode === 'combined'
                                                                                        ? 'bg-main-blue/20 border-main-blue text-white'
                                                                                        : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'
                                                                            }`}
                                                                            title={commonColumnsData.common_columns.filter(col => col.is_potential_identifier).length <= 1 ? "Need multiple identifiers to combine" : ""}
                                                                        >
                                                                            <div className="flex items-center gap-2">
                                                                                <Database className="w-4 h-4" />
                                                                                <span className="text-xs font-medium">Combined</span>
                                                                            </div>
                                                                        </button>
                                                                    </div>

                                                                    {/* Column Selection */}
                                                                    <div>
                                                                        <Label className="text-xs font-medium text-white/80 mb-1.5">
                                                                            {identifierMode === 'single' ? 'Select Identifier Column' : 'Select Columns to Combine'}
                                                                        </Label>
                                                                        {identifierMode === 'single' ? (
                                                                            <Select 
                                                                                value={selectedIdentifiers[0] || ''} 
                                                                                onValueChange={(value) => setSelectedIdentifiers([value])}
                                                                            >
                                                                                <SelectTrigger className="bg-white/5 border-white/20 text-white h-8 text-sm hover:bg-white/10 transition-colors">
                                                                                    <SelectValue placeholder="Select identifier..." />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {commonColumnsData.common_columns
                                                                                        .filter(col => col.is_potential_identifier)
                                                                                        .map(col => (
                                                                                            <SelectItem key={col.name} value={col.name}>
                                                                                                {col.name}
                                                                                            </SelectItem>
                                                                                        ))
                                                                                    }
                                                                                </SelectContent>
                                                                            </Select>
                                                                        ) : (
                                                                            <div className="space-y-2 max-h-10 overflow-y-auto">
                                                                                {commonColumnsData.common_columns
                                                                                    .filter(col => col.is_potential_identifier)
                                                                                    .map(col => (
                                                                                        <label
                                                                                            key={col.name}
                                                                                            className={`flex items-center gap-2 p-2 px-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                                                                                                selectedIdentifiers.includes(col.name)
                                                                                                    ? 'bg-main-blue/20 border-main-blue'
                                                                                                    : 'bg-white/5 border-white/20 hover:bg-white/10'
                                                                                            }`}
                                                                                        >
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={selectedIdentifiers.includes(col.name)}
                                                                                                onChange={(e) => {
                                                                                                    if (e.target.checked) {
                                                                                                        setSelectedIdentifiers([...selectedIdentifiers, col.name]);
                                                                                                    } else {
                                                                                                        setSelectedIdentifiers(selectedIdentifiers.filter(id => id !== col.name));
                                                                                                    }
                                                                                                }}
                                                                                                className="w-4 h-4 rounded border-white/20 bg-white/5 text-main-blue focus:ring-main-blue"
                                                                                            />
                                                                                            <span className="text-sm text-white">{col.name}</span>
                                                                                        </label>
                                                                                    ))
                                                                                }
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Info about selected identifier */}
                                                                    {selectedIdentifiers.length > 0 && (
                                                                        <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                                                            <p className="text-xs text-blue-400 px-1">
                                                                                {identifierMode === 'single' 
                                                                                    ? `Using "${selectedIdentifiers[0]}" as identifier`
                                                                                    : `Combining ${selectedIdentifiers.join(' + ')} as identifier`
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Logging Toggle */}
                                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 bg-white/10 rounded-lg">
                                                                        <Database className="w-4 h-4 text-white/80" />
                                                                    </div>
                                                                    <div>
                                                                        <Label className="text-sm font-medium text-white">Enable Logging</Label>
                                                                        <p className="text-xs text-white/60">Track training progress</p>
                                                                    </div>
                                                                </div>
                                                                <Switch
                                                                    checked={isLogging}
                                                                    onCheckedChange={setIsLogging}
                                                                    className="data-[state=checked]:bg-main-blue"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right Column */}
                                                    <div className="space-y-4">
                                                        {/* Algorithm Settings */}
                                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                                            <h3 className="text-sm font-medium text-white/90 mb-3 flex items-center gap-2">
                                                                <div className="w-1 h-3 bg-main-blue rounded-full" />
                                                                Algorithm Settings
                                                            </h3>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="space-y-1.5">
                                                                    <Label className="text-xs font-medium text-white/80">Normalizer</Label>
                                                                    <Select value={normalizer} onValueChange={setNormalizer}>
                                                                        <SelectTrigger className="bg-white/5 border-white/20 text-white h-9 text-sm hover:bg-white/10 transition-colors">
                                                                            <SelectValue placeholder="Select" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="minmax">MinMax</SelectItem>
                                                                            <SelectItem value="zscore">Z-Score</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>

                                                                <div className="space-y-1.5">
                                                                    <Label className="text-xs font-medium text-white/80">Model Type</Label>
                                                                    <Select value={regression} onValueChange={setRegression}>
                                                                        <SelectTrigger className="bg-white/5 border-white/20 text-white h-9 text-sm hover:bg-white/10 transition-colors">
                                                                            <SelectValue placeholder="Select" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="linear">Linear</SelectItem>
                                                                            <SelectItem value="logistic">Logistic</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Training Parameters */}
                                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                                            <h3 className="text-sm font-medium text-white/90 mb-3 flex items-center gap-2">
                                                                <div className="w-1 h-3 bg-main-yellow rounded-full" />
                                                                Training Parameters
                                                            </h3>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="space-y-1.5">
                                                                    <Label className="text-xs font-medium text-white/80">Learning Rate</Label>
                                                                    <div className="relative">
                                                                        <Input
                                                                            type="number"
                                                                            step="0.001"
                                                                            min={0}
                                                                            value={learningRate}
                                                                            onChange={(e) => setLearningRate(e.target.value)}
                                                                            placeholder="0.01"
                                                                            className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-9 text-sm hover:bg-white/10 transition-colors focus:border-main-blue pr-10"
                                                                        />
                                                                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                                                            <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                                                                                learningRate ? 'bg-green-400' : 'bg-white/20'
                                                                            }`} />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-1.5">
                                                                    <Label className="text-xs font-medium text-white/80">Epochs</Label>
                                                                    <div className="relative">
                                                                        <Input
                                                                            type="number"
                                                                            min={1}
                                                                            value={epochs}
                                                                            onChange={(e) => setEpochs(e.target.value)}
                                                                            placeholder="100"
                                                                            className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-9 text-sm hover:bg-white/10 transition-colors focus:border-main-blue pr-10"
                                                                        />
                                                                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                                                            <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                                                                                epochs ? 'bg-green-400' : 'bg-white/20'
                                                                            }`} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Button */}
                                                <Button 
                                                    disabled={!learningRate || !epochs || selectedIdentifiers.length === 0}
                                                    className="w-full mt-5 h-10 bg-gradient-to-r from-main-blue to-main-blue/80 hover:from-main-blue/90 hover:to-main-blue/70 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]" 
                                                    onClick={handleTrain}
                                                >
                                                    <Play className="w-4 h-4 mr-2" />
                                                    Start Training
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>
                            )}
                        </div>

                        {/* Floating Info Cards */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 0.6, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.8 }}
                            className="absolute bottom-16 left-20 z-0"
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
                            className="absolute top-16 right-16 z-0"
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
                    </motion.div>
                )}
            </AnimatePresence>

            {/* No Common Columns Dialog */}
            <Dialog open={showNoCommonColumnsDialog} onOpenChange={setShowNoCommonColumnsDialog}>
                <DialogContent className="bg-main-dark border border-white/20 text-white max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl">
                            <AlertTriangle className="w-6 h-6 text-yellow-400" />
                            No Common Columns Found
                        </DialogTitle>
                        <DialogDescription className="text-white/70 mt-3">
                            {commonColumnsData?.error || "All parties must have at least one column with the same name to proceed with MPC"}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="mt-4 space-y-4">
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-white mb-3">Uploaded Column Summary:</h4>
                            <div className="space-y-2">
                                {commonColumnsData && Object.entries(commonColumnsData.all_columns_by_user).map(([userId, columns]) => (
                                    <div key={userId} className="flex items-start gap-3">
                                        <div className="flex items-center gap-2 min-w-[100px]">
                                            <User className="w-4 h-4 text-white/60" />
                                            <span className="text-sm font-medium text-white/80">{userId}:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {columns.map((col, idx) => (
                                                <span 
                                                    key={idx}
                                                    className="px-2 py-0.5 bg-white/10 border border-white/20 rounded text-xs text-white/90"
                                                >
                                                    {col}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-blue-400 mb-2">Recommendations:</h4>
                            <ul className="space-y-1.5 text-sm text-white/70">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-400 mt-0.5">•</span>
                                    All parties need to agree on a common identifier column name
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-400 mt-0.5">•</span>
                                    Rename columns to match before uploading (e.g., all use "user_id")
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-400 mt-0.5">•</span>
                                    Re-upload files with at least one matching column name
                                </li>
                            </ul>
                        </div>
                    </div>

                    <DialogFooter className="mt-6">
                        <Button
                            onClick={() => navigate('/')}
                            className="bg-gradient-to-r from-main-blue to-main-blue/80 hover:from-main-blue/90 hover:to-main-blue/70 text-white font-semibold rounded-lg transition-all duration-300"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Back to Home
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
};