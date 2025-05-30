import axios from "axios";

import { API_URL_LOCAL } from "@/constant";
import { RunConfig } from "@/types";

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
}

export default FormApi;
