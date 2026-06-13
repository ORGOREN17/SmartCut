import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Plus } from "lucide-react";

const appointments = [
  { name: "Customer A.", date: "2026-05-22", time: "10:30", style: "Textured Crop", status: "Upcoming" },
  { name: "Customer B.", date: "2026-05-20", time: "14:00", style: "Side Part Fade", status: "Upcoming" },
  { name: "Customer C.", date: "2026-05-15", time: "11:00", style: "French Crop", status: "Completed" },
  { name: "Customer D.", date: "2026-05-12", time: "16:30", style: "Messy Quiff", status: "Cancelled" },
];

const statusStyles: Record<string, string> = {
  Upcoming: "bg-primary/10 text-primary",
  Completed: "bg-emerald-500/10 text-emerald-600",
  Cancelled: "bg-destructive/10 text-destructive",
};

const BarberAppointmentsPage = () => (
  <div className="min-h-screen bg-hero-gradient pt-28 pb-20 px-4">
    <div className="container mx-auto max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-card border border-border shadow-soft mb-5">
          <Calendar className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          <span className="text-gradient">Appointments</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
          Manage your haircut bookings, view upcoming sessions and track completed appointments.
        </p>
        <button className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-soft" style={{ backgroundImage: "var(--gradient-primary)" }}>
          <Plus className="w-4 h-4" /> Add Appointment
        </button>
      </motion.div>

      <div className="mt-10 space-y-3">
        {appointments.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="p-5 rounded-2xl bg-card border border-border shadow-soft flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div>
              <h3 className="font-semibold text-card-foreground">{a.name}</h3>
              <p className="text-sm text-muted-foreground">{a.style}</p>
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">{a.date}</span> · {a.time}
            </div>
            <span className={`self-start sm:self-auto px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyles[a.status]}`}>
              {a.status}
            </span>
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

export default BarberAppointmentsPage;
