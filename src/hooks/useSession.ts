import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SESSION_STORAGE_KEY = 'app_session';
const API_BASE = import.meta.env.VITE_REACT_APP_API_BASE;

export interface SessionData {
    userType: 'lead' | 'participant';
    userId: string;
    sessionId: string;
    participantCount: number;
}

export function useSession() {
    const location = useLocation();
    const state = (location.state as { session?: SessionData }) || {};
    const navigate = useNavigate();
    const [session, setSession] = useState<SessionData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let data: SessionData | null = null;

        if (state.session) {
            data = state.session;
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
            setSession(data);
        } else {
            const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
            if (stored) {
                data = JSON.parse(stored);
                setSession(data);
            } else if (location.pathname !== '/') {
                // Only navigate if we're not already on the home page
                navigate('/');
            }
        }
    }, [state.session, location.pathname, navigate]);

    const validateSession = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE}/sessions/${id}`);
            if (!res.ok) throw new Error('Session not found');
            const json = await res.json();
            if (json.joinedCount >= session!.participantCount) throw new Error('Session is full');
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    return { session, error, setError, validateSession };
}