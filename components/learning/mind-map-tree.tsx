"use client"
import { useState } from "react"

interface Node {
  id: string
  label: string
  children?: Node[]
}

function MindMapNode({ node, depth = 0 }: { node: Node; depth?: number }) {
  const [open, setOpen] = useState(true)
  const hasChildren = node.children && node.children.length > 0

  const depthColors = [
    "bg-indigo-600 text-white shadow-md",
    "bg-indigo-100 text-indigo-800 border border-indigo-300",
    "bg-slate-100 text-slate-700 border border-slate-200",
    "bg-white text-slate-600 border border-slate-200",
  ]
  const colorClass = depthColors[Math.min(depth, depthColors.length - 1)]
  const fontClass =
    depth === 0
      ? "font-bold text-base"
      : depth === 1
      ? "font-semibold text-sm"
      : "font-medium text-sm"

  return (
    <li className="relative">
      <div className="flex items-center gap-2 mb-1">
        {hasChildren && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex-shrink-0 w-5 h-5 rounded-full border border-indigo-300 text-indigo-500 text-xs flex items-center justify-center hover:bg-indigo-50 transition"
          >
            {open ? "−" : "+"}
          </button>
        )}
        {!hasChildren && <span className="w-5 flex-shrink-0" />}
        <span
          className={`inline-block px-3 py-1 rounded-full ${colorClass} ${fontClass} transition-all`}
        >
          {node.label}
        </span>
      </div>
      {hasChildren && open && (
        <ul className="ml-7 border-l-2 border-indigo-100 pl-4 space-y-1 mt-1 mb-2">
          {node.children!.map((child) => (
            <MindMapNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  )
}

export default function MindMapTree({ node }: { node: Node }) {
  if (!node) return null
  return (
    <div className="overflow-auto">
      <ul className="space-y-1">
        <MindMapNode node={node} depth={0} />
      </ul>
    </div>
  )
}