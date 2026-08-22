import { useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Download } from "lucide-react"
import { toast } from "sonner"

import {
  useSaveCanvasData,
  useTrainingExerciseQuery,
  useUpdateTrainingExercise,
} from "@/hooks/use-training-exercises"
import { useTrainingsQuery } from "@/hooks/use-trainings"
import { useTeam } from "@/contexts/team-context"
import { createPitchElement } from "@/lib/pitch-defaults"
import type { PitchElement, PitchElementType } from "@/types/pitch"
import { PitchCanvas } from "@/components/planificador/pitch-canvas"
import { PitchToolbar } from "@/components/planificador/pitch-toolbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"

export default function ExercisePage() {
  const { trainingId, exerciseId } = useParams<{
    trainingId: string
    exerciseId: string
  }>()
  const { selectedTeamId } = useTeam()
  const { data: exercise, isLoading } = useTrainingExerciseQuery(exerciseId)
  const { data: trainings } = useTrainingsQuery(selectedTeamId)
  const training = trainings?.find((t) => t.id === trainingId)
  const updateExercise = useUpdateTrainingExercise()
  const saveCanvas = useSaveCanvasData()
  const svgRef = useRef<SVGSVGElement | null>(null)

  const [titulo, setTitulo] = useState("")
  const [duracion, setDuracion] = useState("")
  const [objetivo, setObjetivo] = useState("")
  const [elements, setElements] = useState<PitchElement[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (!exercise) return
    setTitulo(exercise.titulo)
    setDuracion(exercise.duracion_minutos?.toString() ?? "")
    setObjetivo(exercise.objetivo ?? "")
    setElements(exercise.canvas_data.elements)
  }, [exercise])

  if (isLoading || !exercise) {
    return <Skeleton className="h-96" />
  }

  const handleAdd = (type: PitchElementType) => {
    const el = createPitchElement(type)
    setElements((prev) => [...prev, el])
    setSelectedId(el.id)
  }

  const handleDeleteSelected = () => {
    if (!selectedId) return
    setElements((prev) => prev.filter((el) => el.id !== selectedId))
    setSelectedId(null)
  }

  const handleSave = async () => {
    if (!trainingId || !exerciseId) return
    try {
      await updateExercise.mutateAsync({
        id: exerciseId,
        titulo,
        duracion_minutos: duracion ? Number(duracion) : null,
        objetivo: objetivo || null,
      })
      await saveCanvas.mutateAsync({
        id: exerciseId,
        trainingId,
        canvasData: { elements },
      })
      toast.success("Ejercicio guardado")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar")
    }
  }

  const handleExportPdf = async () => {
    if (!svgRef.current) return
    setIsExporting(true)
    try {
      const { exportExerciseToPdf } = await import("@/lib/export-pdf")
      await exportExerciseToPdf(svgRef.current, {
        equipo: training?.campo ? `Campo: ${training.campo}` : "",
        fecha: training?.fecha ?? "",
        titulo,
        duracion,
        objetivo,
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo generar el PDF")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link to={`/entrenamientos/${trainingId}`}>
            <ArrowLeft />
            Volver al entrenamiento
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
            disabled={isExporting}
          >
            <Download />
            {isExporting ? "Generando…" : "Descargar PDF"}
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={updateExercise.isPending || saveCanvas.isPending}
          >
            Guardar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="titulo">Título del ejercicio</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Rondo 4v1"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="duracion">Duración (minutos)</Label>
            <Input
              id="duracion"
              type="number"
              min={0}
              value={duracion}
              onChange={(e) => setDuracion(e.target.value)}
              placeholder="15"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="objetivo">Objetivo / notas</Label>
            <Textarea
              id="objetivo"
              rows={6}
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              placeholder="Qué se trabaja en este ejercicio…"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <PitchToolbar
            onAdd={handleAdd}
            onDeleteSelected={handleDeleteSelected}
            hasSelection={!!selectedId}
          />
          <PitchCanvas
            elements={elements}
            onChange={setElements}
            selectedId={selectedId}
            onSelect={setSelectedId}
            svgRef={svgRef}
          />
          <p className="text-xs text-muted-foreground">
            Toca un elemento de arriba para añadirlo, y arrástralo con el dedo
            para colocarlo en el campo. Toca un elemento del campo para
            seleccionarlo y poder eliminarlo.
          </p>
        </div>
      </div>
    </div>
  )
}
