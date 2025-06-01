import axios from "axios";

import { API_URL_LOCAL } from "@/constant";
import { RunConfig, SessionResult, SessionStateCheck } from "@/types";

class FormApi {
    private static axiosInstance = axios.create({
        baseURL: import.meta.env.VITE_API_URL || API_URL_LOCAL,
    });

    static async upload(form: FormData): Promise<void> {
        try {
            await this.axiosInstance.post("/upload", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || "Upload failed");
        }
    }

    static async run(sessionId: string, config: RunConfig): Promise<void> {
        try {
            await this.axiosInstance.post(`/sessions/${sessionId}/run`, config, {
                headers: { "Content-Type": "application/json"  },
            });
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || "Failed to start task");
        }
    }

    static async result(sessionId: string): Promise<SessionResult> {
        try {
            const response = await this.axiosInstance.get<SessionResult>(`/sessions/${sessionId}/result`, {       
                                headers: { "Content-Type": "application/json"  },
                            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || "Failed to get result");
        }
    }

    static async downloadModel(sessionId: string): Promise<void> {
        try {
            const response = await this.axiosInstance.get(`/sessions/${sessionId}/model/download`, {
                responseType: 'blob',
                headers: { "Content-Type": "application/octet-stream" },
            });
            
            // Extract filename from content-disposition header or use default
            const contentDisposition = response.headers['content-disposition'];
            let filename = `model_${sessionId}.pkl`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }
            
            // Create a blob and trigger download
            const blob = new Blob([response.data], { type: 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || "Failed to download model");
        }
    }

    static async checkState(sessionId: string, path: string, userId: string): Promise<SessionStateCheck> {
        try {
            const response = await this.axiosInstance.post<SessionStateCheck>(
                `/sessions/${sessionId}/check-state`,
                { path, user_id: userId },
                { headers: { "Content-Type": "application/json" } }
            );
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || "Failed to check session state");
        }
    }
}

export default FormApi;
