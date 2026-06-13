import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

const questions = [
  {
    key: "desiredVibe",
    title: "What's your vibe?",
    subtitle: "Pick the look that resonates most",
    options: [
      { value: "trendy", label: "🔥 Trendy", desc: "Fresh and on-trend" },
      { value: "professional", label: "💼 Professional", desc: "Clean and office-ready" },
      { value: "stylish", label: "✨ Stylish", desc: "Sharp and put-together" },
      { value: "low-maintenance", label: "🌿 Low-Key", desc: "Easy and effortless" },
    ],
  },
  {
    key: "maintenanceLevel",
    title: "How much effort?",
    subtitle: "How long do you want to spend styling?",
    options: [
      { value: "low", label: "⚡ Minimal", desc: "Wash and go" },
      { value: "medium", label: "🎨 Moderate", desc: "5-10 min daily" },
      { value: "high", label: "💎 Full routine", desc: "I enjoy the process" },
    ],
  },
  {
    key: "setting",
    title: "Where's it going?",
    subtitle: "Primary setting for your look",
    options: [
      { value: "office", label: "🏢 Office / Corporate", desc: "Professional environment" },
      { value: "creative", label: "🎨 Creative / Casual", desc: "Relaxed workplace" },
      { value: "social", label: "🎉 Social / Going out", desc: "Making an impression" },
      { value: "active", label: "🏃 Active / Sporty", desc: "On the move" },
    ],
  },
  {
    key: "preferredLength",
    title: "Length preference?",
    subtitle: "How much hair do you want?",
    options: [
      { value: "short", label: "✂️ Short", desc: "Crew cuts, fades, buzz" },
      { value: "medium", label: "📏 Medium", desc: "Quiffs, pomps, crops" },
      { value: "long", label: "💇 Long", desc: "Flows, buns, layers" },
    ],
  },
];

interface Props {
  onComplete: (prefs: Record<string, string>) => void;
}

const OnboardingFlow = ({ onComplete }: Props) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const q = questions[step];
  if (!q) return null;
  const isLast = step === questions.length - 1;
  const selected = answers[q.key];

  const handleSelect = (value: string) => {
    const next = { ...answers, [q.key]: value };
    setAnswers(next);
    if (isLast) {
      setTimeout(() => onComplete(next), 300);
    } else {
      setTimeout(() => setStep((s) => s + 1), 300);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-lg">
        {/* Progress */}
        <div className="flex gap-2 mb-10">
          {questions.map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-secondary">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: i <= step ? "100%" : "0%" }}
                className="h-full rounded-full"
                style={{ backgroundImage: "var(--gradient-primary)" }}
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground">{q.title}</h1>
              <p className="text-muted-foreground mt-2">{q.subtitle}</p>
            </div>

            <div className="space-y-3">
              {q.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full p-5 rounded-2xl border text-left transition-all hover:shadow-card ${
                    selected === opt.value
                      ? "border-primary bg-accent shadow-card"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <p className="font-semibold text-foreground">{opt.label}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>

            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="mt-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingFlow;
