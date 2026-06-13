import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { UPGRADE_MESSAGE } from "@/hooks/useUsageGate";

interface Props {
  open: boolean;
  onClose: () => void;
}

const UpgradeModal = ({ open, onClose }: Props) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-card p-7 text-center"
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <X className="w-4 h-4" />
          </button>
          <div
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4"
            style={{ backgroundImage: "var(--gradient-primary)" }}
          >
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <h2 className="text-lg font-bold text-card-foreground">Daily limit reached</h2>
          <p className="text-sm text-muted-foreground mt-2">{UPGRADE_MESSAGE}</p>
          <button
            onClick={() => {
              // Placeholder CTA — payments not implemented yet
              onClose();
            }}
            className="mt-6 w-full py-3 rounded-xl font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            style={{ backgroundImage: "var(--gradient-primary)" }}
          >
            Upgrade to Pro
          </button>
          <button
            onClick={onClose}
            className="mt-2 w-full py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Maybe later
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default UpgradeModal;
