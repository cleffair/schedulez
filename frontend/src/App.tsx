import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "./lib/supabase";
import { useAuthStore } from "./store/useAuthStore";
import api from "./lib/api";

import { ThemeProvider } from "./components/ThemeProvider";
import { AuthGuard } from "./components/AuthGuard";
import { AppShell } from "./components/AppShell";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { ImportPage } from "./features/import/pages/ImportPage";
import { ScheduleListPage } from "./features/schedules/pages/ScheduleListPage";
import { ScheduleDetailPage } from "./features/schedules/pages/ScheduleDetailPage";
import { DashboardPage } from "./features/dashboard/pages/DashboardPage";
import { CalendarPage } from "./features/calendar/pages/CalendarPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const { setUser, setProfile, setInitialized } = useAuthStore();

  useEffect(() => {
    // 1. Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        syncUserWithBackend();
      } else {
        setInitialized(true);
      }
    });

    // 2. Listen for Auth State Changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        syncUserWithBackend();
      } else {
        setProfile(null);
        setInitialized(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncUserWithBackend = async () => {
    try {
      // Because interceptor auto-adds the new token, we just fire the sync
      const res = await api.post("/auth/sync");
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to sync user with backend:", err);
    } finally {
      setInitialized(true);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="schedulez-theme">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<AuthGuard />}>
              <Route element={<AppShell />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/schedules" element={<ScheduleListPage />} />
                <Route path="/schedules/:scheduleId" element={<ScheduleDetailPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/import" element={<ImportPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
