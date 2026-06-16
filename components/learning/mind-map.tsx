"use client"

import { useState, useRef, useEffect } from "react"
import { Download, ZoomIn, ZoomOut, Move } from "lucide-react"
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
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

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
    panTip: {
      en: "Drag to pan, click zoom buttons to scale",
      hi: "पैन करने के लिए खींचें, स्केल करने के लिए ज़ूम बटन पर क्लिक करें",
      te: "ప్యాన్ చేయడానికి లాగండి, స్కేల్ చేయడానికి జూమ్ బటన్లను క్లిక్ చేయండి",
    }
  }

  // Draw the canvas with high resolution, pan, zoom, dark mode, and word wrap
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const draw = () => {
      // Adjust canvas resolution for high-DPI screens
      const dpr = window.devicePixelRatio || 1
      const rect = container.getBoundingClientRect()
      const width = rect.width || 800
      const height = rect.height || 400

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      ctx.save()
      ctx.scale(dpr, dpr)

      // Detect dark mode theme
      const isDark = document.documentElement.classList.contains("dark")
      
      // Draw background
      ctx.fillStyle = isDark ? "#0f172a" : "#ffffff"
      ctx.fillRect(0, 0, width, height)

      // Apply transformations
      ctx.save()
      // Translate to center + pan offset
      const centerX = width / 2 + pan.x
      const centerY = height / 2 + pan.y
      ctx.translate(centerX, centerY)
      ctx.scale(zoom, zoom)

      // Draw the mind map starting from the root node (0, 0)
      drawNode(ctx, data, 0, 0, 0, 2 * Math.PI, isDark)

      ctx.restore()
      ctx.restore()
    }

    // Draw node and its children recursively
    function drawNode(
      ctx: CanvasRenderingContext2D,
      node: MindMapNode,
      x: number,
      y: number,
      startAngle: number,
      endAngle: number,
      isDark: boolean
    ) {
      // Draw connection lines to children first
      if (node.children && node.children.length > 0) {
        const angleStep = (endAngle - startAngle) / node.children.length
        const radius = 135 // Distance from parent to child

        node.children.forEach((child, index) => {
          const childAngle = startAngle + angleStep * index + angleStep / 2
          const childX = x + radius * Math.cos(childAngle)
          const childY = y + radius * Math.sin(childAngle)

          // Draw connection line
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(childX, childY)
          ctx.strokeStyle = child.color || (isDark ? "#38bdf8" : "#0284c7")
          ctx.lineWidth = 2.5
          ctx.stroke()

          // Draw child node
          const childStartAngle = childAngle - Math.PI / 3.5
          const childEndAngle = childAngle + Math.PI / 3.5
          drawNode(ctx, child, childX, childY, childStartAngle, childEndAngle, isDark)
        })
      }

      // Draw node bubble
      ctx.beginPath()
      ctx.arc(x, y, 42, 0, 2 * Math.PI)
      ctx.fillStyle = node.color || (isDark ? "#1e3a8a" : "#3b82f6")
      ctx.fill()
      ctx.strokeStyle = isDark ? "#38bdf8" : "#ffffff"
      ctx.lineWidth = 2.5
      ctx.stroke()

      // Draw node label with word wrap
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 11px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      wrapText(ctx, node.label, x, y, 72, 13)
    }

    // Word wrap text helper inside circular bubble
    function wrapText(
      ctx: CanvasRenderingContext2D,
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      lineHeight: number
    ) {
      const words = text.split(' ')
      let line = ''
      const lines = []

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' '
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width
        if (testWidth > maxWidth && n > 0) {
          lines.push(line)
          line = words[n] + ' '
        } else {
          line = testLine
        }
      }
      lines.push(line)

      const startY = y - ((lines.length - 1) * lineHeight) / 2
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i].trim(), x, startY + i * lineHeight)
      }
    }

    draw()

    // Listen to container resizing
    const observer = new ResizeObserver(() => {
      draw()
    })
    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [data, zoom, pan])

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch pan handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y })
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.15, 2.5))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.15, 0.4))
  }

  const handleReset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
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
    <div className="w-full bg-white dark:bg-card rounded-xl border border-border dark:border-border shadow-md overflow-hidden flex flex-col">
      <div className="bg-primary/5 dark:bg-primary/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border dark:border-border">
        <div>
          <h3 className="font-bold text-foreground">{title}</h3>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <Move size={10} />
            {translations.panTip[language]}
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            className="h-8 px-2"
          >
            <ZoomOut size={14} className="mr-1" />
            <span className="hidden sm:inline">{translations.zoomOut[language]}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            className="h-8 px-2"
          >
            <ZoomIn size={14} className="mr-1" />
            <span className="hidden sm:inline">{translations.zoomIn[language]}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-8 px-2 text-xs"
          >
            Reset
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="h-8 px-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
          >
            <Download size={14} className="mr-1" />
            <span className="hidden sm:inline">{translations.download[language]}</span>
          </Button>
        </div>
      </div>

      <div ref={containerRef} className="relative w-full h-[420px] overflow-hidden bg-white dark:bg-slate-900 select-none">
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none"
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>
    </div>
  )
}
