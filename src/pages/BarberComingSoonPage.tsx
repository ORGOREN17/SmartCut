import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Scissors, ArrowLeft, ArrowRight, Calendar, Users, Star, BarChart3, Sparkles } from "lucide-react";

const previews = [
  { icon: Users, label: "Lead management", to: "/barber/leads" },
  { icon: Calendar, label: "Appointments", to: "/barber/appointments" },
  { icon: Star, label: "Reviews & ratings", to: "/barber/reviews" },
  { icon: BarChart3, label: "Performance insights", to: "/barber/insights" },
];

const BarberComingSoonPage = () => {
  let businessName = "";
  try {
    const raw = localStorage.getItem("smartcut_barber_business");
    if (raw) businessName = (JSON.parse(raw)?.businessName ?? "").toString().slice(0, 120);
  } catch {
    businessName = "";
  }

  return (
  <div className="min-h-screen bg-hero-gradient pt-28 pb-20 px-4">
    <div className="container mx-auto max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card border border-border shadow-soft mb-6">
          <Scissors className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
          {businessName ? (
            <>Welcome, <span className="text-gradient">{businessName}</span></>
          ) : (
            <>Barber <span className="text-gradient">Dashboard</span></>
          )}
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          Manage your business profile, leads, appointments, reviews, and SmartCut performance
          insights — all in one place.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-12 grid sm:grid-cols-2 gap-4"
      >
        {previews.map((p) => (
          <Link
            key={p.label}
            to={p.to}
            className="group flex items-center gap-4 p-5 rounded-2xl bg-card border border-border shadow-soft hover:shadow-elevated hover:-translate-y-0.5 transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center shrink-0">
              <p.icon className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="font-medium text-card-foreground flex-1">{p.label}</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="mt-4"
      >
        <Link
          to="/barber/content-creator"
          className="group flex items-center gap-4 p-6 rounded-2xl bg-card border border-primary/30 shadow-elevated hover:-translate-y-0.5 hover:shadow-elevated transition-all relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: "var(--gradient-primary)" }}
          />
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-primary-foreground shadow-soft"
            style={{ backgroundImage: "var(--gradient-primary)" }}
          >
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0 relative">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-card-foreground">Business Content Creator</span>
              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                New
              </span>
            </div>
            <span className="block text-sm text-muted-foreground mt-1">
              Create short AI-powered social media videos for your barbershop.
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform relative" />
        </Link>
      </motion.div>

      <div className="mt-12 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-soft"
          style={{ backgroundImage: "var(--gradient-primary)" }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  </div>
  );
};

export default BarberComingSoonPage;
