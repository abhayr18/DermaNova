import axios from 'axios';

// Resolve API Base URL for Vercel Services multi-service routing:
// 1. Server-side (Vercel runtime functions / SSR): uses bound BACKEND_URL injected by Vercel service binding
// 2. Client-side (Browser): uses relative '/api/v1' routed by Vercel top-level rewrites, or NEXT_PUBLIC_API_URL
export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('dermanova_backend_url');
    if (saved) {
      return saved.replace(/\/$/, '');
    }
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    return '/api/v1';
  }
  if (process.env.BACKEND_URL) {
    return `${process.env.BACKEND_URL.replace(/\/$/, '')}/api/v1`;
  }
  return 'http://127.0.0.1:8000/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

// Configure Axios with Auth Token Interceptor
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
});

apiClient.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('dermanova_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.message === 'Network Error' || !error.response) {
      const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
      if (isVercel) {
        error.friendlyMessage =
          'Cannot reach the AI Backend. Your Vercel frontend needs a live cloud backend URL. Please set NEXT_PUBLIC_API_URL in Vercel Project Settings, or connect a live backend URL.';
      } else {
        error.friendlyMessage =
          'Unable to connect to the DermaNova AI backend. Please verify that the backend server is running on http://127.0.0.1:8000.';
      }
    }
    return Promise.reject(error);
  }
);

export interface ConditionScore {
  condition_id: string;
  display_name: string;
  probability: number;
  severity_level: string;
  is_detected: boolean;
  clinical_note: string;
}

export interface BoundingBox {
  x: number;      // 0 - 100 percentage
  y: number;      // 0 - 100 percentage
  width: number;  // 0 - 100 percentage
  height: number; // 0 - 100 percentage
}

export interface DetectedLesion {
  id: string;
  condition_id: string;
  condition_name: string;
  confidence: number;
  severity: string;
  location_label: string;
  box: BoundingBox;
  color: string;
  clinical_finding: string;
  recommended_active: string;
}

export interface AnalysisResponse {
  analysis_id: string;
  timestamp: string;
  overall_health_score: number;
  detected_skin_type: string;
  conditions: Record<string, ConditionScore>;
  top_concerns: string[];
  acne_severity_grade: string;
  heatmap_image_base64?: string;
  face_detected: boolean;
  clinical_disclaimer: string;
  requires_clinical_referral: boolean;
  detected_lesions?: DetectedLesion[];
}

export interface ActiveIngredient {
  name: string;
  target_condition: string;
  recommended_strength: string;
  mechanism_of_action: string;
  application_timing: string;
  precaution: string;
  barrier_support_pairing: string;
}

export interface SkincareProduct {
  product_name: string;
  category: string;
  brand: string;
  key_actives: string[];
  suitable_for_skin_types: string[];
  price_range: string;
  description: string;
}

export interface RoutineStep {
  step_number: number;
  step_name: string;
  product_category: string;
  recommended_action: string;
  product_name: string;
  key_actives: string;
  frequency: string;
}

export interface RecommendationResponse {
  recommendation_id: string;
  primary_active_ingredients: ActiveIngredient[];
  contraindications_avoided: string[];
  curated_products: SkincareProduct[];
  daily_routine: {
    morning_routine: RoutineStep[];
    evening_routine: RoutineStep[];
    weekly_treatments: string[];
    lifestyle_and_diet: string[];
  };
  dietary_guidance: string[];
  barrier_health_tips: string[];
}

export interface PatientProfile {
  age?: number;
  gender?: string;
  primary_skin_concern: string;
  baseline_skin_type: string;
  has_sensitive_skin: boolean;
  known_allergies: string[];
  sun_exposure_level: string;
  water_intake_liters: number;
  sleep_hours: number;
  is_pregnant_or_nursing: boolean;
}

export interface UserAccount {
  id: string;
  email: string;
  full_name: string;
  role: string;
  profile?: PatientProfile;
  total_scans?: number;
}

export interface TimelineScanItem {
  assessment_id: string;
  scan_number: number;
  phase_label: string;
  date: string;
  health_score: number;
  skin_type: string;
  primary_concern: string;
  acne_severity: string;
  image_url?: string;
  heatmap_url?: string;
  condition_scores: Record<string, number>;
  requires_referral: boolean;
}

