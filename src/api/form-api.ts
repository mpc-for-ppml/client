import axios from "axios";

import { API_URL_LOCAL } from "@/constant";

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
}

export default FormApi;
