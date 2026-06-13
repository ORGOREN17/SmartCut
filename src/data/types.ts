export interface FaceAnalysis {
  faceShape: string;
  hairType: string;
  hairDensity: string;
  skinTone: string;
  facialHair: string;
  currentLength: string;
  currentStyle?: string;
  hairlineType?: string;
}

export interface UserPreferences {
  desiredVibe: string;
  maintenanceLevel: string;
  setting: string;
  preferredLength: string;
}

export interface HairstyleDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  length: "short" | "medium" | "long";
  maintenance: "low" | "medium" | "high";
  tags: string[];
  popularityScore: number;
  trendScore: number;
  faceShapes: string[];
  hairTypes: string[];
  vibes: string[];
}

export interface GeneratedHairstyle extends HairstyleDefinition {
  generatedImageUrl: string | null;
  isGenerating: boolean;
  matchScore: number;
  explanation: string;
  error?: string;
  badge?: "best-match" | "most-professional" | "lowest-maintenance" | "boldest-change";
}

export interface ComparisonResult {
  similarityScore: number;
  matchLevel: string;
  feedback: string;
  details: { aspect: string; score: number; note: string }[];
  barberFeedback?: string[];
}

export interface ScanHistoryEntry {
  id: string;
  date: string;
  faceShape: string;
  topRecommendation: string;
  stylesViewed: number;
  userImageUrl?: string;
}

export type SortOption = "bestMatch" | "popular" | "newest" | "closestCurrent" | "boldest";
export type LengthFilter = "all" | "short" | "medium" | "long";
export type StyleFilter = "all" | "fade" | "classic" | "modern" | "textured" | "curly" | "business" | "bold";
export type VibeFilter = "all" | "low-maintenance" | "stylish" | "professional" | "trendy";
