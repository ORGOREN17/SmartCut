import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Wand2,
  RefreshCw,
  Image as ImageIcon,
  Loader2,
  Copy,
  Download,
  Sparkles,
  Video,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import UpgradeModal from "@/components/UpgradeModal";

type BusinessInfo = {
  businessName: string;
  location: string;
  services: string[];
  specialties: string[];
  targetCustomers: string;
};

const DEMO_INFO: BusinessInfo = {
  businessName: "SmartCut Barbershop",
  location: "Downtown",
  services: ["clean fades", "beard styling", "classic cuts"],
  specialties: ["skin fades", "sharp lineups", "beard sculpting"],
  targetCustomers: "modern men who care about a polished look",
};

function loadBusinessInfo(): BusinessInfo {
  try {
    const raw = localStorage.getItem("smartcut_barber_business");
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEMO_INFO,
        businessName: (parsed?.businessName || DEMO_INFO.businessName).toString().slice(0, 120),
      };
    }
  } catch {}
  return DEMO_INFO;
}

function buildDescription(info: BusinessInfo): string {
  return (
    `${info.businessName} is a modern barbershop in ${info.location} specializing in ` +
    `${info.services.join(", ")}. The business helps ${info.targetCustomers} achieve a confident, ` +
    `polished look with a premium grooming experience.`
  );
}

const PROMPT_STYLES = [
  "premium barbershop promo poster",
  "before and after haircut campaign",
  "fresh fade social media post",
  "beard styling promotion",
  "local business promotion",
  "first haircut offer",
  "stylish grooming ad",
  "modern masculine branding visual",
];

function buildPrompt(info: BusinessInfo, style: string): string {
  const map: Record<string, string> = {
    "premium barbershop promo poster":
      `Create a premium promotional social media image for ${info.businessName} in ${info.location}. Stylish male haircut with crisp fade details, grooming tools, modern lighting, polished confident look. Professional, trendy, suitable for Instagram marketing.`,
    "before and after haircut campaign":
      `Create a striking before-and-after haircut marketing visual for ${info.businessName}. Two side-by-side editorial portraits: messy hair on the left, sharp fade and styled finish on the right. Premium lighting, modern, attention-grabbing.`,
    "fresh fade social media post":
      `Create a fresh fade social media post for ${info.businessName} featuring ${info.specialties.join(", ")}. Close-up of a perfectly blended skin fade, sharp lineup, modern color grading, energetic premium vibe.`,
    "beard styling promotion":
      `Create a beard styling promo image for ${info.businessName}. Macro shot of a meticulously sculpted beard, trimmer detailing, beard oil shine, cinematic moody lighting, masculine and premium.`,
    "local business promotion":
      `Create a warm local-business promo image for ${info.businessName} in ${info.location}. Friendly barber and a happy client, welcoming barbershop interior, neighborhood charm, modern and approachable.`,
    "first haircut offer":
      `Create a bold promotional marketing image for ${info.businessName} highlighting a first-time customer offer. Confident male portrait with a fresh haircut, clean composition with space at the top for a price tag overlay later.`,
    "stylish grooming ad":
      `Create a stylish grooming advertisement for ${info.businessName}. Editorial portrait of a well-groomed man, sharp jawline, premium products in soft focus, magazine-quality lighting.`,
    "modern masculine branding visual":
      `Create a modern masculine branding visual for ${info.businessName}. Minimalist composition, dark moody background, premium barber tools arranged artistically, gold and dark tones, luxury feel.`,
  };
  return map[style] || map["premium barbershop promo poster"];
}

type GeneratedImage = {
  variant: string;
  label: string;
  aspect: string;
  imageUrl: string;
  title: string;
  caption: string;
  hashtags: string[];
};

type ImagesResult = {
  success?: boolean;
  configured: boolean;
  images?: GeneratedImage[];
  error?: string;
};

const aspectClass: Record<string, string> = {
  "1:1": "aspect-square",
  "9:16": "aspect-[9/16]",
  "4:5": "aspect-[4/5]",
};

