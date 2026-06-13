import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Clock, Heart, Trash2, Save, RotateCcw, Scissors, Sparkles, Briefcase, MapPin } from "lucide-react";
import { toast } from "sonner";
import { getFavorites, getHistory, toggleFavorite, getRecommendations } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { loadProfile, saveProfile, clearProfile, DEFAULT_PROFILE, type UserProfile } from "@/data/profileTypes";
import type { GeneratedHairstyle, FaceAnalysis, UserPreferences } from "@/data/types";
import ProfileHistorySection from "@/components/ProfileHistorySection";
import { useAuth } from "@/contexts/AuthContext";
import { loadFullProfileFromSupabase, saveFullProfileToSupabase } from "@/services/profileService";

interface FieldOption {
  value: string;
  label: string;
}

const SelectField = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: FieldOption[];
  placeholder?: string;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className="bg-secondary/50 border-border">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const InputField = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-secondary/50 border-border"
    />
  </div>
);

const SectionCard = ({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-card">
    <div className="flex items-center gap-3 mb-1">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <h2 className="text-base font-semibold text-card-foreground">{title}</h2>
    </div>
    <p className="text-xs text-muted-foreground mb-5 ml-12">{description}</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
  </div>
);

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [favorites, setFavorites] = useState<string[]>(getFavorites());
  const [history] = useState(getHistory());
  const [allStyles, setAllStyles] = useState<GeneratedHairstyle[]>([]);
  const [saving, setSaving] = useState(false);

  // Load profile: Supabase for logged-in users, localStorage fallback otherwise.
  // If logged in and Supabase is empty but localStorage has data, sync it up.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const local = loadProfile();
      if (user) {
        try {
          const remote = await loadFullProfileFromSupabase(user.id);
          if (cancelled) return;
          const remoteHasData =
            remote && Object.values(remote).some((v) => v && String(v).trim() !== "");
          const localHasData = Object.values(local).some(
            (v) => v && String(v).trim() !== "",
          );
          if (remoteHasData) {
            setProfile(remote!);
          } else if (localHasData) {
            // Sync anonymous-session data to Supabase on first login
            setProfile(local);
            await saveFullProfileToSupabase(user.id, local);
          } else {
            setProfile(remote ?? DEFAULT_PROFILE);
          }
        } catch (e) {
          console.error("Profile load failed, falling back to local:", e);
          setProfile(local);
        }
      } else {
        setProfile(local);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    const storedAnalysis = sessionStorage.getItem("smartcut_analysis");
    const storedPrefs = sessionStorage.getItem("smartcut_preferences");

    let analysis: FaceAnalysis | null = null;
    let prefs: UserPreferences | null = null;
    try {
      if (storedAnalysis) analysis = JSON.parse(storedAnalysis);
      if (storedPrefs) prefs = JSON.parse(storedPrefs);
    } catch {}

    if (analysis) {
      const scored = getRecommendations(
        analysis,
        prefs
          ? {
              vibe: prefs.desiredVibe,
              maintenance: prefs.maintenanceLevel,
              length: prefs.preferredLength,
            }
          : undefined,
      );
      setAllStyles(scored.map((s) => ({ ...s, generatedImageUrl: null, isGenerating: false })));
    }
  }, []);

  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    // Always keep a local copy as fallback / for anonymous flow
    saveProfile(profile);
    if (!user) {
      toast.success("Profile saved locally", {
        description: "Sign in to save your profile to your account across devices.",
      });
      return;
    }
    setSaving(true);
    try {
      await saveFullProfileToSupabase(user.id, profile);
      toast.success("Profile saved", {
        description: "Your details are stored to your account.",
      });
    } catch (e: any) {
      console.error("Save profile failed:", e);
      toast.error("Couldn't save to your account", {
        description: "Saved locally as fallback. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    clearProfile();
    setProfile(DEFAULT_PROFILE);
    toast("Profile reset");
  };

  const favoriteStyles = allStyles.filter((s) => favorites.includes(s.id));
  const handleRemoveFav = (id: string) => setFavorites(toggleFavorite(id));

  const displayName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "SmartCut User";

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Header */}
          <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-card">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundImage: "var(--gradient-primary)" }}
              >
                <User className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold text-card-foreground truncate">{displayName}</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  {profile.email || "Your personalized hairstyle profile"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="p-3 rounded-xl bg-secondary/50 text-center">
                <p className="text-2xl font-bold text-foreground">{history.length}</p>
                <p className="text-xs text-muted-foreground">Scans</p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50 text-center">
                <p className="text-2xl font-bold text-foreground">{favorites.length}</p>
                <p className="text-xs text-muted-foreground">Favorites</p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50 text-center">
                <p className="text-2xl font-bold text-foreground">{allStyles.length}</p>
                <p className="text-xs text-muted-foreground">Styles</p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <SectionCard icon={User} title="Basic Information" description="Tell us a bit about yourself.">
            <InputField label="First Name" value={profile.firstName} onChange={(v) => update("firstName", v)} placeholder="John" />
            <InputField label="Last Name" value={profile.lastName} onChange={(v) => update("lastName", v)} placeholder="Doe" />
            <InputField label="Age" value={profile.age} onChange={(v) => update("age", v)} type="number" placeholder="28" />
            <SelectField
              label="Gender"
              value={profile.gender}
              onChange={(v) => update("gender", v)}
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "non-binary", label: "Non-binary" },
                { value: "prefer-not-to-say", label: "Prefer not to say" },
              ]}
            />
            <InputField label="City" value={profile.city} onChange={(v) => update("city", v)} placeholder="Paris" />
            <InputField label="Country" value={profile.country} onChange={(v) => update("country", v)} placeholder="France" />
            <div className="sm:col-span-2">
              <InputField label="Email" value={profile.email} onChange={(v) => update("email", v)} type="email" placeholder="you@example.com" />
            </div>
          </SectionCard>

          {/* Hair Profile */}
          <SectionCard icon={Scissors} title="Hair Profile" description="Help us understand your current hair.">
            <SelectField
              label="Hair Type"
              value={profile.hairType}
              onChange={(v) => update("hairType", v)}
              options={[
                { value: "straight", label: "Straight" },
                { value: "wavy", label: "Wavy" },
                { value: "curly", label: "Curly" },
                { value: "coily", label: "Coily" },
              ]}
            />
            <SelectField
              label="Current Hair Length"
              value={profile.currentHairLength}
              onChange={(v) => update("currentHairLength", v)}
              options={[
                { value: "very-short", label: "Very Short" },
                { value: "short", label: "Short" },
                { value: "medium", label: "Medium" },
                { value: "long", label: "Long" },
              ]}
            />
            <SelectField
              label="Hair Density"
              value={profile.hairDensity}
              onChange={(v) => update("hairDensity", v)}
              options={[
                { value: "thin", label: "Thin" },
                { value: "medium", label: "Medium" },
                { value: "thick", label: "Thick" },
              ]}
            />
            <SelectField
              label="Hairline Status"
              value={profile.hairlineStatus}
              onChange={(v) => update("hairlineStatus", v)}
              options={[
                { value: "regular", label: "Regular" },
                { value: "slightly-receding", label: "Slightly Receding" },
                { value: "receding", label: "Receding" },
              ]}
            />
            <div className="sm:col-span-2">
              <SelectField
                label="Beard / Facial Hair"
                value={profile.facialHair}
                onChange={(v) => update("facialHair", v)}
                options={[
                  { value: "none", label: "None" },
                  { value: "stubble", label: "Stubble" },
                  { value: "short-beard", label: "Short Beard" },
                  { value: "full-beard", label: "Full Beard" },
                ]}
              />
            </div>
          </SectionCard>

          {/* Style Preferences */}
          <SectionCard icon={Sparkles} title="Style Preferences" description="What kind of look are you going for?">
            <SelectField
              label="Preferred Vibe"
              value={profile.preferredVibe}
              onChange={(v) => update("preferredVibe", v)}
              options={[
                { value: "classic", label: "Classic" },
                { value: "modern", label: "Modern" },
                { value: "bold", label: "Bold" },
                { value: "professional", label: "Professional" },
                { value: "trendy", label: "Trendy" },
              ]}
            />
            <SelectField
              label="Maintenance Level"
              value={profile.maintenanceLevel}
              onChange={(v) => update("maintenanceLevel", v)}
              options={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
              ]}
            />
            <SelectField
              label="Preferred Haircut Length"
              value={profile.preferredLength}
              onChange={(v) => update("preferredLength", v)}
              options={[
                { value: "short", label: "Short" },
                { value: "medium", label: "Medium" },
                { value: "long", label: "Long" },
              ]}
            />
            <SelectField
              label="Openness to Change"
              value={profile.opennessToChange}
              onChange={(v) => update("opennessToChange", v)}
              options={[
                { value: "subtle", label: "Subtle Change" },
                { value: "moderate", label: "Moderate Change" },
                { value: "dramatic", label: "Dramatic Change" },
              ]}
            />
          </SectionCard>

          {/* Lifestyle */}
          <SectionCard icon={Briefcase} title="Lifestyle & Context" description="Helps us match styles to your routine.">
            <SelectField
              label="Work Style"
              value={profile.workStyle}
              onChange={(v) => update("workStyle", v)}
              options={[
                { value: "office", label: "Office" },
                { value: "casual", label: "Casual" },
                { value: "creative", label: "Creative" },
                { value: "mixed", label: "Mixed" },
              ]}
            />
            <SelectField
              label="Haircut Frequency"
              value={profile.haircutFrequency}
              onChange={(v) => update("haircutFrequency", v)}
              options={[
                { value: "biweekly", label: "Every 2 weeks" },
                { value: "monthly", label: "Monthly" },
                { value: "quarterly", label: "Every 2–3 months" },
                { value: "rarely", label: "Rarely" },
              ]}
            />
            <div className="sm:col-span-2">
              <SelectField
                label="Styling Routine"
                value={profile.stylingRoutine}
                onChange={(v) => update("stylingRoutine", v)}
                options={[
                  { value: "none", label: "No styling" },
                  { value: "minimal", label: "Minimal styling" },
                  { value: "daily", label: "Daily styling" },
                ]}
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Notes</Label>
              <Textarea
                value={profile.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Anything else we should know? Allergies, cowlicks, hair goals…"
                rows={4}
                className="bg-secondary/50 border-border resize-none"
              />
            </div>
          </SectionCard>

          {/* Save / Reset Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sticky bottom-4 z-10">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 h-12 text-sm font-semibold shadow-lg"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving…" : "Save Profile"}
            </Button>
            <Button onClick={handleReset} variant="outline" className="h-12 text-sm font-medium">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Favorites */}
          <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-card">
            <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5 mb-5">
              <Heart className="w-3.5 h-3.5" /> Saved Favorites ({favoriteStyles.length})
            </h2>
            {favoriteStyles.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No favorites yet. Browse the catalog and save styles you love!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {favoriteStyles.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
                    <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center text-xs font-medium text-accent-foreground">
                      {s.name.substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{s.name}</p>
                      <p className="text-xs text-primary">{s.matchScore}% match</p>
                    </div>
                    <button
                      onClick={() => handleRemoveFav(s.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* History */}
          <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-card">
            <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5 mb-5">
              <Clock className="w-3.5 h-3.5" /> Scan History
            </h2>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No scans yet. Upload a photo to get started!
              </p>
            ) : (
              <div className="space-y-3">
                {history.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border"
                  >
                    <div>
                      <p className="font-medium text-foreground text-sm">{h.topRecommendation}</p>
                      <p className="text-xs text-muted-foreground">
                        {h.faceShape} · {h.date}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">{h.stylesViewed} viewed</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DB-backed History */}
          <ProfileHistorySection />
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
