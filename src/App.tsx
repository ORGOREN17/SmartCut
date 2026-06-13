import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import UserTypePage from "./pages/UserTypePage.tsx";
import BarberDetailsPage from "./pages/BarberDetailsPage.tsx";
import BarberComingSoonPage from "./pages/BarberComingSoonPage.tsx";
import BarberLeadsPage from "./pages/BarberLeadsPage.tsx";
import BarberAppointmentsPage from "./pages/BarberAppointmentsPage.tsx";
import BarberReviewsPage from "./pages/BarberReviewsPage.tsx";
import BarberInsightsPage from "./pages/BarberInsightsPage.tsx";
import BarberContentCreatorPage from "./pages/BarberContentCreatorPage.tsx";
import UploadPage from "./pages/UploadPage.tsx";
import CatalogPage from "./pages/CatalogPage.tsx";
import GuidancePage from "./pages/GuidancePage.tsx";
import ComparePage from "./pages/ComparePage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import NotFound from "./pages/NotFound.tsx";
import ImpactPage from "./pages/ImpactPage.tsx";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/get-started" element={<UserTypePage />} />
            <Route path="/barber-details" element={<BarberDetailsPage />} />
            <Route path="/barber" element={<BarberComingSoonPage />} />
            <Route path="/barber/leads" element={<BarberLeadsPage />} />
            <Route path="/barber/appointments" element={<BarberAppointmentsPage />} />
            <Route path="/barber/reviews" element={<BarberReviewsPage />} />
            <Route path="/barber/insights" element={<BarberInsightsPage />} />
            <Route path="/barber/content-creator" element={<BarberContentCreatorPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/guidance" element={<GuidancePage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="/impact" element={<ImpactPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
