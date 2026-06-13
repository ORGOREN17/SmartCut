import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, Star, Heart, Shuffle, X, Download, ChevronDown, Loader2, Trophy, Briefcase, Zap, Flame, ArrowRight, Check,
} from "lucide-react";
import type { GeneratedHairstyle, SortOption, LengthFilter, FaceAnalysis, UserPreferences } from "@/data/types";
import { getRecommendations, assignBadges, toggleFavorite, getFavorites, generateHairstylePreview } from "@/services/api";
import { hairstyleDefinitions } from "@/data/hairstyleDefinitions";
import { toast } from "@/hooks/use-toast";
import { clearComparisonImagePayload, saveSelectedStyle } from "@/services/comparisonFlowStore";

const MAX_RECOMMENDATIONS = 6;
const AUTO_GENERATE_COUNT = 6;
const CONCURRENT_GENERATIONS = 2;

const lengthOptions: { value: LengthFilter; label: string }[] = [
  { value: "all", label: "All Lengths" },
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
];

const categoryOptions = [
  { value: "all", label: "All Styles" },
  { value: "fade", label: "Fade" },
  { value: "classic", label: "Classic" },
  { value: "modern", label: "Modern" },
  { value: "bold", label: "Bold" },
  { value: "curly", label: "Curly" },
];

const maintenanceOptions = [
  { value: "all", label: "Any" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "bestMatch", label: "Best Match" },
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Trending" },
  { value: "boldest", label: "Boldest" },
];

const badgeConfig = {
  "best-match": { icon: Trophy, label: "Best Match", color: "bg-primary text-primary-foreground" },
  "most-professional": { icon: Briefcase, label: "Most Professional", color: "bg-blue-500 text-white" },
  "lowest-maintenance": { icon: Zap, label: "Lowest Effort", color: "bg-green-500 text-white" },
  "boldest-change": { icon: Flame, label: "Boldest Change", color: "bg-orange-500 text-white" },
};

