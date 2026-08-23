import { useRef, useState } from "react"

import type { PitchArrow, PitchElement, PitchPoint, PitchZone } from "@/types/pitch"

const VIEW_W = 100
const VIEW_H = 64

interface PitchCanvasProps {
  elements: PitchElement[]
  onChange: (elements: PitchElement[]) => void
  selectedId: string | null
  onSelect: (id: string | null) => void
  readOnly?: boolean
  svgRef?: React.RefObject<SVGSVGElement | null>
}

function toSvgPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
  const pt = svg.createSVGPoint()
  pt.x = clientX
  pt.y = clientY
  const ctm = svg.getScreenCTM()
  if (!ctm) return { x: 0, y: 0 }
  const transformed = pt.matrixTransform(ctm.inverse())
  return { x: transformed.x, y: transformed.y }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function PitchMarkings() {
  return (
    <g stroke="#ffffff" strokeWidth={0.4} fill="none" opacity={0.9}>
      <rect x={1} y={1} width={VIEW_W - 2} height={VIEW_H - 2} />
      <line x1={VIEW_W / 2} y1={1} x2={VIEW_W / 2} y2={VIEW_H - 1} />
      <circle cx={VIEW_W / 2} cy={VIEW_H / 2} r={7} />
      <circle cx={VIEW_W / 2} cy={VIEW_H / 2} r={0.5} fill="#ffffff" />
      <rect x={1} y={VIEW_H / 2 - 12} width={12} height={24} />
      <rect x={VIEW_W - 13} y={VIEW_H / 2 - 12} width={12} height={24} />
      <rect x={1} y={VIEW_H / 2 - 5} width={4} height={10} />
      <rect x={VIEW_W - 5} y={VIEW_H / 2 - 5} width={4} height={10} />
    </g>
  )
}

function PointShape({ el }: { el: PitchPoint }) {
  switch (el.type) {
    case "player":
      return (
        <g>
          <circle r={2.4} fill={el.color || "#9d59ef"} stroke="#ffffff" strokeWidth={0.3} />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={2.2}
            fontWeight={700}
            fill="#ffffff"
          >
            {el.label || "X"}
          </text>
        </g>
      )
    case "text":
      return (
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={3}
          fontWeight={700}
          fill={el.color || "#ffffff"}
          stroke="#0a0a0a"
          strokeWidth={0.15}
          paintOrder="stroke"
        >
          {el.label || "Texto"}
        </text>
      )
    case "cone":
      return <path d="M 0,-2.2 L 1.8,1.8 L -1.8,1.8 Z" fill="#f97316" />
    case "goal":
      return (
        <path
          d="M -2.5,-1.4 L -2.5,1.4 M -2.5,-1.4 L 2.5,-1.4 M -2.5,1.4 L 2.5,1.4 M 2.5,-1.4 L 2.5,1.4"
          stroke="#ffffff"
          strokeWidth={0.5}
          fill="none"
        />
      )
    case "ball":
      return (
        <g>
          <circle r={1.6} fill="#ffffff" stroke="#18161c" strokeWidth={0.25} />
          <path
            d="M 0,-0.9 L 0.7,-0.3 L 0.4,0.7 L -0.4,0.7 L -0.7,-0.3 Z"
            fill="#18161c"
          />
        </g>
      )
    case "pole":
      return <rect x={-0.35} y={-2} width={0.7} height={4} rx={0.35} fill="#eab308" />
    case "hoop":
      return (
        <circle r={1.6} fill="none" stroke="#eab308" strokeWidth={0.6} />
      )
    default:
      return null
  }
}

