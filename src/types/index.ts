// Frontend-related Types
// Data view templates
export interface SessionData {
    userType: 'lead' | 'participant';
    userId: string;
    sessionId: string;
    participantCount: number;
}

export type ProgressMessage = {
    message: string;
    timestamp: string; // or Date
};

// Backend-related Types
// Requests and Responses
export interface RunConfig {
    userId: string;
    normalizer: string;
    regression: string;
    learningRate: number;
    epochs: number;
    isLogging: boolean;
}