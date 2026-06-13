import type { ComparisonResult } from "@/data/types";

/**
 * Demo comparison — produces a deterministic, realistic result
 * based on the selected hairstyle ID and uploaded file metadata.
 * No API calls. Instant.
 */
export function demoCompareHairstyles(
  styleId: string,
  fileName: string,
  fileSize: number
): ComparisonResult {
  const seed = hashString(styleId + fileName + fileSize);

  // Generate a base score 68–92 that feels realistic
  const baseScore = 68 + (seed % 25);

  const aspects = [
    { aspect: "Hair Length",        offset: (seed >> 3) % 15 - 5 },
    { aspect: "Side Shape",         offset: (seed >> 5) % 15 - 7 },
    { aspect: "Top Texture",        offset: (seed >> 7) % 15 - 6 },
    { aspect: "Fade/Taper",         offset: (seed >> 9) % 15 - 8 },
    { aspect: "Overall Silhouette", offset: (seed >> 11) % 15 - 4 },
    { aspect: "Styling Direction",  offset: (seed >> 13) % 15 - 6 },
  ];

  const details = aspects.map(({ aspect, offset }) => {
    const score = Math.min(98, Math.max(55, baseScore + offset));
    return {
      aspect,
      score,
      note: getNoteForScore(aspect, score),
    };
  });

  const similarityScore = Math.round(
    details.reduce((sum, d) => sum + d.score, 0) / details.length
  );

  return {
    similarityScore,
    matchLevel: getMatchLevel(similarityScore),
    feedback: getFeedback(similarityScore),
    details,
    barberFeedback: getBarberFeedback(details),
  };
}

function getBarberFeedback(details: { aspect: string; score: number }[]): string[] {
  const tips: Record<string, string> = {
    "Hair Length":        "Length on top is off — trim a touch shorter or leave more length to match the target.",
    "Side Shape":         "Sides are slightly off — re-shape the side panels to match the target outline.",
    "Top Texture":        "Top texture is flatter than the reference — add point-cutting or texturizing for movement.",
    "Fade/Taper":         "Fade transition is too sharp — soften the blend between guard lengths for a smoother gradient.",
    "Overall Silhouette": "Overall silhouette doesn't quite match — adjust the perimeter to recreate the target shape.",
    "Styling Direction":  "Styling direction differs — restyle with product to push the hair in the target direction.",
  };
  const weakest = [...details].sort((a, b) => a.score - b.score).filter((d) => d.score < 85).slice(0, 4);
  const feedback = weakest.map((d) => tips[d.aspect]).filter(Boolean) as string[];
  if (feedback.length === 0) {
    feedback.push("Excellent execution — the result closely matches the target across all aspects.");
  }
  return feedback;
}

function getMatchLevel(score: number): string {
  if (score >= 90) return "Excellent Match";
  if (score >= 80) return "Very Close";
  if (score >= 70) return "Good Match";
  if (score >= 60) return "Partial Match";
  return "Needs Improvement";
}

function getFeedback(score: number): string {
  if (score >= 90) return "The result is nearly identical to the target style. Outstanding execution.";
  if (score >= 80) return "Very close to the target look. Minor differences in texture and volume.";
  if (score >= 70) return "Good overall match with some differences in length and styling direction.";
  return "Partial match — the general shape is similar but details differ noticeably.";
}

function getNoteForScore(aspect: string, score: number): string {
  const notes: Record<string, string[]> = {
    "Hair Length":        ["Exact length match", "Very similar length", "Slightly different length", "Noticeable length difference"],
    "Side Shape":         ["Sides match perfectly", "Sides are well matched", "Minor side variation", "Side shape differs"],
    "Top Texture":        ["Texture is spot on", "Very close texture", "Slight texture difference", "Texture varies noticeably"],
    "Fade/Taper":         ["Fade matches exactly", "Fade level is close", "Fade could be tighter", "Fade level differs"],
    "Overall Silhouette": ["Silhouette is identical", "Great overall shape", "Shape mostly matches", "Silhouette needs adjustment"],
    "Styling Direction":  ["Direction matches perfectly", "Very similar direction", "Slightly different direction", "Direction varies"],
  };
  const bucket = score >= 85 ? 0 : score >= 75 ? 1 : score >= 65 ? 2 : 3;
  return notes[aspect]?.[bucket] ?? "Looks good";
}

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}
