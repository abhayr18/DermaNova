import axios from 'axios';

// Resolve API Base URL for Vercel Services multi-service routing:
// 1. Server-side (Vercel runtime functions / SSR): uses bound BACKEND_URL injected by Vercel service binding
// 2. Client-side (Browser): uses relative '/api/v1' routed by Vercel top-level rewrites, or NEXT_PUBLIC_API_URL
const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8000/api/v1';
    }
    return 'https://dermanova.onrender.com/api/v1';
  }
  if (process.env.BACKEND_URL) {
    return `${process.env.BACKEND_URL.replace(/\/$/, '')}/api/v1`;
  }
  return 'https://dermanova.onrender.com/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

// Configure Axios with Auth Token Interceptor
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  if (!config.baseURL) {
    config.baseURL = getApiBaseUrl();
  }
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('dermanova_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface ConditionScore {
  condition_id: string;
  display_name: string;
  probability: number;
  severity_level: string;
  is_detected: boolean;
  clinical_note: string;
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

  // CureSkin Medical Intake Quiz
  async updateProfile(profile: Partial<PatientProfile>) {
    const res = await apiClient.post('/auth/profile', profile);
    return res.data;
  },

  async getProfile(): Promise<{ status: string; profile: PatientProfile | null }> {
    const res = await apiClient.get('/auth/profile');
    return res.data;
  },

  // AI Diagnostic Analysis
  async analyzeFile(file: File): Promise<AnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<AnalysisResponse>('/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async analyzeBase64(base64Data: string): Promise<AnalysisResponse> {
    const response = await apiClient.post<AnalysisResponse>('/analyze/base64', {
      image_base64: base64Data,
    });
    return response.data;
  },

  async getDemoAnalysis(): Promise<AnalysisResponse> {
    const response = await apiClient.get<AnalysisResponse>('/analyze/demo');
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

  // CureSkin "Skin Journey" Timeline & Analytics
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
  }
};
