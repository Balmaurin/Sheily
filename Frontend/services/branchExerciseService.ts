import axiosInstance from '@/services/axiosConfig';

export type ExerciseType = 'yes_no' | 'true_false' | 'multiple_choice';

export interface BranchSummary {
  id: number;
  branch_key: string;
  name: string;
  domain: string;
  description: string | null;
  progress?: BranchProgressSummary[];
  status?: string;
  metrics?: {
    average_accuracy: number;
    completed_levels: number;
    total_levels: number;
    total_attempts: number;
  };
}

export interface BranchProgressSummary {
  id: number;
  exercise_type: ExerciseType;
  level: number;
  accuracy: number | null;
  attempts: number;
  completed: boolean;
  tokens_awarded: number;
  verification_status: string;
  verification_source: string | null;
  dataset_snapshot: Record<string, unknown>;
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BranchExercise {
  id: number;
  branch_id: string;
  branch_name: string;
  scope: string;
  level: number;
  exercise_type: ExerciseType;
  question: string;
  options: unknown;
  options_detail?: { option_key: string | null; content: string; feedback?: string | null }[];
  metadata?: Record<string, unknown>;
  competency?: string | null;
  difficulty?: string | null;
  objective?: string | null;
  reference_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BranchExercisesResponse {
  branch: {
    id: number;
    branch_key: string;
    name: string;
  };
  exercises: BranchExercise[];
}

export interface CreateExercisePayload {
  scope: string;
  level: number;
  exercise_type: ExerciseType;
  question: string;
  correct_answer: string;
  explanation?: string | null;
  validation_source?: string | null;
  confidence_score?: number | null;
  options?: Array<string | { content: string; feedback?: string | null }>;
  metadata?: Record<string, unknown>;
  competency?: string | null;
  difficulty?: string | null;
  objective?: string | null;
  reference_url?: string | null;
}

export interface AttemptPayload {
  answer: string;
  option_key?: string | null;
}

export interface AttemptResponse {
  branch: {
    id: number;
    branch_key: string;
    name: string;
  };
  exercise: {
    id: number;
    level: number;
    exercise_type: ExerciseType;
    scope: string;
  };
  evaluation: {
    is_correct: boolean;
    accuracy: number;
    normalized_answer: string;
    option_key: string | null;
    correct_answer: string;
    explanation: string | null;
    validation_source: string | null;
    confidence_score: number | null;
  };
  attempt: {
    id: number;
    created_at: string;
  };
  progress: {
    accuracy: number;
    attempts: number;
    completed: boolean;
    tokens_awarded: number;
    verification_status: string;
  };
  tokens: {
    granted: number;
    total_awarded: number;
  };
}

export class BranchExerciseService {
  static async listBranches(includeProgress = false): Promise<BranchSummary[]> {
    const response = await axiosInstance.get('/api/branches', {
      params: includeProgress ? { includeProgress: true } : undefined,
    });
    return response.data.branches as BranchSummary[];
  }

  static async getTrainingBranches(): Promise<BranchSummary[]> {
    const response = await axiosInstance.get('/api/training/branches');
    const payload = response.data;
    if (Array.isArray(payload)) {
      return payload as BranchSummary[];
    }
    return (payload.branches || []) as BranchSummary[];
  }

  static async listExercises(
    branchKey: string,
    params?: { scope?: string; exercise_type?: ExerciseType; level?: number; limit?: number }
  ): Promise<BranchExercisesResponse> {
    const response = await axiosInstance.get(`/api/branches/${branchKey}/exercises`, {
      params: {
        scope: params?.scope,
        exerciseType: params?.exercise_type,
        level: params?.level,
        limit: params?.limit,
      },
    });
    return response.data as BranchExercisesResponse;
  }

  static async createExercise(branchKey: string, payload: CreateExercisePayload): Promise<BranchExercise> {
    const response = await axiosInstance.post(`/api/branches/${branchKey}/exercises`, payload);
    return response.data.exercise as BranchExercise;
  }

  static async deleteExercise(branchKey: string, exerciseId: number): Promise<void> {
    await axiosInstance.delete(`/api/branches/${branchKey}/exercises/${exerciseId}`);
  }

  static async submitAttempt(
    branchKey: string,
    exerciseId: number,
    payload: AttemptPayload
  ): Promise<AttemptResponse> {
    const response = await axiosInstance.post(
      `/api/branches/${branchKey}/exercises/${exerciseId}/attempts`,
      payload
    );
    return response.data as AttemptResponse;
  }
}

export default BranchExerciseService;
