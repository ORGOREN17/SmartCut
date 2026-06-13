import type { HairstyleDefinition } from "./types";

export const hairstyleDefinitions: HairstyleDefinition[] = [
  { id: "1", name: "Textured Crop", description: "Short textured top with a clean fade on the sides. Modern and effortless.", category: "modern", length: "short", maintenance: "low", tags: ["textured", "modern", "trendy"], popularityScore: 95, trendScore: 92, faceShapes: ["oval", "square", "diamond"], hairTypes: ["straight", "wavy"], vibes: ["trendy", "low-maintenance"] },
  { id: "2", name: "Side Part Fade", description: "Classic side part with a mid skin fade. Professional and sharp.", category: "classic", length: "short", maintenance: "medium", tags: ["fade", "classic", "professional"], popularityScore: 90, trendScore: 85, faceShapes: ["oval", "round", "heart"], hairTypes: ["straight", "wavy"], vibes: ["professional", "stylish"] },
  { id: "3", name: "French Crop", description: "Short cropped top with a straight fringe and tapered sides.", category: "modern", length: "short", maintenance: "low", tags: ["modern", "textured", "fringe"], popularityScore: 88, trendScore: 90, faceShapes: ["oval", "square", "oblong"], hairTypes: ["straight", "wavy", "curly"], vibes: ["trendy", "low-maintenance"] },
  { id: "4", name: "Slicked Back Undercut", description: "Long top slicked back with shaved sides. Bold and formal.", category: "bold", length: "medium", maintenance: "high", tags: ["bold", "undercut", "formal"], popularityScore: 82, trendScore: 78, faceShapes: ["oval", "diamond", "heart"], hairTypes: ["straight"], vibes: ["stylish", "professional"] },
  { id: "5", name: "Messy Quiff", description: "Textured quiff with volume on top and short sides. Effortlessly cool.", category: "modern", length: "medium", maintenance: "medium", tags: ["modern", "textured", "volume"], popularityScore: 86, trendScore: 88, faceShapes: ["oval", "round", "square"], hairTypes: ["straight", "wavy"], vibes: ["trendy", "stylish"] },
  { id: "6", name: "Buzz Cut", description: "Ultra-short all around. Minimal, clean, and low-maintenance.", category: "fade", length: "short", maintenance: "low", tags: ["fade", "minimal", "clean"], popularityScore: 91, trendScore: 80, faceShapes: ["oval", "square", "diamond"], hairTypes: ["straight", "wavy", "curly", "coily"], vibes: ["low-maintenance", "professional"] },
  { id: "7", name: "Classic Pompadour", description: "Voluminous top swept back with tapered sides. Timeless elegance.", category: "classic", length: "medium", maintenance: "high", tags: ["classic", "volume", "retro"], popularityScore: 84, trendScore: 75, faceShapes: ["oval", "round", "heart"], hairTypes: ["straight", "wavy"], vibes: ["stylish", "professional"] },
  { id: "8", name: "Surfer Flow", description: "Longer wavy hair with natural texture. Relaxed beach vibe.", category: "modern", length: "long", maintenance: "low", tags: ["modern", "casual", "natural"], popularityScore: 78, trendScore: 82, faceShapes: ["oval", "oblong", "diamond"], hairTypes: ["wavy", "curly"], vibes: ["trendy", "low-maintenance"] },
  { id: "9", name: "Textured Afro", description: "Natural curly texture with defined shape. Bold and expressive.", category: "curly", length: "medium", maintenance: "medium", tags: ["curly", "natural", "textured"], popularityScore: 80, trendScore: 86, faceShapes: ["oval", "round", "heart", "diamond"], hairTypes: ["curly", "coily"], vibes: ["trendy", "stylish"] },
  { id: "10", name: "Man Bun Undercut", description: "Long top tied in a bun with shaved sides. Bold statement look.", category: "bold", length: "long", maintenance: "medium", tags: ["bold", "undercut", "long"], popularityScore: 74, trendScore: 72, faceShapes: ["oval", "square", "diamond"], hairTypes: ["straight", "wavy"], vibes: ["stylish", "trendy"] },
  { id: "11", name: "Crew Cut", description: "Slightly longer on top, short on sides. Clean military-inspired look.", category: "classic", length: "short", maintenance: "low", tags: ["classic", "military", "clean"], popularityScore: 92, trendScore: 70, faceShapes: ["oval", "square", "oblong"], hairTypes: ["straight", "wavy", "curly"], vibes: ["low-maintenance", "professional"] },
  { id: "12", name: "Modern Mullet", description: "Short front and sides with longer back. Edgy retro-modern revival.", category: "bold", length: "medium", maintenance: "medium", tags: ["bold", "trendy", "textured"], popularityScore: 70, trendScore: 95, faceShapes: ["oval", "diamond", "heart"], hairTypes: ["straight", "wavy"], vibes: ["trendy", "stylish"] },
  { id: "13", name: "Curtain Bangs", description: "Middle-parted fringe framing the face. Effortless K-drama style.", category: "modern", length: "medium", maintenance: "low", tags: ["modern", "fringe", "casual"], popularityScore: 85, trendScore: 93, faceShapes: ["oval", "round", "square", "heart"], hairTypes: ["straight", "wavy"], vibes: ["trendy", "stylish"] },
  { id: "14", name: "Taper Fade Design", description: "Precision taper with line design work. Artistic and sharp.", category: "fade", length: "short", maintenance: "medium", tags: ["fade", "artistic", "bold"], popularityScore: 83, trendScore: 88, faceShapes: ["oval", "square", "diamond", "round"], hairTypes: ["straight", "wavy", "curly", "coily"], vibes: ["trendy", "stylish"] },
  { id: "15", name: "Executive Slick Back", description: "Polished slick back with a clean part. Boardroom-ready.", category: "classic", length: "medium", maintenance: "high", tags: ["classic", "formal", "business"], popularityScore: 87, trendScore: 74, faceShapes: ["oval", "diamond", "oblong"], hairTypes: ["straight"], vibes: ["professional", "stylish"] },
  { id: "16", name: "Low Skin Fade", description: "Gradual fade from skin at the temples. Clean and versatile.", category: "fade", length: "short", maintenance: "low", tags: ["fade", "clean", "modern"], popularityScore: 89, trendScore: 84, faceShapes: ["oval", "round", "square"], hairTypes: ["straight", "wavy", "curly"], vibes: ["low-maintenance", "professional"] },
  { id: "17", name: "Ivy League", description: "Slightly longer crew cut with a side part option. Preppy and refined.", category: "classic", length: "short", maintenance: "medium", tags: ["classic", "preppy", "professional"], popularityScore: 86, trendScore: 72, faceShapes: ["oval", "square", "oblong"], hairTypes: ["straight", "wavy"], vibes: ["professional", "stylish"] },
  { id: "18", name: "Faux Hawk Fade", description: "Mohawk-inspired style with faded sides. Edgy without commitment.", category: "bold", length: "short", maintenance: "medium", tags: ["bold", "fade", "edgy"], popularityScore: 76, trendScore: 80, faceShapes: ["oval", "diamond", "square"], hairTypes: ["straight", "wavy"], vibes: ["trendy", "stylish"] },
  { id: "19", name: "Textured Fringe", description: "Choppy textured fringe falling forward. Youthful and trendy.", category: "modern", length: "medium", maintenance: "low", tags: ["modern", "fringe", "textured"], popularityScore: 84, trendScore: 91, faceShapes: ["oval", "round", "heart"], hairTypes: ["straight", "wavy"], vibes: ["trendy", "low-maintenance"] },
  { id: "20", name: "High & Tight", description: "Very short sides with slightly longer top. Military precision.", category: "fade", length: "short", maintenance: "low", tags: ["fade", "military", "clean"], popularityScore: 88, trendScore: 68, faceShapes: ["oval", "square", "diamond", "oblong"], hairTypes: ["straight", "wavy", "curly", "coily"], vibes: ["low-maintenance", "professional"] },
  { id: "21", name: "Disconnected Undercut", description: "Sharp contrast between long top and shaved sides. High impact.", category: "bold", length: "medium", maintenance: "high", tags: ["bold", "undercut", "contrast"], popularityScore: 79, trendScore: 82, faceShapes: ["oval", "diamond", "heart"], hairTypes: ["straight", "wavy"], vibes: ["stylish", "trendy"] },
  { id: "22", name: "Brush Up", description: "Hair brushed upward and back with textured volume. Dynamic look.", category: "modern", length: "short", maintenance: "medium", tags: ["modern", "volume", "textured"], popularityScore: 81, trendScore: 84, faceShapes: ["oval", "round", "square"], hairTypes: ["straight", "wavy"], vibes: ["trendy", "stylish"] },
  { id: "23", name: "Caesar Cut", description: "Short horizontal fringe with even length all around. Clean classic.", category: "classic", length: "short", maintenance: "low", tags: ["classic", "fringe", "clean"], popularityScore: 83, trendScore: 70, faceShapes: ["oval", "round", "square", "oblong"], hairTypes: ["straight", "wavy", "curly"], vibes: ["low-maintenance", "professional"] },
  { id: "24", name: "Spiky Hair", description: "Short hair spiked up with product. Energetic and bold.", category: "bold", length: "short", maintenance: "medium", tags: ["bold", "textured", "edgy"], popularityScore: 72, trendScore: 65, faceShapes: ["oval", "round"], hairTypes: ["straight"], vibes: ["trendy", "stylish"] },
  { id: "25", name: "Curly Undercut", description: "Natural curls on top with shaved sides. Modern contrast style.", category: "curly", length: "medium", maintenance: "medium", tags: ["curly", "undercut", "modern"], popularityScore: 77, trendScore: 87, faceShapes: ["oval", "round", "heart", "diamond"], hairTypes: ["curly", "coily"], vibes: ["trendy", "stylish"] },
  { id: "26", name: "Shaggy Layers", description: "Longer layered cut with movement and texture. Rockstar energy.", category: "modern", length: "long", maintenance: "low", tags: ["modern", "casual", "textured"], popularityScore: 75, trendScore: 89, faceShapes: ["oval", "diamond", "heart"], hairTypes: ["straight", "wavy"], vibes: ["trendy", "low-maintenance"] },
  { id: "27", name: "Tousled Medium", description: "Medium length with natural messy texture. Casual and charming.", category: "modern", length: "medium", maintenance: "low", tags: ["modern", "casual", "natural"], popularityScore: 80, trendScore: 83, faceShapes: ["oval", "oblong", "diamond", "heart"], hairTypes: ["wavy", "straight"], vibes: ["low-maintenance", "trendy"] },
  { id: "28", name: "Sharp Taper", description: "Clean taper with defined edges. Business-ready precision.", category: "fade", length: "short", maintenance: "medium", tags: ["fade", "clean", "business"], popularityScore: 85, trendScore: 79, faceShapes: ["oval", "square", "round"], hairTypes: ["straight", "wavy", "curly"], vibes: ["professional", "stylish"] },
  { id: "29", name: "Pompadour Fade", description: "Classic pompadour with modern fade blend. Best of both worlds.", category: "classic", length: "medium", maintenance: "high", tags: ["classic", "fade", "volume"], popularityScore: 82, trendScore: 81, faceShapes: ["oval", "round", "heart"], hairTypes: ["straight", "wavy"], vibes: ["stylish", "professional"] },
  { id: "30", name: "Wolf Cut", description: "Heavily layered with volume on top. TikTok-famous wild look.", category: "bold", length: "medium", maintenance: "low", tags: ["bold", "trendy", "layered"], popularityScore: 81, trendScore: 96, faceShapes: ["oval", "diamond", "heart", "round"], hairTypes: ["straight", "wavy"], vibes: ["trendy", "stylish"] },
];

