import { motion } from "framer-motion";
import { mockHairstyles } from "@/data/mockData";
import HairstyleCard from "@/components/HairstyleCard";
import img1 from "@/assets/hairstyle-1.jpg";
import img2 from "@/assets/hairstyle-2.jpg";
import img3 from "@/assets/hairstyle-3.jpg";
import img4 from "@/assets/hairstyle-4.jpg";
import img5 from "@/assets/hairstyle-5.jpg";

const images = [img1, img2, img3, img4, img5];

const RecommendationsPage = () => (
  <div className="min-h-screen pt-24 pb-16">
    <div className="container mx-auto px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-12">
        <h1 className="text-3xl font-bold text-foreground">Your Recommendations</h1>
        <p className="text-muted-foreground mt-2">Hairstyles matched to your face shape, hair type & skin tone</p>
      </motion.div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {mockHairstyles.map((s, i) => (
          <HairstyleCard key={s.id} style={s} image={images[i]} index={i} />
        ))}
      </div>
    </div>
  </div>
);

export default RecommendationsPage;
