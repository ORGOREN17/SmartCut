import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Upload, Camera, Scissors, CheckCircle2, RotateCcw } from "lucide-react";
import { fileToBase64 } from "@/services/api";
import { saveComparisonImagePayload, getSelectedStyle } from "@/services/comparisonFlowStore";

interface SelectedStyle {
  id: string;
  name: string;
  matchScore: number;
  explanation: string;
  generatedImageUrl: string;
}

const instructions = [
  "This is your selected target hairstyle.",
  "Go to your barber and show them this image.",
  "Ask them to recreate this look as closely as possible.",
  "After your haircut, take a clear, well-lit photo of your result.",
  "Upload your result below to compare it with the target look.",
];

const GuidancePage = () => {
  const navigate = useNavigate();
  const [selectedStyle] = useState<SelectedStyle | null>(() => {
    try {
      const fromStore = getSelectedStyle();
      if (fromStore?.id && fromStore.generatedImageUrl) return fromStore;
    } catch (error) {
      console.warn("[GuidancePage] Could not read selected style from store", error);
    }
    return null;
  });
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultMeta, setResultMeta] = useState<{ name: string; size: number } | null>(null);
  const [resultBase64, setResultBase64] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const continueInFlightRef = useRef(false);

  useEffect(() => {
    if (!selectedStyle) {
      console.warn("[GuidancePage] No selected style — redirecting to /catalog");
      navigate("/catalog", { replace: true });
    }
  }, [selectedStyle, navigate]);

  const [resultFile, setResultFile] = useState<File | null>(null);

  const handleFile = useCallback(async (file: File) => {
    console.log("[GuidancePage] User uploaded result image:", file.name);
    const url = URL.createObjectURL(file);
    setResultImage(url);
    setResultMeta({ name: file.name, size: file.size });
    setResultFile(file);
    setResultBase64(null);
    try {
      const base64 = await fileToBase64(file);
      setResultBase64(base64);
    } catch (e) {
      console.warn("[GuidancePage] base64 conversion failed; will retry on continue", e);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleReplace = () => {
    setResultImage(null);
    setResultMeta(null);
    setResultBase64(null);
    setResultFile(null);
  };

  const handleContinue = async () => {
    console.log("[GuidancePage] Continue to Analysis clicked", { hasResultImage: Boolean(resultImage), hasResultMeta: Boolean(resultMeta), route: window.location.pathname });
    if (continueInFlightRef.current) return;
    if (!resultImage || !resultMeta) return;
    continueInFlightRef.current = true;
    setIsProcessing(true);
    try {
      let base64 = resultBase64;
      if (!base64 && resultFile) {
        base64 = await fileToBase64(resultFile);
        setResultBase64(base64);
      }
      if (!base64) {
        continueInFlightRef.current = false;
        setIsProcessing(false);
        return;
      }
      saveComparisonImagePayload({ previewUrl: resultImage, base64, meta: resultMeta });
      console.log("[GuidancePage] Before navigation to /compare", { route: window.location.pathname });
      navigate("/compare", { state: { fromGuidance: true } });
      setTimeout(() => console.log("[GuidancePage] After navigation attempt", { route: window.location.pathname }), 0);
    } catch (e) {
      console.error("[GuidancePage] continue failed", e);
      continueInFlightRef.current = false;
      setIsProcessing(false);
    }
  };

  if (!selectedStyle) return null;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button
            onClick={() => navigate("/catalog")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Recommendations
          </button>
          <h1 className="text-3xl font-bold text-foreground">Take This to Your Barber</h1>
          <p className="text-muted-foreground mt-1">
            Show your barber the target look, then upload a photo of your result for analysis.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Left: Target look */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Target Look</p>
            <div className="rounded-2xl overflow-hidden border-2 border-primary/30 shadow-card bg-card">
              <div className="aspect-square overflow-hidden bg-secondary">
                <img src={selectedStyle.generatedImageUrl} alt={selectedStyle.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground text-lg">{selectedStyle.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{selectedStyle.explanation}</p>
              </div>
            </div>
          </motion.div>

          {/* Right: Instructions */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">How It Works</p>
            <div className="rounded-2xl border border-border bg-card shadow-soft p-6 h-full">
              <ol className="space-y-4">
                {instructions.map((text, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="shrink-0 w-7 h-7 rounded-full bg-accent text-accent-foreground text-sm font-semibold flex items-center justify-center">
                      {i + 1}
                    </div>
                    <p className="text-sm text-foreground pt-0.5 leading-relaxed">{text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        </div>

        {/* Upload area */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Your Haircut Result</p>
          {resultImage ? (
            <div className="rounded-2xl overflow-hidden border-2 border-border shadow-card bg-card flex flex-col sm:flex-row items-stretch">
              <div className="w-full sm:w-64 aspect-square sm:aspect-auto sm:h-64 overflow-hidden bg-secondary shrink-0 relative">
                <img src={resultImage} alt="Your haircut" className="w-full h-full object-cover" />
                <button
                  onClick={handleReplace}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-card/90 backdrop-blur-sm text-foreground hover:bg-card transition-colors shadow-soft"
                  title="Replace image"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Photo uploaded</p>
                    <p className="text-sm text-muted-foreground mt-1 break-all">{resultMeta?.name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleContinue}
                  onTouchEnd={(e) => { e.preventDefault(); handleContinue(); }}
                  className="relative z-10 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 touch-manipulation cursor-pointer select-none"
                  style={{ backgroundImage: "var(--gradient-primary)", WebkitTapHighlightColor: "transparent" }}
                >
                  {isProcessing ? "Processing…" : <>Continue to Analysis <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          ) : (
            <label
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer transition-all py-12 ${
                dragOver ? "border-primary bg-accent" : "border-border hover:border-primary/50 hover:bg-accent/50"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-4 px-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center">
                  <Camera className="w-7 h-7 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-lg">Upload Your Haircut Photo</p>
                  <p className="text-sm text-muted-foreground mt-1">After your barber visit, upload your result here</p>
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
    </div>
  );
};

export default GuidancePage;
