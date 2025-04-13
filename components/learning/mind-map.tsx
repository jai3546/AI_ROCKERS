"use client"

import { useState } from "react"

import { useRef, useEffect } from "react"
import { Download, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MindMapNode {
  id: string
  label: string
  color?: string
  children?: MindMapNode[]
}

interface MindMapProps {
  data: MindMapNode
  title: string
  language?: "en" | "hi" | "te"
}

export function MindMap({ data, title, language = "en" }: MindMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = useState(1)

  const translations = {
    zoomIn: {
      en: "Zoom In",
      hi: "ज़ूम इन",
      te: "జూమ్ ఇన్",
    },
    zoomOut: {
      en: "Zoom Out",
      hi: "ज़ूम आउट",
      te: "జూమ్ అవుట్",
    },
    download: {
      en: "Download",
      hi: "डाउनलोड",
      te: "డౌన్‌లోడ్",
    },
  }

  // This is a simplified implementation
  // A real mind map would use a library like d3.js or react-flow
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set canvas dimensions
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    // Apply zoom
    ctx.save()
    ctx.scale(zoom, zoom)

    // Center the mind map
    const centerX = canvas.width / (2 * zoom)
    const centerY = canvas.height / (2 * zoom)

    // Draw the root node
    drawNode(ctx, data, centerX, centerY, 0, 2 * Math.PI)

    ctx.restore()

    // Function to draw a node and its children
    function drawNode(
      ctx: CanvasRenderingContext2D,
      node: MindMapNode,
      x: number,
      y: number,
      startAngle: number,
      endAngle: number,
    ) {
      // Draw the node
      ctx.beginPath()
      ctx.arc(x, y, 40, 0, 2 * Math.PI)
      ctx.fillStyle = node.color || "#4895ef"
      ctx.fill()
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw the label
      ctx.fillStyle = "#ffffff"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(node.label, x, y)

      // Draw children if any
      if (node.children && node.children.length > 0) {
        const angleStep = (endAngle - startAngle) / node.children.length
        const radius = 150 // Distance from parent to child

        node.children.forEach((child, index) => {
          const childAngle = startAngle + angleStep * index + angleStep / 2
          const childX = x + radius * Math.cos(childAngle)
          const childY = y + radius * Math.sin(childAngle)

          // Draw connection line
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(childX, childY)
          ctx.strokeStyle = child.color || "#4895ef"
          ctx.lineWidth = 2
          ctx.stroke()

          // Draw child node
          const childStartAngle = childAngle - Math.PI / 4
          const childEndAngle = childAngle + Math.PI / 4
          drawNode(ctx, child, childX, childY, childStartAngle, childEndAngle)
        })
      }
    }
  }, [data, zoom])

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5))
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = `${title.replace(/\s+/g, "-").toLowerCase()}-mindmap.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  return (
    <div className="w-full bg-white rounded-xl border border-border shadow-md overflow-hidden">
      <div className="bg-highlight/10 p-4 flex items-center justify-between">
        <h3 className="font-bold text-highlight">{title}</h3>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            className="h-8 px-2 border-highlight/50 text-highlight"
          >
            <ZoomOut size={16} className="mr-1" />
            <span className="hidden sm:inline">{translations.zoomOut[language]}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            className="h-8 px-2 border-highlight/50 text-highlight"
          >
            <ZoomIn size={16} className="mr-1" />
            <span className="hidden sm:inline">{translations.zoomIn[language]}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="h-8 px-2 border-highlight/50 text-highlight"
          >
            <Download size={16} className="mr-1" />
            <span className="hidden sm:inline">{translations.download[language]}</span>
          </Button>
        </div>
      </div>

      <div className="relative w-full h-[400px] overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full touch-manipulation" style={{ cursor: "grab" }} />
      </div>
    </div>
  )
}
