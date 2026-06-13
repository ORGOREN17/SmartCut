import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, ArrowLeft, Download, RotateCcw, Loader2, Scissors, Star, Copy, ExternalLink, Check, Share2 } from "lucide-react";
import { toast } from "sonner";
import { compareHairstyles, fileToBase64 } from "@/services/api";
import type { ComparisonResult } from "@/data/types";
import SocialShare from "@/components/SocialShare";
import { useUsageGate } from "@/hooks/useUsageGate";
import UpgradeModal from "@/components/UpgradeModal";
import { clearComparisonImagePayload, getComparisonImagePayload, saveComparisonImagePayload, getSelectedStyle } from "@/services/comparisonFlowStore";

interface UploadedFileMeta {
  name: string;
  size: number;
}

interface SelectedStyle {
  id: string;
  name: string;
  matchScore: number;
  explanation: string;
  generatedImageUrl: string;
}

const ComparePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromGuidance = Boolean((location.state as { fromGuidance?: boolean } | null)?.fromGuidance);
  const [selectedStyle, setSelectedStyle] = useState<SelectedStyle | null>(() => {
    try {
      const fromStore = getSelectedStyle();
      if (fromStore?.id && fromStore.generatedImageUrl) {
        console.log("[ComparePage] Loaded selected style from store:", fromStore.id, fromStore.name);
        return fromStore;
      }
    } catch (error) {
      console.warn("[ComparePage] Could not read selected style", error);
    }
    return null;
  });
  // Pre-load any image uploaded on the GuidancePage so the analysis runs automatically
  const [comparisonImage, setComparisonImage] = useState<string | null>(() => {
    return getComparisonImagePayload()?.previewUrl ?? null;
  });
  const [comparisonBase64, setComparisonBase64] = useState<string | null>(() => {
    return getComparisonImagePayload()?.base64 ?? null;
  });
  const [isComparing, setIsComparing] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileMeta, setFileMeta] = useState<UploadedFileMeta | null>(() => {
    return getComparisonImagePayload()?.meta ?? null;
  });
  const compareCalledRef = useRef(false);
  const [userReviewText, setUserReviewText] = useState("");
  const [copied, setCopied] = useState(false);
  const { consume, limitReached, dismiss } = useUsageGate();

  const generatedReview = useMemo(() => {
    if (!result || !selectedStyle) return "";
    const sorted = [...result.details].sort((a, b) => a.score - b.score);
    const lowAspects = sorted.slice(0, 2).map(d => d.aspect.toLowerCase());
    const highAspects = [...sorted].reverse().slice(0, 2).map(d => d.aspect.toLowerCase());
    const closeness = result.similarityScore >= 80 ? "very close to" : result.similarityScore >= 60 ? "quite close to" : "somewhat close to";
    return `I used SmartCut to guide my haircut.

Target style: ${selectedStyle.name}
Match Score: ${result.similarityScore}% (${result.matchLevel})

Overall, the result is ${closeness} the target. The ${highAspects.join(" and ")} match well, but there are some differences in ${lowAspects.join(" and ")}.

Great work overall!`;
  }, [result, selectedStyle]);

  const starRating = useMemo(() => result ? Math.max(1, Math.round(result.similarityScore / 20)) : 0, [result]);

  const fullReviewText = useMemo(
    () => userReviewText.trim() ? `${generatedReview}\n\n${userReviewText.trim()}` : generatedReview,
    [generatedReview, userReviewText]
  );

  const handleCopyReview = async () => {
    try {
      await navigator.clipboard.writeText(fullReviewText);
      setCopied(true);
      toast.success("Copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const barberGoogleReviewsUrl = useMemo(() => {
    try {
      const raw = localStorage.getItem("smartcut_barber_business");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return typeof parsed?.googleReviewsUrl === "string" && parsed.googleReviewsUrl.trim()
        ? parsed.googleReviewsUrl.trim()
        : null;
    } catch { return null; }
  }, []);

  const handleOpenGoogleReviews = () => {
    if (!barberGoogleReviewsUrl) {
      toast.error("Your barber hasn't added a Google Reviews link yet.");
      return;
    }
    window.open(barberGoogleReviewsUrl, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    console.log("[ComparePage] Route loaded", {
      route: window.location.pathname,
      fromGuidance,
      hasSelectedStyle: Boolean(selectedStyle),
      hasComparisonImage: Boolean(comparisonImage),
      hasComparisonBase64: Boolean(comparisonBase64),
    });
    if (fromGuidance && selectedStyle && !comparisonBase64) {
      setError("We couldn't load the uploaded haircut photo. Please re-upload the photo to run the final analysis.");
    }
  }, []); // eslint-disable-line

  // Redirect if no selected style
  useEffect(() => {
    if (!selectedStyle) {
      console.warn("[ComparePage] No selected style found — redirecting to /catalog");
      navigate("/catalog", { replace: true });
    }
  }, [selectedStyle, navigate]);

  const handleFile = useCallback(async (file: File) => {
    console.log("[ComparePage] User uploaded comparison image:", file.name);
    const url = URL.createObjectURL(file);
    const meta = { name: file.name, size: file.size };
    setComparisonImage(url);
    setFileMeta(meta);
    setResult(null);
    setError(null);
    compareCalledRef.current = false;
    const base64 = await fileToBase64(file);
    saveComparisonImagePayload({ previewUrl: url, base64, meta });
    setComparisonBase64(base64);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const runComparison = useCallback(async () => {
    if (!selectedStyle?.generatedImageUrl || !comparisonBase64) {
      console.warn("[ComparePage] Cannot compare — missing inputs");
      return;
    }
    if (compareCalledRef.current) {
      console.log("[ComparePage] Comparison already in progress, skipping");
      return;
    }
    const ok = await consume();
    if (!ok) return;
    compareCalledRef.current = true;

    console.log("[ComparePage] Starting comparison for style:", selectedStyle.id);
    setIsComparing(true);
    setError(null);

    try {
      // Demo mode: pass file metadata for deterministic results
      const res = await compareHairstyles(
        selectedStyle.generatedImageUrl,
        comparisonBase64,
        selectedStyle.id,
        fileMeta?.name,
        fileMeta?.size
      );
      console.log("[ComparePage] Comparison complete:", res.similarityScore, "% match");
      setResult(res);
    } catch (err: unknown) {
      // Safety net — should never reach here with new API, but just in case
      console.error("[ComparePage] Unexpected comparison error:", err);
      setError(err instanceof Error ? err.message : "Comparison failed");
      compareCalledRef.current = false;
    } finally {
      setIsComparing(false);
    }
  }, [selectedStyle, comparisonBase64, fileMeta, consume]);

  // Auto-compare when second image is ready — runs exactly once per upload
  useEffect(() => {
    if (comparisonBase64 && selectedStyle?.generatedImageUrl && !result && !isComparing && !compareCalledRef.current) {
      runComparison();
    }
  }, [comparisonBase64]); // eslint-disable-line

  const handleReplaceImage = () => {
    clearComparisonImagePayload();
    setComparisonImage(null);
    setComparisonBase64(null);
    setFileMeta(null);
    setResult(null);
    setError(null);
    compareCalledRef.current = false;
  };

  const handleSaveComparison = () => {
    if (!selectedStyle?.generatedImageUrl) return;
    const link = document.createElement("a");
    link.href = selectedStyle.generatedImageUrl;
    link.download = `smartcut-comparison-${selectedStyle.name.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.click();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-orange-500";
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-orange-500";
  };

  if (!selectedStyle) return null;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button
            onClick={() => navigate("/catalog")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Choose Another Style
          </button>
          <h1 className="text-3xl font-bold text-foreground">Compare Your Result</h1>
          <p className="text-muted-foreground mt-1">
            Upload a photo of your actual haircut to see how closely it matches the target style
          </p>
        </motion.div>

        {/* Two-panel comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Left: Reference style */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Target Look</p>
            <div className="rounded-2xl overflow-hidden border-2 border-primary/30 shadow-card bg-card">
              <div className="aspect-square overflow-hidden bg-secondary">
                <img src={selectedStyle.generatedImageUrl} alt={selectedStyle.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-foreground text-lg">{selectedStyle.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-2 flex-1 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full" style={{ backgroundImage: "var(--gradient-primary)", width: `${selectedStyle.matchScore}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-primary">{selectedStyle.matchScore}% match</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{selectedStyle.explanation}</p>
              </div>
            </div>
          </motion.div>

          {/* Right: Upload / comparison image */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Your Actual Haircut</p>
            {comparisonImage ? (
              <div className="rounded-2xl overflow-hidden border-2 border-border shadow-card bg-card">
                <div className="aspect-square overflow-hidden bg-secondary relative">
                  <img src={comparisonImage} alt="Your result" className="w-full h-full object-cover" />
                  <button
                    onClick={handleReplaceImage}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-card/90 backdrop-blur-sm text-foreground hover:bg-card transition-colors shadow-soft"
                    title="Replace image"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5">
                  <p className="text-sm text-muted-foreground">
                    {isComparing ? "Analyzing similarity…" : result ? "Comparison complete" : "Ready to compare"}
                  </p>
                </div>
              </div>
            ) : (
              <label
                className={`flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                  dragOver ? "border-primary bg-accent" : "border-border hover:border-primary/50 hover:bg-accent/50"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center gap-4 p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center">
                    <Camera className="w-7 h-7 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-lg">Upload Your Haircut Photo</p>
                    <p className="text-sm text-muted-foreground mt-1">Take a photo of your new haircut to compare</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Upload className="w-3 h-3" />
                    Drag & drop or click to browse
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </label>
            )}
          </motion.div>
        </div>

        {/* Comparison Results */}
        <AnimatePresence>
          {isComparing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-12"
            >
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-muted-foreground font-medium">Analyzing similarity between the two images…</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && !isComparing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <p className="text-destructive font-medium">{error}</p>
              <button
                onClick={() => { compareCalledRef.current = false; runComparison(); }}
                className="mt-3 px-5 py-2 rounded-xl text-sm font-medium text-primary-foreground"
                style={{ backgroundImage: "var(--gradient-primary)" }}
              >
                Retry Comparison
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && !isComparing && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Score card */}
              <div className="rounded-2xl border border-border bg-card shadow-card p-8 text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
                    <circle
                      cx="60" cy="60" r="52"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(result.similarityScore / 100) * 327} 327`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-bold ${getScoreColor(result.similarityScore)}`}>{result.similarityScore}%</span>
                    <span className="text-xs text-muted-foreground">match</span>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-foreground">{result.matchLevel}</h2>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">{result.feedback}</p>

                {/* Social share — share your result */}
                <div className="mt-6 pt-6 border-t border-border">
                  <SocialShare
                    heading="Share your result"
                    message={`I just tested my haircut with SmartCut and got a ${result.similarityScore}% match on ${selectedStyle.name}! 🔥`}
                  />
                </div>
              </div>

              {/* Detail breakdown */}
              <div className="rounded-2xl border border-border bg-card shadow-soft p-6">
                <h3 className="font-semibold text-foreground mb-4">Detail Breakdown</h3>
                <div className="space-y-3">
                  {result.details.map((d, i) => (
                    <motion.div
                      key={d.aspect}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-sm font-medium text-foreground w-36 shrink-0">{d.aspect}</span>
                      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${d.score}%` }}
                          transition={{ delay: i * 0.05 + 0.2, duration: 0.5 }}
                          className={`h-full rounded-full ${getScoreBarColor(d.score)}`}
                        />
                      </div>
                      <span className={`text-sm font-semibold w-10 text-right ${getScoreColor(d.score)}`}>{d.score}%</span>
                      <span className="text-xs text-muted-foreground w-48 hidden sm:block">{d.note}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Barber Feedback */}
              {result.barberFeedback && result.barberFeedback.length > 0 && (
                <div className="rounded-2xl border border-border bg-card shadow-soft p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Scissors className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Barber Feedback</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Practical notes you can share with your barber to get closer to the target look.
                  </p>
                  <ul className="space-y-2">
                    {result.barberFeedback.map((tip, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex gap-3 items-start text-sm text-foreground"
                      >
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                        <span className="leading-relaxed">{tip}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Share to Barber / Google Reviews */}
              <div className="rounded-2xl border border-border bg-card shadow-soft p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Share2 className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Share your result with your barber</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  We've prepared a review you can post on Google to help your barber out.
                </p>

                {/* Star rating */}
                <div className="flex items-center gap-1 mb-4" aria-label={`${starRating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i <= starRating ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-2">Suggested rating based on your match score</span>
                </div>

                {/* Generated review preview */}
                <div className="rounded-xl bg-secondary/50 border border-border p-4 mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Generated Review</p>
                  <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">{generatedReview}</pre>
                </div>

                {/* User custom input */}
                <label className="block text-sm font-medium text-foreground mb-2">Your personal note</label>
                <textarea
                  value={userReviewText}
                  onChange={(e) => setUserReviewText(e.target.value)}
                  placeholder="Add your personal feedback (optional)"
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    onClick={handleCopyReview}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
                    style={{ backgroundImage: "var(--gradient-primary)" }}
                  >
                    {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Review</>}
                  </button>
                  <button
                    onClick={handleOpenGoogleReviews}
                    disabled={!barberGoogleReviewsUrl}
                    title={barberGoogleReviewsUrl ? "Open your barber's Google Reviews page" : "No Google Reviews link provided by your barber"}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-border text-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ExternalLink className="w-4 h-4" /> Open Google Reviews
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={handleSaveComparison}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
                  style={{ backgroundImage: "var(--gradient-primary)" }}
                >
                  <Download className="w-4 h-4" /> Save Comparison
                </button>
                <button
                  onClick={handleReplaceImage}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border border-border text-foreground hover:bg-secondary transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> Try Another Photo
                </button>
                <button
                  onClick={() => navigate("/catalog")}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border border-border text-foreground hover:bg-secondary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Choose Another Style
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <UpgradeModal open={limitReached} onClose={dismiss} />
    </div>
  );
};

export default ComparePage;
