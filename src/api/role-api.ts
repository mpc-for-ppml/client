import axios from "axios";
import { API_URL_LOCAL } from "@/constant";

const BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE || API_URL_LOCAL;

class RoleApi {
    private static axiosInstance = axios.create({
        baseURL: BASE_URL,
        headers: { "Content-Type": "application/json" },
    });

    static async createSession(participantCount: number, leadUserId: string): Promise<string> {
        try {
            const response = await this.axiosInstance.post("/sessions/", {
                participant_count: participantCount,
                lead_user_id: leadUserId,
            });
            return response.data.session_id;
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || "Failed to create session");
        }
    }

    static async validateSession(sessionId: string): Promise<{ joined_count: number; participant_count: number }> {
        try {
            const response = await this.axiosInstance.get(`/sessions/${sessionId}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || "Invalid or full session");
        }
    }
}

export default RoleApi;
