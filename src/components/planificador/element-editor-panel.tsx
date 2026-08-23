import {
  MAX_ELEMENT_SIZE,
  MIN_ELEMENT_SIZE,
  zoneColors,
  type PitchElement,
} from "@/types/pitch"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ElementEditorPanelProps {
  element: PitchElement | undefined
  onUpdate: (updates: Partial<PitchElement>) => void
}

function ColorSwatches({
  value,
  onChange,
}: {
  value: string | undefined
  onChange: (color: string) => void
}) {
  return (
    <div className="flex gap-1.5">
      {zoneColors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={cn(
            "size-6 rounded-full border-2",
            value === color ? "border-foreground" : "border-transparent"
          )}
          style={{ backgroundColor: color }}
          aria-label={color}
        />
      ))}
    </div>
  )
}

export function ElementEditorPanel({ element, onUpdate }: ElementEditorPanelProps) {
  if (!element) return null

  const hasLabel = element.type === "player" || element.type === "text"
  const hasColor = element.type === "player" || element.type === "text" || element.type === "zone"
  const hasSize = element.type !== "zone" && element.type !== "arrow"
  const isZone = element.type === "zone"

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        {hasLabel && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="element-label">Texto</Label>
            <Input
              id="element-label"
              value={"label" in element ? element.label ?? "" : ""}
              onChange={(e) => onUpdate({ label: e.target.value })}
              placeholder={element.type === "player" ? "Nombre o dorsal" : "Escribe aquí"}
            />
          </div>
        )}

        {hasColor && (
          <div className="flex flex-col gap-1.5">
            <Label>Color</Label>
            <ColorSwatches
              value={"color" in element ? element.color : undefined}
              onChange={(color) => onUpdate({ color })}
            />
          </div>
        )}

        {hasSize && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="element-size">Tamaño</Label>
            <input
              id="element-size"
              type="range"
              min={MIN_ELEMENT_SIZE}
              max={MAX_ELEMENT_SIZE}
              step={0.1}
              value={"size" in element ? element.size ?? 1 : 1}
              onChange={(e) => onUpdate({ size: Number(e.target.value) })}
              className="accent-brand"
            />
          </div>
        )}

        {isZone && (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="zone-width">Ancho</Label>
              <Input
                id="zone-width"
                type="number"
                min={4}
                max={98}
                value={element.width}
                onChange={(e) => onUpdate({ width: Number(e.target.value) })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="zone-height">Alto</Label>
              <Input
                id="zone-height"
                type="number"
                min={4}
                max={62}
                value={element.height}
                onChange={(e) => onUpdate({ height: Number(e.target.value) })}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
