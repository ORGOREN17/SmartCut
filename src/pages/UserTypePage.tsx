import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Scissors, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { setUserRole } from "@/services/profileService";
import { toast } from "sonner";
import { useState } from "react";

const options = [
  {
    role: "customer" as const,
    to: "/upload",
    icon: User,
    title: "I'm a Customer",
    subtitle: "I want to find and compare my next haircut",
    accent: "from-primary/15 to-primary/5",
  },
  {
    role: "barber" as const,
    to: "/barber-details",
    icon: Scissors,
    title: "I'm a Barber / Business Owner",
    subtitle: "I want to grow my business and manage SmartCut leads",
    accent: "from-accent to-accent/40",
  },
];

const UserTypePage = () => {
  const { user, refreshRole } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);

  const handlePick = async (opt: typeof options[number]) => {
    if (!user) {
      // Demo fallback: just navigate
      navigate(opt.to);
      return;
    }
    try {
      setBusy(opt.role);
      await setUserRole(user.id, opt.role);
      await refreshRole();
      navigate(opt.to);
    } catch (e: any) {
      toast.error("Could not save role, continuing in demo mode.");
      navigate(opt.to);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient pt-28 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold mb-5">
            <Sparkles className="w-3.5 h-3.5" /> Welcome to SmartCut
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Who are you using <span className="text-gradient">SmartCut</span> as?
          </h1>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto">
            Pick the experience that fits you best. You can always switch later.
          </p>
          {!user && (
            <p className="mt-3 text-xs text-muted-foreground">
              <Link to="/auth" className="text-primary font-semibold hover:underline">Sign in</Link> to save your role and history.
            </p>
          )}
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {options.map((opt, i) => (
            <motion.div
              key={opt.role}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
            >
              <button
                onClick={() => handlePick(opt)}
                disabled={busy === opt.role}
                className="group block w-full text-left h-full rounded-3xl border border-border bg-card p-8 shadow-soft hover:shadow-elevated hover:-translate-y-1 transition-all relative overflow-hidden disabled:opacity-70"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${opt.accent} opacity-60 group-hover:opacity-100 transition-opacity`}
                />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center mb-6 shadow-soft">
                    <opt.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-card-foreground mb-2">{opt.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">{opt.subtitle}</p>
                  <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    {busy === opt.role ? "Saving..." : "Continue"} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserTypePage;
