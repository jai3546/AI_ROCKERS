"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LearningBrainDashboard } from "../../components/learning/learning-brain-dashboard";
import { ThemeProvider } from "../../components/theme-provider";

export default function LearningBrainPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    name: string;
    class: string;
    role: string;
    avatar: string;
    isDemo: boolean;
  } | null>(null);

  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = localStorage.getItem("demoUser");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } else {
          router.push("/student-login");
        }
      } catch (e) {
        console.error("Error loading user in learning brain:", e);
        router.push("/student-login");
      }
    };
    loadUser();
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12 pt-6">
        <div className="container max-w-7xl mx-auto px-4 md:px-8">
          <LearningBrainDashboard studentId={user.id} studentName={user.name} />
        </div>
      </main>
    </ThemeProvider>
  );
}
