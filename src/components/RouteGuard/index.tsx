import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import FormApi from "@/api/form-api";
import { useSession, SessionData } from "@/hooks/useSession";
import {
    Dialog,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Custom dialog components without close button and with main-dark overlay
const CustomDialogOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            "fixed inset-0 z-50 bg-main-dark/95 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            className
        )}
        {...props}
    />
));
CustomDialogOverlay.displayName = "CustomDialogOverlay";

const CustomDialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
    <DialogPrimitive.Portal>
        <CustomDialogOverlay />
        <DialogPrimitive.Content
            ref={ref}
            className={cn(
                "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
                className
            )}
            {...props}
        >
            {children}
            {/* No close button here */}
        </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
));
CustomDialogContent.displayName = "CustomDialogContent";

interface RouteGuardProps {
    children: React.ReactNode;
    requiredPath: "form-upload" | "log" | "result";
}

const pathOrder = ["form-upload", "log", "result"];

const getPathIndex = (path: string) => pathOrder.indexOf(path);

const getRedirectPath = (currentState: string, sessionId: string): string => {
    switch (currentState) {
        case "created":
        case "uploading":
            return `/form/${sessionId}`;
        case "ready":
        case "processing":
            return `/log/${sessionId}`;
        case "completed":
            return `/result/${sessionId}`;
        case "failed":
            return "/";
        default:
            return "/";
    }
};

const getStateMessage = (currentState: string): string => {
    switch (currentState) {
        case "created":
            return "Session created, waiting for participants to join";
        case "uploading":
            return "Participants are uploading their files";
        case "ready":
            return "All files uploaded, ready to start training";
        case "processing":
            return "Model training in progress";
        case "completed":
            return "Training completed successfully";
        case "failed":
            return "Training failed";
        default:
            return "Unknown state";
    }
};

export const RouteGuard: React.FC<RouteGuardProps> = ({ children, requiredPath }) => {
    const { id: sessionId } = useParams<{ id: string }>();
    const { session } = useSession();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [showRedirectDialog, setShowRedirectDialog] = useState(false);
    const [accessChecked, setAccessChecked] = useState(false);
    const [redirectInfo, setRedirectInfo] = useState<{
        path: string;
        reason: string;
        currentState: string;
    } | null>(null);

    useEffect(() => {
        let isMounted = true;
        let checkTimeout: NodeJS.Timeout;

        const performAccessCheck = async () => {
            // Skip if already checked or component unmounted
            if (!isMounted || accessChecked) return;

            // Check if we have session data
            if (!session) {
                // Check if session is in navigation state
                const state = location.state as { session?: SessionData } | null;
                if (state?.session) {
                    // Wait for useSession hook to process the state
                    checkTimeout = setTimeout(() => {
                        if (isMounted) performAccessCheck();
                    }, 100);
                    return;
                }
                
                // Wait a bit more for session from storage
                checkTimeout = setTimeout(() => {
                    if (isMounted && !session) {
                        toast.error("Missing session or user information");
                        navigate("/");
                    }
                }, 500);
                return;
            }

            // Validate we have required data
            if (!sessionId || !session.userId) {
                toast.error("Missing session or user information");
                navigate("/");
                return;
            }

            try {
                const stateCheck = await FormApi.checkState(sessionId, requiredPath, session.userId);
                
                if (!isMounted) return;
                
                setAccessChecked(true);

                // Check if we should show dialog even if access is allowed
                // This handles the case where backend allows log access but results are ready
                if (stateCheck.current_state === 'completed' && requiredPath !== 'result') {
                    // Results are ready but user is trying to access form or log
                    setRedirectInfo({
                        path: `/result/${sessionId}`,
                        reason: 'Training has been completed. Results are available.',
                        currentState: stateCheck.current_state,
                    });
                    setShowRedirectDialog(true);
                    setLoading(false);
                } else if (!stateCheck.allowed) {
                    const redirectPath = getRedirectPath(stateCheck.current_state, sessionId);
                    
                    // Show dialog for both forward and backward navigation attempts
                    setRedirectInfo({
                        path: redirectPath,
                        reason: stateCheck.reason,
                        currentState: stateCheck.current_state,
                    });
                    setShowRedirectDialog(true);
                    setLoading(false);
                } else {
                    // Access allowed
                    setLoading(false);
                }
            } catch (error) {
                if (isMounted) {
                    toast.error((error as Error).message || "Failed to validate access");
                    navigate("/");
                }
            }
        };

        performAccessCheck();

        return () => {
            isMounted = false;
            if (checkTimeout) clearTimeout(checkTimeout);
        };
    }, [sessionId, session?.userId, requiredPath, navigate]);

    const handleRedirect = () => {
        if (redirectInfo) {
            setShowRedirectDialog(false);
            navigate(redirectInfo.path);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-main-dark text-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-white/60">Validating access...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {!showRedirectDialog && children}
            <Dialog open={showRedirectDialog} onOpenChange={() => {}}>
                <CustomDialogContent className="bg-main-dark border border-white/20 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                            {redirectInfo?.currentState === 'completed' && (
                                <CheckCircle className="h-6 w-6 text-green-500" />
                            )}
                            {redirectInfo?.currentState === 'completed' ? 'Results Available!' : 'Access Restricted'}
                        </DialogTitle>
                        <DialogDescription className="text-white/80">
                            {(() => {
                                if (redirectInfo?.currentState === 'completed') {
                                    return requiredPath === 'log' 
                                        ? 'The training has already been completed. You can view the results now.'
                                        : 'The training has been completed and results are ready to view.';
                                }
                                
                                // Check if trying to skip ahead
                                const currentPathIndex = getPathIndex(requiredPath);
                                const correctPath = getRedirectPath(redirectInfo?.currentState || '', sessionId || '');
                                const correctPathIndex = pathOrder.findIndex(p => correctPath.includes(p));
                                
                                if (currentPathIndex > correctPathIndex) {
                                    return 'This page is not available yet. Please complete the current step first.';
                                }
                                
                                return 'You cannot go back to this page.';
                            })()}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="bg-white/10 rounded-lg p-4">
                            <p className="text-sm mb-2">
                                <span className="font-medium">Current Status:</span>{" "}
                                {redirectInfo && getStateMessage(redirectInfo.currentState)}
                            </p>
                            <p className="text-sm text-white/60">
                                {redirectInfo?.reason}
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <Button
                                onClick={handleRedirect}
                                className={redirectInfo?.currentState === 'completed' 
                                    ? "bg-green-600 hover:bg-green-700 text-white" 
                                    : "bg-main-blue hover:bg-main-blue/80 text-white"}
                            >
                                {(() => {
                                    if (redirectInfo?.currentState === 'completed') {
                                        return 'View Results';
                                    }
                                    
                                    // Determine button text based on where they need to go
                                    const path = redirectInfo?.path || '';
                                    if (path.includes('form')) {
                                        return 'Go to Upload Form';
                                    } else if (path.includes('log')) {
                                        return 'Go to Training Log';
                                    } else if (path.includes('result')) {
                                        return 'View Results';
                                    }
                                    
                                    return 'Go to Current Step';
                                })()}
                            </Button>
                        </div>
                    </div>
                </CustomDialogContent>
            </Dialog>
        </>
    );
};