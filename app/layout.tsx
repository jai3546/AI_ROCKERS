import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ServiceWorkerRegistration } from "@/components/service-worker-registration"
import Footer from "@/components/footer" // 1. Imported the Footer here

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "VidyaAI | Education for All",
  description: "Voice-first educational platform for underprivileged students",
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
      </head>
      {/* 2. Added flex, flex-col, and min-h-screen to the body layout */}
      <body className={`${inter.className} site-tint flex flex-col min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {/* 3. Wrapped children in a main tag with flex-grow to push footer down */}
          <div className="flex-grow">
            {children}
          </div>
          
          <ServiceWorkerRegistration />
          
          {/* 4. Placed the Footer component at the bottom */}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}