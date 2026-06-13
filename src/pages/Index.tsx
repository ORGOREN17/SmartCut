import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Scan, Sparkles, Eye, ShieldCheck } from "lucide-react";
import heroImg from "@/assets/hero-illustration.jpg";
import SocialShare from "@/components/SocialShare";

const features = [
  { icon: Scan, title: "AI Face Analysis", desc: "Upload your photo and our AI detects face shape, hair type, skin tone, and more." },
  { icon: Eye, title: "See Yourself", desc: "Get personalized hairstyle previews generated on your actual face — not generic models." },
  { icon: Sparkles, title: "Smart Matching", desc: "Our algorithm ranks hairstyles by compatibility with your features and preferences." },
];

const Index = () => (
  <div className="min-h-screen">
    {/* Hero */}
    <section className="relative overflow-hidden bg-hero-gradient pt-32 pb-20 lg:pt-40 lg:pb-28">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold mb-5 shadow-soft">
            <Sparkles className="w-3.5 h-3.5" /> AI-powered beauty tech
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.05]">
            See Yourself With{" "}
            <span className="text-gradient">Any Haircut.</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Upload your photo and AI generates realistic previews of you with different hairstyles. Find your perfect look before visiting the barber.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Link
              to="/get-started"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-primary-foreground transition-all hover:opacity-95 hover:shadow-elevated shadow-card"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              Try SmartCut Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="mt-6 flex items-center gap-2 justify-center lg:justify-start text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-primary" /> Private by design · No signup required
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 max-w-md"
        >
          <img src={heroImg} alt="AI hairstyle preview" width={800} height={600} className="w-full rounded-3xl shadow-elevated" />
        </motion.div>
      </div>
    </section>

    {/* Features */}
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-4">How It Works</h2>
        <p className="text-center text-muted-foreground mb-14 max-w-md mx-auto">Three steps to your perfect hairstyle</p>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="p-8 rounded-2xl bg-card border border-border shadow-soft hover:shadow-card transition-shadow text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-5">
                <f.icon className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-lg text-card-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-16 bg-hero-gradient">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Ready to see your new look?</h2>
        <p className="text-muted-foreground mb-8">Upload a photo and get AI-generated hairstyle previews in minutes.</p>
        <Link
          to="/get-started"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-primary-foreground hover:opacity-95 transition-opacity shadow-card"
          style={{ backgroundImage: "var(--gradient-primary)" }}
        >
          Get Started <ArrowRight className="w-4 h-4" />
        </Link>

        <SocialShare className="mt-10" heading="Spread the word" />
      </div>
    </section>
  </div>
);

export default Index;
