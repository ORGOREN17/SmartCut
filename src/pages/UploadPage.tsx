import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import OnboardingFlow from "@/components/OnboardingFlow";
import { analyzeFace, fileToBase64, addHistory } from "@/services/api";
import type { FaceAnalysis, UserPreferences } from "@/data/types";
import { Check, Scan, Brain, Eye, Scissors, Palette, User2, Camera, Upload, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUsageGate } from "@/hooks/useUsageGate";
import UpgradeModal from "@/components/UpgradeModal";

const analysisSteps = [
  { icon: Scan, label: "Mapping facial geometry…" },
  { icon: Eye, label: "Detecting face shape…" },
  { icon: Scissors, label: "Analyzing hair type & density…" },
  { icon: Palette, label: "Evaluating skin tone…" },
  { icon: User2, label: "Checking facial hair & hairline…" },
  { icon: Brain, label: "Building your profile…" },
];

const UploadPage = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"onboarding" | "upload" | "analyzing" | "results">("onboarding");
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [analysis, setAnalysis] = useState<FaceAnalysis | null>(null);
  const [step, setStep] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { consume, limitReached, dismiss } = useUsageGate();

  const handleOnboardingComplete = (prefs: Record<string, string>) => {
    setPreferences(prefs as unknown as UserPreferences);
    setPhase("upload");
  };

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    setUploadedFile(file);
    const base64 = await fileToBase64(file);
    setImageBase64(base64);
  };

  const handleAnalyze = async () => {
    if (!imageBase64) return;
    const ok = await consume();
    if (!ok) return;
    setPhase("analyzing");
    setStep(0);

    const interval = setInterval(() => {
      setStep((s) => {
        if (s >= analysisSteps.length - 1) { clearInterval(interval); return s; }
        return s + 1;
      });
    }, 800);

    try {
      const result = await analyzeFace(imageBase64, uploadedFile ?? undefined);
      clearInterval(interval);
      setStep(analysisSteps.length - 1);
      setAnalysis(result);

      // Best-effort persistence — sessionStorage can throw QuotaExceededError
      // on mobile for large base64 images. Never let storage break the flow.
      const safeSet = (key: string, value: string) => {
        try {
          sessionStorage.setItem(key, value);
        } catch (e) {
          console.warn(`[UploadPage] sessionStorage.setItem(${key}) failed:`, e);
        }
      };
      safeSet("smartcut_analysis", JSON.stringify(result));
      safeSet("smartcut_preferences", JSON.stringify(preferences));
      safeSet("smartcut_user_image", imageBase64);

      try {
        addHistory({
          date: new Date().toISOString().split("T")[0],
          faceShape: result.faceShape,
          topRecommendation: "Generating...",
          stylesViewed: 0,
          userImageUrl: imageBase64.substring(0, 100),
        });
      } catch (e) {
        console.warn("[UploadPage] addHistory failed:", e);
      }

      setTimeout(() => setPhase("results"), 600);
    } catch (err: any) {
      // analyzeFace itself already returns demo data on AI failure, so any
      // error here is incidental (storage quota, history, etc.). Keep the
      // user moving forward in backup mode rather than blocking them.
      clearInterval(interval);
      console.warn("[UploadPage] analyze flow error, continuing in backup mode:", err);
      toast({
        title: "Backup mode active",
        description: "We're using a backup analysis so you can keep going.",
      });
      setStep(analysisSteps.length - 1);
      setTimeout(() => setPhase("results"), 600);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const attrs = analysis
    ? [
        { label: "Face Shape", value: analysis.faceShape, icon: "🔷" },
        { label: "Hair Type", value: analysis.hairType, icon: "💇" },
        { label: "Hair Density", value: analysis.hairDensity, icon: "📊" },
        { label: "Skin Tone", value: analysis.skinTone, icon: "🎨" },
        { label: "Facial Hair", value: analysis.facialHair, icon: "🧔" },
        { label: "Current Length", value: analysis.currentLength, icon: "📏" },
        ...(analysis.currentStyle ? [{ label: "Current Style", value: analysis.currentStyle, icon: "✂️" }] : []),
        ...(analysis.hairlineType ? [{ label: "Hairline", value: analysis.hairlineType, icon: "📐" }] : []),
      ]
    : [];

  if (phase === "onboarding") {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-lg">
        <AnimatePresence mode="wait">
          {phase === "upload" && (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-foreground">Upload Your Photo</h1>
                <p className="text-muted-foreground mt-2">
                  Upload a clear front-facing portrait to see yourself with different hairstyles
                </p>
              </div>

              {/* Upload zone */}
              <label
                className={`relative flex flex-col items-center justify-center w-full aspect-square max-w-sm mx-auto rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                  dragOver
                    ? "border-primary bg-accent"
                    : "border-border hover:border-primary/50 hover:bg-accent/50"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                {preview ? (
                  <div className="relative w-full h-full">
                    <img src={preview} alt="Your photo" className="w-full h-full object-cover rounded-2xl" />
                    <button
                      onClick={(e) => { e.preventDefault(); setPreview(null); setImageBase64(null); }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-card/80 backdrop-blur-sm text-foreground hover:bg-card transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 p-6 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center">
                      <Camera className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Upload your photo</p>
                      <p className="text-sm text-muted-foreground mt-1">Front-facing portrait for best results</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Upload className="w-3 h-3" /> JPG, PNG up to 10MB
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </label>

              {/* Analyze button */}
              {preview && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                  <button
                    onClick={handleAnalyze}
                    className="w-full py-3.5 rounded-xl font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    style={{ backgroundImage: "var(--gradient-primary)" }}
                  >
                    Analyze My Face →
                  </button>
                </motion.div>
              )}

              <button
                onClick={() => setPhase("onboarding")}
                className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto block"
              >
                ← Change preferences
              </button>
            </motion.div>
          )}

          {phase === "analyzing" && (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6 py-12">
              {/* User photo thumbnail */}
              {preview && (
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-card">
                  <img src={preview} alt="You" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="relative w-20 h-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="w-7 h-7 text-primary animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                {analysisSteps.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: i <= step ? 1 : 0.3 }}
                    className={`flex items-center gap-2 text-sm transition-colors ${
                      i <= step ? "text-foreground font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {i < step ? (
                      <Check className="w-3.5 h-3.5 text-primary" />
                    ) : i === step ? (
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                        <s.icon className="w-3.5 h-3.5 text-primary" />
                      </motion.div>
                    ) : (
                      <s.icon className="w-3.5 h-3.5" />
                    )}
                    {s.label}
                  </motion.div>
                ))}
              </div>
              <div className="w-48 h-1.5 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${((step + 1) / analysisSteps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full rounded-full"
                  style={{ backgroundImage: "var(--gradient-primary)" }}
                />
              </div>
            </motion.div>
          )}

          {phase === "results" && analysis && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* User photo */}
              {preview && (
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-card">
                    <img src={preview} alt="You" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-primary mb-2">
                <Check className="w-5 h-5" />
                <span className="font-semibold">Analysis Complete</span>
              </div>
              <p className="text-center text-sm text-muted-foreground mb-6">
                Here's what our AI detected about your features
              </p>

              <div className="grid grid-cols-2 gap-3">
                {attrs.map((a) => (
                  <div key={a.label} className="p-4 rounded-xl bg-card border border-border shadow-soft">
                    <span className="text-lg">{a.icon}</span>
                    <p className="text-xs text-muted-foreground mt-1.5">{a.label}</p>
                    <p className="font-semibold text-foreground text-sm">{a.value}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate("/catalog")}
                className="w-full mt-6 py-3.5 rounded-xl font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                style={{ backgroundImage: "var(--gradient-primary)" }}
              >
                See Yourself With New Hairstyles →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <UpgradeModal open={limitReached} onClose={dismiss} />
    </div>
  );
};

export default UploadPage;
