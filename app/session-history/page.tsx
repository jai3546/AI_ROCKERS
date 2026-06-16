// // // "use client"

// // // import { StudySessionHistory } from "@/components/learning/study-session-history"
// // // import { useRouter } from "next/navigation"

// // // export default function SessionHistoryPage() {
// // //   const router = useRouter()

// // //   return (
// // //     <main className="min-h-screen bg-background flex items-center justify-center p-4">
// // //       <StudySessionHistory
// // //         onClose={() => router.push("/student-dashboard")}
// // //         language="en"
// // //       />
// // //     </main>
// // //   )
// // // }

// // "use client"

// // import { StudySessionHistory } from "@/components/learning/study-session-history"
// // import { useRouter } from "next/navigation"

// // export default function SessionHistoryPage() {
// //   const router = useRouter()

// //   return (
// //     <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-6">
// //       <StudySessionHistory
// //         onClose={() => router.push("/student-dashboard")}
// //         language="en"
// //       />
// //     </main>
// //   )
// // }

// "use client"

// import { StudySessionHistory } from "@/components/learning/study-session-history"
// import { useRouter } from "next/navigation"

// export default function SessionHistoryPage() {
//   const router = useRouter()

//   return (
//     <main className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-highlight/5 p-4 md:p-6">
//       <div className="container mx-auto max-w-7xl">
//         <StudySessionHistory
//           onClose={() => router.push("/student-dashboard")}
//           language="en"
//         />
//       </div>
//     </main>
//   )
// }



// "use client";

// import { StudySessionHistory } from "@/components/learning/study-session-history";
// import { useRouter } from "next/navigation";

// export default function SessionHistoryPage() {
//   const router = useRouter();

//   return (
//     <main className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-highlight/10 py-8 px-4">
//       <div className="container mx-auto max-w-7xl">
//         <div className="mb-6">
//           <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
//             Study Session History
//           </h1>
//           <p className="text-muted-foreground mt-2">
//             Track your learning progress, study patterns, and performance insights.
//           </p>
//         </div>

//         <StudySessionHistory
//           onClose={() => router.push("/student-dashboard")}
//           language="en"
//         />
//       </div>
//     </main>
//   );
// }

"use client";

import { StudySessionHistory } from "@/components/learning/study-session-history";
import { useRouter } from "next/navigation";
import { AppSidebar, AppBottomNav } from "@/components/layout/app-nav";

export default function SessionHistoryPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("demoUser");
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-highlight/10 py-8 px-4 pb-20">
      <AppSidebar onLogout={handleLogout} />
      <div className="container mx-auto max-w-7xl md:ml-16">
        <div className="mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Study Session History
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your learning progress, study patterns, and performance insights.
          </p>
        </div>

        <StudySessionHistory onClose={() => router.push("/student-dashboard")} language="en" />
      </div>
      <AppBottomNav />
    </main>
  );
}