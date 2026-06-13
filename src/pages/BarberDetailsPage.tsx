import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { upsertBarberProfile } from "@/services/profileService";
import { toast } from "sonner";

const schema = z.object({
  businessName: z.string().trim().min(1, "Business name is required").max(120),
  taxId: z.string().trim().min(1, "Business registration / Tax ID is required").max(60),
  googleReviewsUrl: z
    .string()
    .trim()
    .url("Enter a valid URL (https://...)")
    .max(500)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

const BarberDetailsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [businessName, setBusinessName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [googleReviewsUrl, setGoogleReviewsUrl] = useState("");
  const [errors, setErrors] = useState<{ businessName?: string; taxId?: string; googleReviewsUrl?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ businessName, taxId, googleReviewsUrl });
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.issues.forEach((i) => {
        fieldErrors[i.path[0] as keyof typeof errors] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }

    localStorage.setItem("smartcut_barber_business", JSON.stringify(result.data));

    if (user) {
      try {
        setSubmitting(true);
        await upsertBarberProfile(user.id, {
          business_name: result.data.businessName,
          business_registration_number: result.data.taxId,
          google_reviews_link: result.data.googleReviewsUrl ?? null,
        });
      } catch (err: any) {
        toast.error("Could not save to your account, continuing in demo mode.");
      } finally {
        setSubmitting(false);
      }
    }

    navigate("/barber");
  };

  return (
    <div className="min-h-screen bg-hero-gradient pt-28 pb-20 px-4">
      <div className="container mx-auto max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-card border border-border shadow-soft mb-5">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Business <span className="text-gradient">Details</span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            Tell us a bit about your barber business so we can prepare your SmartCut business profile.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-3xl p-7 shadow-soft space-y-5"
          noValidate
        >
          <div>
            <label className="block text-sm font-semibold text-card-foreground mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter your business name"
              maxLength={120}
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
            />
            {errors.businessName && (
              <p className="mt-1.5 text-xs text-destructive">{errors.businessName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-card-foreground mb-2">
              Business Registration Number / Tax ID
            </label>
            <input
              type="text"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="Enter your business number"
              maxLength={60}
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
            />
            {errors.taxId && <p className="mt-1.5 text-xs text-destructive">{errors.taxId}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-card-foreground mb-2">
              Google Reviews Link <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              type="url"
              value={googleReviewsUrl}
              onChange={(e) => setGoogleReviewsUrl(e.target.value)}
              placeholder="https://g.page/r/..."
              maxLength={500}
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Customers will be redirected here to leave a Google review for your business.
            </p>
            {errors.googleReviewsUrl && (
              <p className="mt-1.5 text-xs text-destructive">{errors.googleReviewsUrl}</p>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Link
              to="/get-started"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold border border-border text-foreground hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-primary-foreground hover:opacity-95 transition-opacity shadow-card"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default BarberDetailsPage;
