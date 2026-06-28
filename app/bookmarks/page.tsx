"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"
interface Bookmark {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: string
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem("ai-bookmarks")

    if (saved) {
      setBookmarks(JSON.parse(saved))
    }
  }, [])
const handleDelete = (id: string) => {
  const updatedBookmarks = bookmarks.filter(
    (bookmark) => bookmark.id !== id
  )

  setBookmarks(updatedBookmarks)

  localStorage.setItem(
    "ai-bookmarks",
    JSON.stringify(updatedBookmarks)
  )
}
const filteredBookmarks = bookmarks.filter((bookmark) =>
  bookmark.content.toLowerCase().includes(searchQuery.toLowerCase())
)
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        AI Bookmarks
      </h1>
<Input
  placeholder="Search bookmarks..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="mb-6"
/>
      {bookmarks.length === 0 ? (
        <p className="text-muted-foreground">
          No bookmarks saved yet.
        </p>
      ) : (
        <div className="space-y-4">
          {filteredBookmarks.map((bookmark) => (
            <Card key={bookmark.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-4">
  <p className="whitespace-pre-wrap flex-1">
    {bookmark.content}
  </p>

  <Button
    variant="ghost"
    size="icon"
    onClick={() => handleDelete(bookmark.id)}
  >
    <Trash2 className="h-4 w-4 text-red-500" />
  </Button>
</div>

<p className="text-xs text-muted-foreground mt-3">
                  {new Date(bookmark.timestamp).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}