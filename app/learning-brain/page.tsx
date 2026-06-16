// // // "use client";

// // // import { useEffect, useState } from "react";
// // // import { useRouter } from "next/navigation";
// // // import { LearningBrainDashboard } from "../../components/learning/learning-brain-dashboard";
// // // import { ThemeProvider } from "../../components/theme-provider";

// // // export default function LearningBrainPage() {
// // //   const router = useRouter();
// // //   const [user, setUser] = useState<{
// // //     id: string;
// // //     name: string;
// // //     class: string;
// // //     role: string;
// // //     avatar: string;
// // //     // isDemo: boolean;
// // //   } | null>(null);

// // //   useEffect(() => {
// // //     const loadUser = () => {
// // //       try {
// // //         const userData = localStorage.getItem("demoUser");

// // //         if (userData) {
// // //           const parsedUser = JSON.parse(userData);
// // //           setUser(parsedUser);
// // //         } else {
// // //           router.push("/student-login");
// // //         }
// // //       } catch (e) {
// // //         console.error("Error loading user in learning brain:", e);
// // //         router.push("/student-login");
// // //       }
// // //     };

// // //     loadUser();
// // //   }, [router]);

// // //   if (!user) {
// // //     return (
// // //       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
// // //         <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
// // //       <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-12 pt-6">
// // //         <div className="container mx-auto max-w-7xl px-4 md:px-8">
// // //           <LearningBrainDashboard
// // //             studentId={user.id}
// // //             studentName={user.name}
// // //           />
// // //         </div>
// // //       </main>
// // //     </ThemeProvider>
// // //   );
// // // }


// // "use client";

// // import { useEffect, useState } from "react";
// // import { useRouter } from "next/navigation";
// // import { LearningBrainDashboard } from "../../components/learning/learning-brain-dashboard";
// // import { ThemeProvider } from "../../components/theme-provider";

// // export default function LearningBrainPage() {
// //   const router = useRouter();

// //   const [user, setUser] = useState<{
// //     id: string;
// //     name: string;
// //     class: string;
// //     role: string;
// //     avatar: string;
// //     isDemo: boolean;
// //   } | null>(null);

// //   useEffect(() => {
// //     const loadUser = () => {
// //       try {
// //         const userData = localStorage.getItem("demoUser");

// //         if (userData) {
// //           const parsedUser = JSON.parse(userData);
// //           setUser(parsedUser);
// //         } else {
// //           router.push("/student-login");
// //         }
// //       } catch (e) {
// //         console.error("Error loading user in learning brain:", e);
// //         router.push("/student-login");
// //       }
// //     };

// //     loadUser();
// //   }, [router]);

// //   if (!user) {
// //     return (
// //       <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-highlight/5 flex items-center justify-center">
// //         <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary/20 border-t-primary"></div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
// //       <main className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-highlight/5 pb-12 pt-6">
// //         <div className="container mx-auto max-w-7xl px-4 md:px-8">
// //           <LearningBrainDashboard
// //             studentId={user.id}
// //             studentName={user.name}
// //           />
// //         </div>
// //       </main>
// //     </ThemeProvider>
// //   );
// // }



// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { LearningBrainDashboard } from "../../components/learning/learning-brain-dashboard";

// export default function LearningBrainPage() {
//   const router = useRouter();

//   const [user, setUser] = useState<{
//     id: string;
//     name: string;
//     class: string;
//     role: string;
//     avatar: string;
//     isDemo: boolean;
//   } | null>(null);

//   useEffect(() => {
//     try {
//       const userData = localStorage.getItem("demoUser");

//       if (userData) {
//         setUser(JSON.parse(userData));
//       } else {
//         router.push("/student-login");
//       }
//     } catch (e) {
//       console.error("Error loading user in learning brain:", e);
//       router.push("/student-login");
//     }
//   }, [router]);

//   if (!user) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
//       </div>
//     );
//   }

//   return (
//     <main className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6">
//         <LearningBrainDashboard
//           studentId={user.id}
//           studentName={user.name}
//         />
//       </div>
//     </main>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LearningBrainDashboard } from "../../components/learning/learning-brain-dashboard";
import { AppSidebar, AppBottomNav } from "@/components/layout/app-nav";

export default function LearningBrainPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; class: string; role: string; avatar: string; isDemo: boolean } | null>(null);

  useEffect(() => {
    try {
      const userData = localStorage.getItem("demoUser");
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        router.push("/student-login");
      }
    } catch (e) {
      console.error("Error loading user in learning brain:", e);
      router.push("/student-login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("demoUser");
    router.push("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-20">
      <AppSidebar user={user} onLogout={handleLogout} />
      <div className="container mx-auto px-4 py-6 md:ml-16">
        <LearningBrainDashboard studentId={user.id} studentName={user.name} />
      </div>
      <AppBottomNav />
    </main>
  );
}