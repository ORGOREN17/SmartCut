import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users } from "lucide-react";

const leads = [
  { name: "Customer A.", style: "Textured Crop", score: 94, status: "New" },
  { name: "Customer B.", style: "Side Part Fade", score: 88, status: "Contacted" },
  { name: "Customer C.", style: "French Crop", score: 82, status: "Booked" },
  { name: "Customer D.", style: "Slicked Back Undercut", score: 76, status: "New" },
];

const statusStyles: Record<string, string> = {
  New: "bg-primary/10 text-primary",
  Contacted: "bg-accent text-accent-foreground",
  Booked: "bg-emerald-500/10 text-emerald-600",
};

const BarberLeadsPage = () => (
  <div className="min-h-screen bg-hero-gradient pt-28 pb-20 px-4">
    <div className="container mx-auto max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-card border border-border shadow-soft mb-5">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Lead <span className="text-gradient">Management</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
          Track potential customers coming from SmartCut. Reach out, follow up, and convert leads into booked haircuts.
        </p>
      </motion.div>

      <div className="mt-10 grid sm:grid-cols-2 gap-4">
        {leads.map((l, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="p-5 rounded-2xl bg-card border border-border shadow-soft"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-card-foreground">{l.name}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyles[l.status]}`}>
                {l.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Desired style: <span className="text-foreground font-medium">{l.style}</span></p>
            <p className="text-sm text-muted-foreground">SmartCut match: <span className="text-foreground font-medium">{l.score}%</span></p>
            <button className="mt-4 w-full py-2 rounded-xl text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity" style={{ backgroundImage: "var(--gradient-primary)" }}>
              View Lead
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link to="/barber" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-border bg-card hover:bg-accent transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Barber Dashboard
        </Link>
      </div>
    </div>
  </div>
);

export default BarberLeadsPage;
