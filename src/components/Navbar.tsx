import { Link, useLocation, useNavigate } from "react-router-dom";
import { Scissors, Menu, X, Moon, Sun, LogIn, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const links = [
    { to: "/", label: "Home" },
    { to: "/upload", label: "Analyze" },
    { to: "/catalog", label: "Catalog" },
    { to: "/compare", label: "Compare" },
    { to: "/impact", label: "Haircut for Everyone" },
    { to: "/profile", label: "Profile" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Scissors className="w-5 h-5 text-primary" />
          <span className="text-foreground">Smart<span className="text-gradient">Cut</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === l.to
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={handleSignOut}
              className="ml-2 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          ) : (
            <Link
              to="/auth"
              className="ml-2 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <LogIn className="w-4 h-4" /> Sign in
            </Link>
          )}
          <button
            onClick={() => setDark(!dark)}
            className="ml-1 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <button
          className="md:hidden p-2 text-muted-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-border bg-card"
          >
            <div className="p-4 flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === l.to
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <button
                onClick={() => setDark(!dark)}
                className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground text-left flex items-center gap-2"
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {dark ? "Light Mode" : "Dark Mode"}
              </button>
              {user ? (
                <button
                  onClick={() => { setMobileOpen(false); handleSignOut(); }}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground text-left flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-foreground flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" /> Sign in
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
