import { useEffect, useState } from "react";
import { WS_URL } from "@/constant"
import { useSession } from "./useSession";

export function useProgress() {
    const [messages, setMessages] = useState<string[]>([]);
    const { session } = useSession();

    useEffect(() => {
        if (!session?.sessionId) return;

        const ws = new WebSocket(`${WS_URL}/ws/${session.sessionId}/progress`);

        ws.onopen = () => console.log("✅ WebSocket connected");
        ws.onerror = (err) => console.error("❌ WebSocket error", err);
        ws.onclose = () => console.log("🔌 WebSocket closed");

        ws.onmessage = (event) => {
            console.log("📨 WebSocket message", event.data);
            setMessages((prev) => [...prev, event.data]);
        };

        return () => ws.close();
    }, [session?.sessionId]);

    return { messages };
}