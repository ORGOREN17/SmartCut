import { motion } from "framer-motion";
import { Star, Heart } from "lucide-react";
import type { Hairstyle } from "@/data/mockData";

interface Props {
  style: Hairstyle;
  image: string;
  index: number;
}

const HairstyleCard = ({ style, image, index }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.4 }}
    className={`relative rounded-2xl overflow-hidden shadow-card bg-card border transition-all hover:shadow-elevated hover:-translate-y-1 ${
      style.isBestMatch ? "border-primary ring-2 ring-primary/20" : "border-border"
    }`}
  >
    {style.isBestMatch && (
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
        <Star className="w-3 h-3" /> Best Match
      </div>
    )}
    <div className="aspect-square overflow-hidden bg-secondary">
      <img src={image} alt={style.name} className="w-full h-full object-cover" loading="lazy" width={512} height={512} />
    </div>
    <div className="p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-card-foreground">{style.name}</h3>
        <button className="text-muted-foreground hover:text-primary transition-colors">
          <Heart className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-2 flex-1 rounded-full bg-secondary overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${style.matchPercentage}%` }}
            transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
            className="h-full rounded-full"
            style={{ backgroundImage: "var(--gradient-primary)" }}
          />
        </div>
        <span className="text-sm font-semibold text-primary">{style.matchPercentage}%</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{style.description}</p>
    </div>
  </motion.div>
);

export default HairstyleCard;
