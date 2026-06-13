import { motion } from "framer-motion";
import { Scan } from "lucide-react";

const steps = ["Detecting face shape…", "Analyzing hair type…", "Evaluating skin tone…", "Generating recommendations…"];

interface Props {
  step: number;
}

const AnalysisLoader = ({ step }: Props) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center gap-6 py-12"
  >
    <div className="relative w-24 h-24">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <Scan className="w-8 h-8 text-primary animate-pulse-soft" />
      </div>
    </div>
    <div className="flex flex-col items-center gap-2">
      {steps.map((s, i) => (
        <motion.p
          key={s}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: i <= step ? 1 : 0.3 }}
          className={`text-sm transition-colors ${i <= step ? "text-foreground font-medium" : "text-muted-foreground"}`}
        >
          {i < step ? "✓" : i === step ? "●" : "○"} {s}
        </motion.p>
      ))}
    </div>
    <div className="w-48 h-1.5 rounded-full bg-secondary overflow-hidden">
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
        transition={{ duration: 0.5 }}
        className="h-full rounded-full"
        style={{ backgroundImage: "var(--gradient-primary)" }}
      />
    </div>
  </motion.div>
);

export default AnalysisLoader;