export function PitchCanvas({
  elements,
  onChange,
  selectedId,
  onSelect,
  readOnly,
  svgRef,
}: PitchCanvasProps) {
  const internalRef = useRef<SVGSVGElement | null>(null)
  const setRefs = (node: SVGSVGElement | null) => {
    internalRef.current = node
    if (svgRef) svgRef.current = node
  }
  const [drag, setDrag] = useState<{
    id: string
    handle?: "start" | "end"
    dx: number
    dy: number
  } | null>(null)

  const updateElement = (id: string, updates: Partial<PitchElement>) => {
    onChange(
      elements.map((el) => (el.id === id ? ({ ...el, ...updates } as PitchElement) : el))
    )
  }

  const handlePointerDown = (
    e: React.PointerEvent,
    el: PitchElement,
    handle?: "start" | "end"
  ) => {
    if (readOnly) return
    e.stopPropagation()
    const svg = internalRef.current
    if (!svg) return
    const p = toSvgPoint(svg, e.clientX, e.clientY)
    onSelect(el.id)
    if (el.type === "arrow" && handle) {
      const anchorX = handle === "start" ? el.x : el.x2
      const anchorY = handle === "start" ? el.y : el.y2
      setDrag({ id: el.id, handle, dx: p.x - anchorX, dy: p.y - anchorY })
    } else {
      setDrag({ id: el.id, dx: p.x - el.x, dy: p.y - el.y })
    }
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drag) return
    const svg = internalRef.current
    if (!svg) return
    const p = toSvgPoint(svg, e.clientX, e.clientY)
    const x = clamp(p.x - drag.dx, 0, VIEW_W)
    const y = clamp(p.y - drag.dy, 0, VIEW_H)

    const el = elements.find((item) => item.id === drag.id)
    if (!el) return

    if (el.type === "arrow" && drag.handle === "end") {
      updateElement(el.id, { x2: x, y2: y })
    } else if (el.type === "arrow") {
      updateElement(el.id, { x, y })
    } else if (el.type === "zone") {
      const zone = el as PitchZone
      updateElement(el.id, {
        x: clamp(x, 0, VIEW_W - zone.width),
        y: clamp(y, 0, VIEW_H - zone.height),
      })
    } else {
      updateElement(el.id, { x, y })
    }
  }

  const handlePointerUp = () => setDrag(null)

  return (
    <svg
      ref={setRefs}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="h-auto w-full touch-none rounded-md"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={() => onSelect(null)}
    >
      {/* Fondo real en SVG (no CSS) para que se exporte también en el PDF */}
      <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="#1e7d32" />
      <PitchMarkings />

      {elements.map((el) => {
        const isSelected = el.id === selectedId

        if (el.type === "zone") {
          const zone = el as PitchZone
          return (
            <rect
              key={el.id}
              x={zone.x}
              y={zone.y}
              width={zone.width}
              height={zone.height}
              fill={zone.color}
              fillOpacity={0.25}
              stroke={zone.color}
              strokeWidth={isSelected ? 0.6 : 0.35}
              onPointerDown={(e) => handlePointerDown(e, el)}
            />
          )
        }

        if (el.type === "arrow") {
          const arrow = el as PitchArrow
          return (
            <g key={el.id}>
              <line
                x1={arrow.x}
                y1={arrow.y}
                x2={arrow.x2}
                y2={arrow.y2}
                stroke="#ffffff"
                strokeWidth={isSelected ? 0.6 : 0.4}
                strokeDasharray={arrow.dashed ? "1.5,1" : undefined}
                markerEnd="url(#arrowhead)"
              />
              {!readOnly && (
                <>
                  <circle
                    cx={arrow.x}
                    cy={arrow.y}
                    r={1.6}
                    fill="transparent"
                    onPointerDown={(e) => handlePointerDown(e, el, "start")}
                  />
                  <circle
                    cx={arrow.x2}
                    cy={arrow.y2}
                    r={1.6}
                    fill="transparent"
                    onPointerDown={(e) => handlePointerDown(e, el, "end")}
                  />
                </>
              )}
            </g>
          )
        }

        const point = el as PitchPoint
        const scale = point.size ?? 1
        return (
          <g
            key={el.id}
            transform={`translate(${point.x}, ${point.y})`}
            onPointerDown={(e) => handlePointerDown(e, el)}
          >
            <g transform={`scale(${scale})`}>
              {isSelected && (
                <circle
                  r={3.2}
                  fill="none"
                  stroke="#ffffff"
                  strokeDasharray="0.6,0.6"
                  strokeWidth={0.3 / scale}
                />
              )}
              <PointShape el={point} />
            </g>
          </g>
        )
      })}

      <defs>
        <marker
          id="arrowhead"
          markerWidth="6"
          markerHeight="6"
          refX="4"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6 Z" fill="#ffffff" />
        </marker>
      </defs>
    </svg>
  )
}
