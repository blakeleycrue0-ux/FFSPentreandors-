import {
  DEFAULT_ELEMENT_SIZE,
  zoneColors,
  type PitchElement,
  type PitchElementType,
} from "@/types/pitch"

export function createPitchElement(type: PitchElementType): PitchElement {
  const id = crypto.randomUUID()
  const centerX = 50
  const centerY = 32

  switch (type) {
    case "zone":
      return {
        id,
        type: "zone",
        x: centerX - 10,
        y: centerY - 8,
        width: 20,
        height: 16,
        color: zoneColors[0],
      }
    case "arrow":
      return {
        id,
        type: "arrow",
        x: centerX - 8,
        y: centerY,
        x2: centerX + 8,
        y2: centerY,
      }
    case "player":
      return {
        id,
        type,
        x: centerX,
        y: centerY,
        label: "X",
        size: DEFAULT_ELEMENT_SIZE,
      }
    case "text":
      return {
        id,
        type,
        x: centerX,
        y: centerY,
        label: "Texto",
        color: "#ffffff",
        size: DEFAULT_ELEMENT_SIZE,
      }
    default:
      return { id, type, x: centerX, y: centerY, size: DEFAULT_ELEMENT_SIZE }
  }
}
