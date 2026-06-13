import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart3, Users, Calendar, Star, Sparkles, TrendingUp } from "lucide-react";

const stats = [
  { icon: Users, label: "Total leads", value: "42" },
  { icon: Calendar, label: "Completed appointments", value: "28" },
  { icon: Sparkles, label: "Avg SmartCut match", value: "87%" },
  { icon: Star, label: "Review rating", value: "4.8" },
  { icon: TrendingUp, label: "Most requested style", value: "Textured Crop" },
];

const suggestions = [
  "Improve your Instagram presence with weekly posts",
  "Respond to all recent customer reviews",
  "Upload more haircut portfolio photos",
  "Promote your high-performing haircut styles",
];

const BarberInsightsPage = () => (
  <div className="min-h-screen bg-hero-gradient pt-28 pb-20 px-4">
    <div className="container mx-auto max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-card border border-border shadow-soft mb-5">
          <BarChart3 className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Performance <span className="text-gradient">Insights</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
          Track your business and haircut performance with key metrics and tailored growth suggestions.
        </p>
      </motion.div>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="p-5 rounded-2xl bg-card border border-border shadow-soft"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <s.icon className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">{s.label}</span>
            </div>
            <div className="text-2xl font-extrabold text-card-foreground">{s.value}</div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 p-6 rounded-2xl bg-card border border-border shadow-soft"
      >
        <h2 className="text-lg font-bold text-card-foreground mb-4">Suggestions to grow</h2>
        <ul className="space-y-3">
          {suggestions.map((s, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      <div className="mt-12 text-center">
        <Link to="/barber" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-border bg-card hover:bg-accent transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Barber Dashboard
        </Link>
      </div>
    </div>
  </div>
);

export default BarberInsightsPage;