export function scoreHairstyles(
  styles: HairstyleDefinition[],
  faceShape: string,
  hairType: string,
  preferences?: { vibe?: string; maintenance?: string; length?: string }
): Array<HairstyleDefinition & { matchScore: number; explanation: string }> {
  const safeFaceShape = (faceShape || "oval").toString();
  const safeHairType = (hairType || "straight").toString();

  return styles.map((s) => {
    let score = 50;
    const reasons: string[] = [];

    if (s.faceShapes.includes(safeFaceShape.toLowerCase())) {
      score += 25;
      reasons.push(`Great for ${safeFaceShape} face shapes`);
    }

    const ht = safeHairType.toLowerCase().split(",")[0].trim();
    if (s.hairTypes.some((t) => ht.includes(t))) {
      score += 20;
      reasons.push(`Works well with ${safeHairType.split(",")[0]} hair`);
    }

    if (preferences?.vibe && s.vibes.includes(preferences.vibe)) {
      score += 10;
      reasons.push(`Matches your ${preferences.vibe} vibe`);
    }
    if (preferences?.maintenance && s.maintenance === preferences.maintenance) {
      score += 8;
      reasons.push(`${s.maintenance} maintenance fits your lifestyle`);
    }
    if (preferences?.length && s.length === preferences.length) {
      score += 7;
      reasons.push(`Perfect ${s.length} length as preferred`);
    }

    score += Math.round(((s.trendScore + s.popularityScore) / 200) * 10);
    score += Math.round((Math.sin(parseInt(s.id) * 7.3) + 1) * 3);
    score = Math.min(99, Math.max(40, score));

    const explanation =
      reasons.length > 0
        ? reasons.slice(0, 2).join(". ") + "."
        : `A versatile ${s.category} style that suits many face types.`;

    return { ...s, matchScore: score, explanation };
  });
}
