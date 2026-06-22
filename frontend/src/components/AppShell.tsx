import { Outlet, Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { supabase } from "../lib/supabase";
import { useTheme } from "./ThemeProvider";
import { LogOut, Moon, Sun, Calendar } from "lucide-react";

export function AppShell() {
  const { profile } = useAuthStore();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <Link to="/" className="font-bold text-lg hidden sm:block mr-4">
              Schedulez
            </Link>
            <nav className="flex items-center space-x-4">
              <Link to="/schedules" className="text-sm font-medium transition-colors hover:text-primary">
                Schedules
              </Link>
              <Link to="/calendar" className="text-sm font-medium transition-colors hover:text-primary">
                Calendar
              </Link>
              <Link to="/import" className="text-sm font-medium transition-colors hover:text-primary">
                AI Import
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {profile?.email}
            </span>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent hover:text-destructive"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container py-6">
        <Outlet />
      </main>
    </div>
  );
}
