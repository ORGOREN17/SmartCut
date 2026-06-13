export interface UserProfile {
  // Basic Info
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  city: string;
  country: string;
  email: string;

  // Hair Profile
  hairType: string;
  currentHairLength: string;
  hairDensity: string;
  hairlineStatus: string;
  facialHair: string;

  // Style Preferences
  preferredVibe: string;
  maintenanceLevel: string;
  preferredLength: string;
  opennessToChange: string;

  // Lifestyle
  workStyle: string;
  haircutFrequency: string;
  stylingRoutine: string;
  notes: string;
}

export const DEFAULT_PROFILE: UserProfile = {
  firstName: "",
  lastName: "",
  age: "",
  gender: "",
  city: "",
  country: "",
  email: "",
  hairType: "",
  currentHairLength: "",
  hairDensity: "",
  hairlineStatus: "",
  facialHair: "",
  preferredVibe: "",
  maintenanceLevel: "",
  preferredLength: "",
  opennessToChange: "",
  workStyle: "",
  haircutFrequency: "",
  stylingRoutine: "",
  notes: "",
};

const STORAGE_KEY = "smartcut_user_profile";

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function clearProfile(): void {
  localStorage.removeItem(STORAGE_KEY);
}
