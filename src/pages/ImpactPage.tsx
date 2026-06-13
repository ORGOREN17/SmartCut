import { motion } from "framer-motion";
import {
  Heart,
  Users,
  Scissors,
  Award,
  ArrowRight,
  Sparkles,
  Globe,
  HandHeart,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const metrics = [
  { value: "1,240+", label: "Free SmartCut accesses provided", icon: Sparkles },
  { value: "86", label: "Partner barbers", icon: Scissors },
  { value: "3,200+", label: "Free haircut slots donated", icon: HandHeart },
  { value: "14", label: "Communities supported", icon: Globe },
];

const partnerBenefits = [
  {
    icon: Award,
    title: "Impact Partner badge",
    desc: "Stand out on SmartCut with a verified badge that shows your commitment to the community.",
  },
  {
    icon: Users,
    title: "Positive visibility",
    desc: "Get featured on our impact page and recognized for giving back to those who need it most.",
  },
  {
    icon: TrendingUp,
    title: "Stronger reputation",
    desc: "Build trust with clients and the local community by showing you care beyond the chair.",
  },
];

const ImpactPage = () => (
  <div className="min-h-screen pt-20">
    {/* Hero */}
    <section className="relative overflow-hidden bg-hero-gradient pt-16 pb-20 lg:pt-24 lg:pb-28">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold mb-6 shadow-soft">
            <Heart className="w-3.5 h-3.5" /> Social Impact
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.05]">
            Haircut for{" "}
            <span className="text-gradient">Everyone.</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            Making confidence and personal grooming more accessible through
            AI, community, and partner barbers.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Our Mission */}
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 max-w-3xl text-center">
        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Our Mission
          </h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            SmartCut is not only about finding the right haircut. It is about
            making confidence accessible to everyone. We believe everyone
            deserves to feel confident, prepared, and respected when getting a
            haircut — regardless of their background or circumstances.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Free SmartCut Access */}
    <section className="py-16 bg-hero-gradient">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          {...fadeUp}
          className="p-8 sm:p-10 rounded-2xl bg-card border border-border shadow-soft text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-6 h-6 text-accent-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Free SmartCut Access
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-lg mx-auto">
            Eligible users can receive free access to SmartCut features,
            including AI face analysis, hairstyle recommendations, and guided
            barber conversations.
          </p>
          <Button
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 h-auto font-semibold"
            style={{ backgroundImage: "var(--gradient-primary)" }}
            asChild
          >
            <Link to="#">
              Apply for Free Access <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Applications will be reviewed by our team.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Free or Discounted Haircuts */}
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          {...fadeUp}
          className="p-8 sm:p-10 rounded-2xl bg-card border border-border shadow-soft text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-5">
            <HandHeart className="w-6 h-6 text-accent-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Free or Discounted Haircuts
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-lg mx-auto">
            SmartCut plans to connect eligible users with participating barbers
            who offer free or discounted haircut appointments. Together, we can
            make sure no one misses out on looking and feeling their best.
          </p>
          <Button
            variant="outline"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 h-auto font-semibold border-2"
            asChild
          >
            <Link to="#">
              Find Participating Barbers <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>

    {/* Become an Impact Partner */}
    <section className="py-16 bg-hero-gradient">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div {...fadeUp} className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Become an Impact Partner
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Barbers can join the initiative by offering a small number of free
            or discounted haircuts each month. It is a simple way to give back
            and grow your reputation at the same time.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6 mb-10">
          {partnerBenefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="p-6 rounded-2xl bg-card border border-border shadow-soft text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
                <b.icon className="w-5 h-5 text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-card-foreground mb-2">
                {b.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {b.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div {...fadeUp} className="text-center">
          <Button
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 h-auto font-semibold"
            style={{ backgroundImage: "var(--gradient-primary)" }}
            asChild
          >
            <Link to="#">
              Become an Impact Partner <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>

    {/* Impact Metrics */}
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div {...fadeUp} className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Impact So Far
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Early numbers from our pilot and community outreach.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="p-6 rounded-2xl bg-card border border-border shadow-soft text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
                <m.icon className="w-5 h-5 text-accent-foreground" />
              </div>
              <div className="text-3xl font-extrabold text-gradient mb-1">
                {m.value}
              </div>
              <div className="text-sm text-muted-foreground leading-snug">
                {m.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Closing CTA */}
    <section className="py-16 bg-hero-gradient">
      <div className="container mx-auto px-4 text-center max-w-2xl">
        <motion.div {...fadeUp}>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Join the movement.
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Whether you are looking for support or want to offer it, SmartCut
            is building a community where everyone gets a seat in the chair.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 h-auto font-semibold"
              style={{ backgroundImage: "var(--gradient-primary)" }}
              asChild
            >
              <Link to="#">
                Apply for Free Access <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 h-auto font-semibold border-2"
              asChild
            >
              <Link to="#">
                Become a Partner <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  </div>
);

export default ImpactPage;