const BarberContentCreatorPage = () => {
  const info = useMemo(loadBusinessInfo, []);
  const description = useMemo(() => buildDescription(info), [info]);

  const [styleIndex, setStyleIndex] = useState(0);
  const [prompt, setPrompt] = useState(() => buildPrompt(info, PROMPT_STYLES[0]));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImagesResult | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const refreshPrompt = () => {
    const next = (styleIndex + 1) % PROMPT_STYLES.length;
    setStyleIndex(next);
    setPrompt(buildPrompt(info, PROMPT_STYLES[next]));
  };

  const createImages = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-business-images", {
        body: {
          businessName: info.businessName,
          businessDescription: description,
          selectedPrompt: prompt,
          style: PROMPT_STYLES[styleIndex],
        },
      });
      if (error) throw error;
      const r = data as ImagesResult;
      setResult(r);

      if (r?.success && r.images?.length) {
        toast.success("Promo image ready");
      } else if (r && r.configured === false) {
        toast.error("AI image generation is not configured.");
      } else {
        toast.error(r?.error || "Image generation failed. Please try again.");
      }
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || "Image generation failed. Please try again.";
      toast.error(msg);
      setResult({ success: false, configured: true, error: msg });
    } finally {
      setLoading(false);
    }
  };

  const copyCaption = async (img: GeneratedImage) => {
    const text = `${img.caption}\n\n${img.hashtags.join(" ")}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Caption copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  const downloadImage = (img: GeneratedImage) => {
    window.open(img.imageUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-hero-gradient pt-28 pb-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link
          to="/barber"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Barber Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-card border border-border shadow-soft mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Business <span className="text-gradient">Content Creator</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Generate a single AI-powered promotional image for your barbershop — ready for
            Instagram, Facebook, WhatsApp Status, and more.
          </p>
        </motion.div>

        {/* Section 1 — Business Description */}
        <section className="rounded-2xl bg-card border border-border shadow-soft p-6 mb-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-2">Business description</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </section>

        {/* Section 2 — AI Image Prompt */}
        <section className="rounded-2xl bg-card border border-border shadow-soft p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" /> AI image prompt
            </h2>
            <button
              type="button"
              onClick={refreshPrompt}
              className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Generate New Prompt
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Style: <span className="font-medium text-foreground">{PROMPT_STYLES[styleIndex]}</span>
          </p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </section>

        {/* Section 3 — Create Images */}
        <section className="rounded-2xl bg-card border border-border shadow-soft p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" /> Create promo image
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={createImages}
              disabled={loading || !prompt.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-60 transition-opacity"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating your AI image…
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" /> Create Promo Image
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowUpgrade(true);
                toast.message("Pro feature", {
                  description:
                    "Upgrade to SmartCut Pro to generate short AI-powered promo videos for your barbershop — perfect for Instagram Reels, TikTok, and Facebook Shorts.",
                });
              }}
              className="relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold border border-primary/40 bg-background text-foreground hover:bg-accent transition-colors"
            >
              <Lock className="w-4 h-4 text-primary" />
              <Video className="w-4 h-4" />
              Create Promo Video
              <span className="ml-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-primary-foreground" style={{ backgroundImage: "var(--gradient-primary)" }}>
                Pro
              </span>
            </button>
          </div>

          {result && (
            <div className="mt-6 space-y-6">
              {result.images?.length ? (
                <>
                  <div className="max-w-md">
                    {result.images.slice(0, 1).map((img) => (
                      <div
                        key={img.variant}
                        className="rounded-xl border border-border bg-background p-4 flex flex-col"
                      >
                        <div
                          className={`w-full ${aspectClass[img.aspect] || "aspect-square"} rounded-lg overflow-hidden bg-muted mb-3`}
                        >
                          <img
                            src={img.imageUrl}
                            alt={img.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-sm text-card-foreground">{img.title}</h3>
                          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            {img.aspect}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{img.caption}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {img.hashtags.map((h) => (
                            <span
                              key={h}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                        <div className="mt-auto flex gap-2">
                          <button
                            type="button"
                            onClick={() => copyCaption(img)}
                            className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-medium px-2 py-1.5 rounded-lg border border-border hover:bg-accent transition-colors"
                          >
                            <Copy className="w-3 h-3" /> Copy Caption
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadImage(img)}
                            className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-medium px-2 py-1.5 rounded-lg border border-border hover:bg-accent transition-colors"
                          >
                            <Download className="w-3 h-3" /> Download Image
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setResult(null);
                      refreshPrompt();
                    }}
                    className="inline-flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" /> Create Another Image
                  </button>
                </>
              ) : (
                <div className="rounded-xl border border-border bg-background p-6 text-center text-sm text-muted-foreground">
                  {result.error ||
                    (result.configured === false
                      ? "AI image generation is not configured yet."
                      : "Image generation failed. Please try again.")}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  );
};

export default BarberContentCreatorPage;
