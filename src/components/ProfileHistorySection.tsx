import { useEffect, useState } from "react";
import { Sparkles, Scissors, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type AnalysisRow = { id: string; created_at: string; analysis_type: string; result_json: any };
type HairstyleRow = { id: string; created_at: string; name: string; image_url: string | null; match_score: number | null };
type ComparisonRow = { id: string; created_at: string; match_score: number | null; match_level: string | null };

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

const HistorySection = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisRow[]>([]);
  const [hairstyles, setHairstyles] = useState<HairstyleRow[]>([]);
  const [comparisons, setComparisons] = useState<ComparisonRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      supabase.from("ai_analyses").select("id, created_at, analysis_type, result_json")
        .eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
      supabase.from("hairstyle_results").select("id, created_at, name, image_url, match_score")
        .eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
      supabase.from("comparison_results").select("id, created_at, match_score, match_level")
        .eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    ]).then(([a, h, c]) => {
      setAnalyses((a.data ?? []) as AnalysisRow[]);
      setHairstyles((h.data ?? []) as HairstyleRow[]);
      setComparisons((c.data ?? []) as ComparisonRow[]);
    }).finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-card">
        <h2 className="text-sm font-semibold text-muted-foreground mb-2">Your SmartCut History</h2>
        <p className="text-sm text-muted-foreground">Sign in to save your analyses, generated hairstyles and comparison results across devices.</p>
      </div>
    );
  }

  const empty = !loading && !analyses.length && !hairstyles.length && !comparisons.length;

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-card space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground">Your SmartCut History</h2>
        <p className="text-xs text-muted-foreground mt-1">Saved analyses, generated styles and comparison results.</p>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {empty && <p className="text-sm text-muted-foreground">No saved activity yet. Run an analysis to start building your history.</p>}

      {analyses.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Previous analyses
          </h3>
          <div className="space-y-2">
            {analyses.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {a.result_json?.faceShape ? `${a.result_json.faceShape} face shape` : a.analysis_type}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(a.created_at)}</p>
                </div>
                <span className="text-xs text-muted-foreground">{a.analysis_type}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {hairstyles.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5" /> Selected hairstyles
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {hairstyles.map((h) => (
              <div key={h.id} className="rounded-xl overflow-hidden border border-border bg-secondary/30">
                <div className="aspect-square bg-secondary flex items-center justify-center">
                  {h.image_url ? (
                    <img src={h.image_url} alt={h.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium text-foreground truncate">{h.name}</p>
                  <p className="text-[10px] text-muted-foreground">{formatDate(h.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {comparisons.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Comparison results</h3>
          <div className="space-y-2">
            {comparisons.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">{c.match_level ?? "Comparison"}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(c.created_at)}</p>
                </div>
                <span className="text-sm font-semibold text-primary">
                  {c.match_score != null ? `${Math.round(Number(c.match_score))}%` : "—"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HistorySection;
