import type { FaceAnalysis } from "@/data/types";

/**
 * Demo face analysis — returns realistic mock attributes instantly.
 * Deterministic: same file produces same result.
 */
export function demoAnalyzeFace(file: File): FaceAnalysis {
  // Seed from file name + size for deterministic results
  const seed = hashString(file.name + file.size);

  const faceShapes = ["oval", "round", "square", "heart", "diamond", "oblong"] as const;
  const hairTypes = ["straight", "wavy", "curly", "coily"] as const;
  const densities = ["thin", "medium", "thick"] as const;
  const skinTones = ["Warm Beige", "Cool Ivory", "Olive Tan", "Deep Brown", "Golden Bronze", "Fair Porcelain"];
  const facialHairs = ["Clean Shaven", "Light Stubble", "Medium Stubble", "Full Beard", "Goatee"];
  const lengths = ["very short", "short", "short-medium", "medium", "medium-long", "long"] as const;
  const hairlines = ["straight", "rounded", "widow's peak", "high", "low"] as const;

  return {
    faceShape: faceShapes[seed % faceShapes.length],
    hairType: hairTypes[(seed >> 3) % hairTypes.length],
    hairDensity: densities[(seed >> 5) % densities.length],
    skinTone: skinTones[(seed >> 7) % skinTones.length],
    facialHair: facialHairs[(seed >> 9) % facialHairs.length],
    currentLength: lengths[(seed >> 11) % lengths.length],
    currentStyle: "Natural textured crop",
    hairlineType: hairlines[(seed >> 13) % hairlines.length],
  };
}

/** Simple deterministic hash for a string → positive integer */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}
