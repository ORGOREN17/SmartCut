export interface AnalysisResult {
  faceShape: string;
  hairType: string;
  skinTone: string;
}

export interface Hairstyle {
  id: string;
  name: string;
  matchPercentage: number;
  description: string;
  imageUrl: string;
  isBestMatch: boolean;
}

export interface ScanHistory {
  id: string;
  date: string;
  faceShape: string;
  topRecommendation: string;
}

export const mockAnalysis: AnalysisResult = {
  faceShape: "Oval",
  hairType: "Wavy, Medium Density",
  skinTone: "Warm Beige",
};

export const mockHairstyles: Hairstyle[] = [
  {
    id: "1",
    name: "Textured Crop",
    matchPercentage: 96,
    description: "A modern textured crop that complements oval face shapes perfectly. Low maintenance with a natural, effortless look.",
    imageUrl: "",
    isBestMatch: true,
  },
  {
    id: "2",
    name: "Side Part Fade",
    matchPercentage: 89,
    description: "Classic side part with a gradual fade. Adds structure and works beautifully with wavy hair texture.",
    imageUrl: "",
    isBestMatch: false,
  },
  {
    id: "3",
    name: "French Crop",
    matchPercentage: 84,
    description: "A timeless French crop with a clean fringe. Great for warm skin tones and medium-density hair.",
    imageUrl: "",
    isBestMatch: false,
  },
  {
    id: "4",
    name: "Slicked Back Undercut",
    matchPercentage: 78,
    description: "Bold and polished. The undercut adds contrast while the slicked back top elongates the face.",
    imageUrl: "",
    isBestMatch: false,
  },
  {
    id: "5",
    name: "Messy Quiff",
    matchPercentage: 72,
    description: "Relaxed and trendy. The volume on top works well with wavy hair and adds personality.",
    imageUrl: "",
    isBestMatch: false,
  },
];

export const mockHistory: ScanHistory[] = [
  { id: "1", date: "2026-04-10", faceShape: "Oval", topRecommendation: "Textured Crop" },
  { id: "2", date: "2026-03-22", faceShape: "Oval", topRecommendation: "Side Part Fade" },
  { id: "3", date: "2026-02-15", faceShape: "Oval", topRecommendation: "French Crop" },
];

export const mockUser = {
  name: "Alex Johnson",
  email: "alex@example.com",
  savedStyles: ["Textured Crop", "French Crop"],
};