export const apiService = {
  // Auth & Storage Tokens
  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dermanova_auth_token', token);
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dermanova_auth_token');
    }
    return null;
  },

  clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dermanova_auth_token');
    }
  },

  // User Authentication
  async signup(payload: { email: string; password: string; full_name: string; phone?: string }) {
    const res = await apiClient.post('/auth/signup', payload);
    if (res.data?.access_token) {
      this.setToken(res.data.access_token);
    }
    return res.data;
  },

  async login(payload: { email: string; password: string }) {
    const res = await apiClient.post('/auth/login', payload);
    if (res.data?.access_token) {
      this.setToken(res.data.access_token);
    }
    return res.data;
  },

  async getMe(): Promise<{ status: string; user: UserAccount }> {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  // DermaNova Medical Intake Quiz
  async updateProfile(profile: Partial<PatientProfile>) {
    const res = await apiClient.post('/auth/profile', profile);
    return res.data;
  },

  async getProfile(): Promise<{ status: string; profile: PatientProfile | null }> {
    const res = await apiClient.get('/auth/profile');
    return res.data;
  },

  // AI Diagnostic Analysis
  async analyzeFile(
    file: File,
    onProgress?: (progressPercent: number) => void
  ): Promise<AnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);
    // Let browser/Axios set correct multipart/form-data boundary automatically
    const response = await apiClient.post<AnalysisResponse>('/analyses', formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    }).catch(async (err) => {
      // Fallback to legacy endpoint if /analyses not available
      if (err?.response?.status === 404) {
        return await apiClient.post<AnalysisResponse>('/analyze', formData);
      }
      throw err;
    });
    return response.data;
  },

  async analyzeBase64(base64Data: string): Promise<AnalysisResponse> {
    const response = await apiClient.post<AnalysisResponse>('/analyze/base64', {
      image_base64: base64Data,
    });
    return response.data;
  },

  async getModelStatus(): Promise<{ model_loaded: boolean; status: string; supported_conditions: number }> {
    const response = await apiClient.get('/analyze/status');
    return response.data;
  },

  async getModelInfo(): Promise<any> {
    const response = await apiClient.get('/model-info');
    return response.data;
  },

  async getHealth(): Promise<any> {
    const response = await apiClient.get('/health');
    return response.data;
  },

  async forgotPassword(email: string) {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string) {
    const response = await apiClient.post('/auth/reset-password', { token, new_password: newPassword });
    return response.data;
  },

  // Pharmacological Recommendations
  async getRecommendations(params: {
    detected_conditions: Record<string, number>;
    skin_type: string;
    has_sensitive_skin: boolean;
  }): Promise<RecommendationResponse> {
    const response = await apiClient.post<RecommendationResponse>('/recommend', params);
    return response.data;
  },

  async getRecommendationsByAnalysisId(analysisId: string): Promise<RecommendationResponse> {
    const response = await apiClient.get<RecommendationResponse>(`/recommendations/${analysisId}`);
    return response.data;
  },

  // DermaNova Analyses CRUD & History
  async getAnalyses(page: number = 1, pageSize: number = 20): Promise<any> {
    const response = await apiClient.get('/analyses', {
      params: { page, page_size: pageSize }
    });
    return response.data;
  },

  async getAnalysis(analysisId: string): Promise<any> {
    const response = await apiClient.get(`/analyses/${analysisId}`);
    return response.data;
  },

  async deleteAnalysis(analysisId: string): Promise<any> {
    const response = await apiClient.delete(`/analyses/${analysisId}`);
    return response.data;
  },

  // DermaNova "Skin Journey" Longitudinal Progress & Analytics
  async getJourneyTimeline(): Promise<{ status: string; total_scans: number; timeline: TimelineScanItem[] }> {
    const response = await apiClient.get('/journey/timeline');
    return response.data;
  },

  async getJourneyStats(): Promise<any> {
    const response = await apiClient.get('/journey/stats');
    return response.data;
  },

  async logDailyRoutine(payload: {
    completed_am_routine: boolean;
    completed_pm_routine: boolean;
    applied_sunscreen: boolean;
    water_intake_liters?: number;
    barrier_comfort_rating?: number;
    notes?: string;
  }) {
    const response = await apiClient.post('/journey/log', payload);
    return response.data;
  },

  // Legacy History endpoint fallback
  async getHistory(): Promise<any> {
    const response = await apiClient.get('/history');
    return response.data;
  },

  // Backend Cloud URL Configuration & Diagnostics
  setCustomBackendUrl(url: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dermanova_backend_url', url.trim());
      apiClient.defaults.baseURL = url.trim();
    }
  },

  clearCustomBackendUrl() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dermanova_backend_url');
      apiClient.defaults.baseURL = getApiBaseUrl();
    }
  },

  getCustomBackendUrl(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dermanova_backend_url');
    }
    return null;
  },

  async testConnection(testUrl?: string): Promise<{ success: boolean; latencyMs: number; status?: any; error?: string }> {
    const raw = (testUrl || getApiBaseUrl()).replace(/\/$/, '');
    const url = raw.endsWith('/api/v1') ? `${raw}/health` : `${raw}/api/v1/health`;
    const start = Date.now();
    try {
      const resp = await axios.get(url, { timeout: 10000 });
      return {
        success: resp.status === 200,
        latencyMs: Date.now() - start,
        status: resp.data,
      };
    } catch (err: any) {
      return {
        success: false,
        latencyMs: Date.now() - start,
        error: err?.message || 'Connection failed',
      };
    }
  }
};

