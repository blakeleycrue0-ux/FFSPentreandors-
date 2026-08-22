export type PitchElementType =
  | "player"
  | "cone"
  | "goal"
  | "ball"
  | "pole"
  | "hoop"
  | "zone"
  | "arrow"

export type PitchPoint = {
  id: string
  type: Exclude<PitchElementType, "zone" | "arrow">
  x: number
  y: number
  label?: string
  color?: string
}

export type PitchZone = {
  id: string
  type: "zone"
  x: number
  y: number
  width: number
  height: number
  color: string
}

export type PitchArrow = {
  id: string
  type: "arrow"
  x: number
  y: number
  x2: number
  y2: number
  dashed?: boolean
}

export type PitchElement = PitchPoint | PitchZone | PitchArrow

export type CanvasData = {
  elements: PitchElement[]
}

export const emptyCanvasData: CanvasData = { elements: [] }

export const pitchElementLabels: Record<PitchElementType, string> = {
  player: "Jugadora",
  cone: "Cono",
  goal: "Portería",
  ball: "Balón",
  pole: "Palo",
  hoop: "Aro",
  zone: "Zona",
  arrow: "Flecha",
}

export const zoneColors = ["#9d59ef", "#22c55e", "#f59e0b", "#3b82f6", "#ef4444"]
