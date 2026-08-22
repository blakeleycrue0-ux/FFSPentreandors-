import { pitchElementLabels, type PitchElementType } from "@/types/pitch"
import { Button } from "@/components/ui/button"

const order: PitchElementType[] = [
  "player",
  "cone",
  "goal",
  "ball",
  "pole",
  "hoop",
  "zone",
  "arrow",
]

interface PitchToolbarProps {
  onAdd: (type: PitchElementType) => void
  onDeleteSelected: () => void
  hasSelection: boolean
}

export function PitchToolbar({ onAdd, onDeleteSelected, hasSelection }: PitchToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {order.map((type) => (
        <Button
          key={type}
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onAdd(type)}
        >
          {pitchElementLabels[type]}
        </Button>
      ))}
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={!hasSelection}
        onClick={onDeleteSelected}
        className="ml-auto"
      >
        Eliminar seleccionado
      </Button>
    </div>
  )
}
