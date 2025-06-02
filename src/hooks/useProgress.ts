import { useEffect, useState } from "react";
import { WS_URL } from "@/constant"
import { useSession } from "./useSession";
import { ProgressMessage } from "@/types";

export function useProgress() {
    const [messages, setMessages] = useState<ProgressMessage[]>([]);
    const { session } = useSession();

    useEffect(() => {
        if (!session?.sessionId || !session?.userId) return;

        const ws = new WebSocket(`${WS_URL}/ws/${session.sessionId}/progress/${session.userId}`);

        ws.onopen = () => console.log("✅ WebSocket connected");
        ws.onerror = (err) => console.error("❌ WebSocket error", err);
        ws.onclose = () => console.log("🔌 WebSocket closed");

        ws.onmessage = (event) => {
            console.log("📨 WebSocket message", event.data);
            const newMessage: ProgressMessage = {
                message: event.data,
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, newMessage]);
        };

        return () => ws.close();
    }, [session?.sessionId, session?.userId]);

    return { messages };
}