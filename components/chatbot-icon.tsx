import { Bot } from "lucide-react"

export function ChatbotIcon({ className }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
      <div className="relative bg-primary rounded-full p-3">
        <Bot className="h-6 w-6 text-primary-foreground" />
      </div>
    </div>
  )
}
