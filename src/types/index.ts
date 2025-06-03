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

export type TimeData = {
    phase: string;
    time: number;
    fill: string;
};

export type ActualvsPredicted = {
    actual: number[];
    predicted: number[];
}

// Backend Model Types
export interface MilestoneData {
    phase: string;
    time: number;
    fill: string;
}

export interface Summary {
    model: string;
    milestoneData: MilestoneData[];
    rmse?: number;  // Optional for linear regression
    r2?: number;  // Optional for linear regression
    accuracy?: number;  // Optional for logistic regression
    f1?: number;  // Optional for logistic regression
    epochs: number;
    lr: number;
    modelPath?: string;  // Path to saved model pickle file
    modelSize?: string;  // Size of model file (e.g., "1.5 KB", "2.3 MB")
}

export interface Config {
    dataCount: number;
    parties: number;
}

export interface Coefficient {
    feature: string;
    value: number;
    type: string;
}

export interface ActualVsPredicted {
    actual: number[];
    predicted: number[];
}

export interface AucRocData {
    fpr: number[];  // False Positive Rate
    tpr: number[];  // True Positive Rate
    auc: number;    // Area Under Curve
}

export interface SessionResult {
    summary: Summary;
    config: Config;
    coefficients: Coefficient[];
    actualVsPredicted: ActualVsPredicted;
    aucRocData?: AucRocData;  // Optional, only for logistic regression
}

// Backend-related Types
// Requests and Responses
export interface IdentifierConfig {
    mode: 'single' | 'combined';
    columns: string[];
    separator?: string;
}

export interface RunConfig {
    userId: string;
    normalizer: string;
    regression: string;
    learningRate: number;
    epochs: number;
    label: string;
    isLogging: boolean;
    identifierConfig?: IdentifierConfig;
}

export interface SessionInfo {
    session_id: string;
    participant_count: number;
    joined_count: number;
    uploaded_count: number;
    is_lead: boolean;
    has_results: boolean;
}

export interface SessionStateCheck {
    allowed: boolean;
    reason: string;
    current_state: 'created' | 'uploading' | 'ready' | 'processing' | 'completed' | 'failed';
    session_info: SessionInfo;
}

export interface CommonColumn {
    name: string;
    is_potential_identifier: boolean;
    unique_counts: Record<string, number>;
    dtypes: Record<string, string>;
    sample_values: any[];
}

export interface CommonColumnsResponse {
    session_id: string;
    total_users: number;
    common_columns: CommonColumn[];
    potential_labels: string[];
    all_columns_by_user: Record<string, string[]>;
    error?: string;
    recommendation?: string;
}