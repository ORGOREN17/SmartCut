import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, ExternalLink } from "lucide-react";

const reviews = [
  { name: "Customer A.", rating: 5, score: 94, text: "Best haircut I've had in years. The SmartCut match was spot on!", google: "#" },
  { name: "Customer B.", rating: 4, score: 88, text: "Great experience and very professional. Will be coming back.", google: "#" },
  { name: "Customer C.", rating: 5, score: 91, text: "Loved the style recommendation. Friendly and skilled barber.", google: null },
];

const Stars = ({ n }: { n: number }) => (
  <div className="flex">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < n ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />
    ))}
  </div>
);

const BarberReviewsPage = () => {
  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  return (
    <div className="min-h-screen bg-hero-gradient pt-28 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-card border border-border shadow-soft mb-5">
            <Star className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Reviews & <span className="text-gradient">Ratings</span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Track customer reviews, Google Reviews, and SmartCut feedback in one place.
          </p>
          <div className="mt-6 inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-card border border-border shadow-soft">
            <span className="text-3xl font-extrabold text-foreground">{avg}</span>
            <Stars n={Math.round(Number(avg))} />
            <span className="text-sm text-muted-foreground">avg rating</span>
          </div>
        </motion.div>

        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="p-5 rounded-2xl bg-card border border-border shadow-soft"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-card-foreground">{r.name}</h3>
                <Stars n={r.rating} />
              </div>
              <p className="text-xs text-muted-foreground mb-3">SmartCut match: <span className="text-foreground font-medium">{r.score}%</span></p>
              <p className="text-sm text-muted-foreground leading-relaxed">"{r.text}"</p>
              {r.google && (
                <a href={r.google} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                  View on Google Reviews <ExternalLink className="w-3 h-3" />
                </a>
              )}
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
};

export default BarberReviewsPage;