const CatalogPage = () => {
  const navigate = useNavigate();
  const [hairstyles, setHairstyles] = useState<GeneratedHairstyle[]>([]);
  const [favorites, setFavorites] = useState<string[]>(getFavorites());
  const [search, setSearch] = useState("");
  const [length, setLength] = useState<LengthFilter>("all");
  const [category, setCategory] = useState("all");
  const [maintenance, setMaintenance] = useState("all");
  const [sort, setSort] = useState<SortOption>("bestMatch");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [compareSet, setCompareSet] = useState<string[]>([]);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [generatingQueue, setGeneratingQueue] = useState<Set<string>>(new Set());
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);

  useEffect(() => {
    const storedAnalysis = sessionStorage.getItem("smartcut_analysis");
    const storedPrefs = sessionStorage.getItem("smartcut_preferences");
    const storedImage = sessionStorage.getItem("smartcut_user_image");

    if (storedImage) setUserImage(storedImage);

    let analysis: FaceAnalysis | null = null;
    let prefs: UserPreferences | null = null;
    try {
      if (storedAnalysis) analysis = JSON.parse(storedAnalysis);
      if (storedPrefs) prefs = JSON.parse(storedPrefs);
    } catch (error) {
      console.warn("[CatalogPage] Could not read stored recommendations", error);
    }

    if (analysis) {
      const scored = getRecommendations(analysis, prefs ? {
        vibe: prefs.desiredVibe,
        maintenance: prefs.maintenanceLevel,
        length: prefs.preferredLength,
      } : undefined);

      // Always show exactly 6 recommendations. If AI scoring returned fewer,
      // pad with remaining definitions as demo fallback so the count is stable.
      let top = scored.slice(0, MAX_RECOMMENDATIONS);
      if (top.length < MAX_RECOMMENDATIONS) {
        const existingIds = new Set(top.map((s) => s.id));
        const fillers = hairstyleDefinitions
          .filter((d) => !existingIds.has(d.id))
          .slice(0, MAX_RECOMMENDATIONS - top.length)
          .map((d) => ({
            ...d,
            matchScore: 70,
            explanation: "Demo fallback suggestion to complete your set of 6.",
          }));
        top = [...top, ...fillers];
      }

      const initial: GeneratedHairstyle[] = top.map((s) => ({
        ...s,
        generatedImageUrl: null,
        isGenerating: !!storedImage,
        error: !storedImage ? "Missing uploaded photo" : undefined,
      }));

      const withBadges = assignBadges(initial);
      setHairstyles(withBadges);

      console.log("[CatalogPage] Using uploaded image:", !!storedImage, {
        imagePreview: storedImage ? storedImage.substring(0, 60) + "…" : null,
        imageLength: storedImage?.length ?? 0,
        styleCount: withBadges.length,
      });

      // Kick off real AI generation for the top styles using the uploaded photo
      if (storedImage) {
        runRealGeneration(storedImage, withBadges.slice(0, AUTO_GENERATE_COUNT));
      }
    } else {
      // No analysis: redirect to upload
      navigate("/upload");
    }
  }, [navigate]);

  // Run real AI hairstyle transformations on the uploaded photo, with limited concurrency.
  // On failure we DO NOT swap in a generic stock image — that would show a different person
  // and break SmartCut's core promise. We mark the card as failed so the UI can offer retry.
  const runRealGeneration = async (sourceImage: string, styles: GeneratedHairstyle[]) => {
    const queue = [...styles];
    const workers = Array.from({ length: CONCURRENT_GENERATIONS }, async () => {
      while (queue.length) {
        const s = queue.shift();
        if (!s) break;
        try {
          console.log("[CatalogPage] →AI", {
            style: s.name,
            uploadedImageBytes: sourceImage.length,
            imagePassedToAI: true,
            fallbackUsed: false,
          });
          const url = await generateHairstylePreview(sourceImage, s.name, s.description, s.id);
          console.log("[CatalogPage] ←AI result", { style: s.name, resultUrl: String(url).slice(0, 80) + "…" });
          setHairstyles((prev) =>
            prev.map((h) => (h.id === s.id ? { ...h, generatedImageUrl: url, isGenerating: false, error: undefined } : h))
          );
        } catch (err) {
          console.warn("[CatalogPage] generation failed for", s.name, { fallbackUsed: false, error: err });
          setHairstyles((prev) =>
            prev.map((h) =>
              h.id === s.id
                ? { ...h, generatedImageUrl: null, isGenerating: false, error: err instanceof Error ? err.message : "Preview unavailable" }
                : h
            )
          );
        }
      }
    });
    await Promise.all(workers);
  };

  // On-demand (re)generation when user clicks a card that hasn't generated or failed
  const handleGenerateClick = async (style: GeneratedHairstyle) => {
    if (!userImage) {
      toast({ title: "No photo found", description: "Please upload your photo first.", variant: "destructive" });
      return;
    }
    if (style.isGenerating) return;
    setHairstyles((prev) =>
      prev.map((h) => (h.id === style.id ? { ...h, isGenerating: true, error: undefined } : h))
    );
    try {
      const url = await generateHairstylePreview(userImage, style.name, style.description, style.id);
      setHairstyles((prev) =>
        prev.map((h) => (h.id === style.id ? { ...h, generatedImageUrl: url, isGenerating: false, error: undefined } : h))
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Please try again.";
      toast({ title: "Generation failed", description: message, variant: "destructive" });
      setHairstyles((prev) =>
        prev.map((h) => (h.id === style.id ? { ...h, isGenerating: false, error: message } : h))
      );
    }
  };

  const filtered = useMemo(() => {
    let result = [...hairstyles];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || s.tags.some((t) => t.includes(q)) || s.category.includes(q)
      );
    }
    if (length !== "all") result = result.filter((s) => s.length === length);
    if (category !== "all") result = result.filter((s) => s.category === category);
    if (maintenance !== "all") result = result.filter((s) => s.maintenance === maintenance);

    switch (sort) {
      case "bestMatch": result.sort((a, b) => b.matchScore - a.matchScore); break;
      case "popular": result.sort((a, b) => b.popularityScore - a.popularityScore); break;
      case "newest": result.sort((a, b) => b.trendScore - a.trendScore); break;
      case "boldest":
        result.sort((a, b) => {
          const aB = a.category === "bold" ? 100 : a.trendScore;
          const bB = b.category === "bold" ? 100 : b.trendScore;
          return bB - aB;
        });
        break;
    }
    return result;
  }, [hairstyles, search, length, category, maintenance, sort]);

  const visible = filtered.slice(0, MAX_RECOMMENDATIONS);
  const hasMore = false;

  const handleFav = (id: string) => setFavorites(toggleFavorite(id));

  const handleCompareToggle = (id: string) => {
    setCompareSet((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const handleShuffle = () => {
    setHairstyles((prev) => [...prev].sort(() => Math.random() - 0.5));
    setPage(1);
  };


  const handleDownload = (style: GeneratedHairstyle) => {
    if (!style.generatedImageUrl) return;
    const link = document.createElement("a");
    link.href = style.generatedImageUrl;
    link.download = `smartcut-${style.name.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.click();
  };

  const handleSelectStyle = (style: GeneratedHairstyle) => {
    if (!style.generatedImageUrl) return;
    console.log("[CatalogPage] Style selected:", style.id, style.name);
    setSelectedStyleId((prev) => (prev === style.id ? null : style.id));
  };

  const handleContinueToCompare = () => {
    const selected = hairstyles.find((s) => s.id === selectedStyleId);
    if (!selected?.generatedImageUrl) {
      console.warn("[CatalogPage] Cannot navigate — no generated image for selected style");
      return;
    }
    const payload = {
      id: selected.id,
      name: selected.name,
      matchScore: selected.matchScore,
      explanation: selected.explanation,
      generatedImageUrl: selected.generatedImageUrl,
    };
    console.log("[CatalogPage] Navigating to /guidance with payload:", payload.id, payload.name);
    // Clear any previous uploaded result image so guidance starts fresh
    clearComparisonImagePayload();
    // Use the in-memory-backed store so a sessionStorage QuotaExceededError
    // (large base64 generatedImageUrl on mobile) can never block navigation.
    saveSelectedStyle(payload);
    navigate("/guidance");
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header with user photo */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 flex items-center gap-4">
          {userImage && (
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-soft shrink-0">
              <img src={userImage} alt="You" className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-foreground">See Yourself With New Styles</h1>
            <p className="text-muted-foreground mt-1">
              {filtered.length} personalized hairstyle previews · Click any to generate your look
            </p>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search styles, tags..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                showFilters ? "border-primary bg-accent text-accent-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="px-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button
              onClick={handleShuffle}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
              title="Shuffle styles"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-6">
              <div className="grid sm:grid-cols-3 gap-4 p-5 rounded-xl bg-card border border-border">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Length</label>
                  <div className="flex flex-wrap gap-1.5">
                    {lengthOptions.map((o) => (
                      <button key={o.value} onClick={() => { setLength(o.value); setPage(1); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${length === o.value ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}>{o.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Category</label>
                  <div className="flex flex-wrap gap-1.5">
                    {categoryOptions.map((o) => (
                      <button key={o.value} onClick={() => { setCategory(o.value); setPage(1); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${category === o.value ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}>{o.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Maintenance</label>
                  <div className="flex flex-wrap gap-1.5">
                    {maintenanceOptions.map((o) => (
                      <button key={o.value} onClick={() => { setMaintenance(o.value); setPage(1); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${maintenance === o.value ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}>{o.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compare bar */}
        <AnimatePresence>
          {compareSet.length > 0 && (
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-2xl bg-card border border-primary shadow-elevated">
              <div className="flex -space-x-2">
                {compareSet.map((id) => {
                  const s = hairstyles.find((h) => h.id === id);
                  return s?.generatedImageUrl ? (
                    <img key={id} src={s.generatedImageUrl} alt="" className="w-8 h-8 rounded-full border-2 border-card object-cover" />
                  ) : (
                    <div key={id} className="w-8 h-8 rounded-full border-2 border-card bg-secondary" />
                  );
                })}
              </div>
              <span className="text-sm font-medium text-foreground">{compareSet.length}/3</span>
              <button
                onClick={() => {
                  sessionStorage.setItem("smartcut_compare_ids", JSON.stringify(compareSet));
                  navigate("/compare");
                }}
                disabled={compareSet.length < 2}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-primary-foreground disabled:opacity-50"
                style={{ backgroundImage: "var(--gradient-primary)" }}
              >
                Compare
              </button>
              <button onClick={() => setCompareSet([])} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected style CTA */}
        <AnimatePresence>
          {selectedStyleId && hairstyles.find((s) => s.id === selectedStyleId)?.generatedImageUrl && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-auto sm:max-w-[calc(100vw-2rem)] z-50 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 py-3 sm:px-6 sm:py-3.5 rounded-2xl bg-card border border-primary shadow-elevated"
            >
              {(() => {
                const sel = hairstyles.find((s) => s.id === selectedStyleId);
                return sel ? (
                  <>
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full sm:w-auto">
                      <img src={sel.generatedImageUrl!} alt={sel.name} className="w-10 h-10 rounded-xl object-cover border border-border flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">{sel.name}</p>
                        <p className="text-xs text-muted-foreground">{sel.matchScore}% match</p>
                      </div>
                      <button onClick={() => setSelectedStyleId(null)} className="text-muted-foreground hover:text-foreground sm:hidden flex-shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={handleContinueToCompare}
                      className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
                      style={{ backgroundImage: "var(--gradient-primary)" }}
                    >
                      Compare with Final Result <ArrowRight className="w-4 h-4" />
                    </button>
                    <button onClick={() => setSelectedStyleId(null)} className="hidden sm:inline-flex text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : null;
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {visible.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.3 }}
              className={`relative rounded-2xl overflow-hidden shadow-soft bg-card border-2 transition-all hover:shadow-card hover:-translate-y-0.5 group cursor-pointer ${
                selectedStyleId === s.id ? "border-primary ring-2 ring-primary/30" : s.badge === "best-match" ? "border-primary/50 ring-1 ring-primary/10" : "border-border"
              }`}
              onClick={() => handleSelectStyle(s)}
            >
              {/* Badge */}
              {s.badge && badgeConfig[s.badge] && (
                <div className={`absolute top-3 left-3 z-10 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${badgeConfig[s.badge].color}`}>
                  {(() => { const Icon = badgeConfig[s.badge].icon; return <Icon className="w-3 h-3" />; })()}
                  {badgeConfig[s.badge].label}
                </div>
              )}

              {/* Selection indicator */}
              {selectedStyleId === s.id && s.generatedImageUrl && (
                <div className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center bg-primary text-primary-foreground shadow-card">
                  <Check className="w-4 h-4" />
                </div>
              )}

              {/* Image area */}
              <div
                className="aspect-square overflow-hidden bg-secondary relative cursor-pointer"
                onClick={() => handleGenerateClick(s)}
              >
                {s.generatedImageUrl ? (
                  <img src={s.generatedImageUrl} alt={s.name} className="w-full h-full object-cover" />
                ) : s.isGenerating ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                    {userImage && (
                      <img src={userImage} alt="Processing" className="w-20 h-20 rounded-xl object-cover opacity-50" />
                    )}
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    <p className="text-xs text-muted-foreground">Generating your look…</p>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4">
                    {userImage && (
                      <img src={userImage} alt="You" className="w-16 h-16 rounded-xl object-cover opacity-50 ring-2 ring-border" />
                    )}
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">{s.name}</p>
                      {s.error ? (
                        <p className="text-xs text-destructive mt-1">Preview unavailable · Click to retry</p>
                      ) : (
                        <p className="text-xs text-primary mt-1">Click to generate preview</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Overlay actions */}
                {s.generatedImageUrl && (
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-end justify-between p-3 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCompareToggle(s.id); }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium backdrop-blur-sm transition-colors ${
                        compareSet.includes(s.id) ? "bg-primary text-primary-foreground" : "bg-card/80 text-foreground"
                      }`}
                    >
                      {compareSet.includes(s.id) ? "✓ Compare" : "+ Compare"}
                    </button>
                    <div className="flex gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(s); }}
                        className="p-2 rounded-lg backdrop-blur-sm bg-card/80 text-foreground hover:text-primary transition-colors"
                        title="Save for barber"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleFav(s.id); }}
                        className="p-2 rounded-lg backdrop-blur-sm bg-card/80 text-foreground hover:text-primary transition-colors"
                      >
                        <Heart className={`w-4 h-4 ${favorites.includes(s.id) ? "fill-primary text-primary" : ""}`} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-semibold text-sm text-card-foreground">{s.name}</h3>
                  <span className="text-xs font-semibold text-primary">{s.matchScore}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden mb-2">
                  <div className="h-full rounded-full" style={{ backgroundImage: "var(--gradient-primary)", width: `${s.matchScore}%` }} />
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[10px] font-medium">{s.length}</span>
                  <span className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[10px] font-medium">{s.maintenance} maint.</span>
                  <span className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[10px] font-medium">{s.category}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{s.explanation}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination removed — exactly {MAX_RECOMMENDATIONS} suggestions shown */}

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">No styles match your filters</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;
