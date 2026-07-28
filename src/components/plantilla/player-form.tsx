import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import {
  playerFormDefaults,
  playerFormToPayload,
  playerSchema,
  type PlayerFormValues,
} from "@/lib/schemas/player-schema"
import type { Player } from "@/types/database"
import { dominantLegLabels, playerStatusLabels, positionOptions } from "@/lib/labels"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type PlayerPayload = Partial<Player> & Pick<Player, "nombre" | "estado">

interface PlayerFormProps {
  defaultValues?: Partial<PlayerFormValues>
  onSubmit: (values: PlayerPayload) => Promise<void> | void
  submitLabel: string
  isSubmitting?: boolean
}

export function PlayerForm({
  defaultValues,
  onSubmit,
  submitLabel,
  isSubmitting,
}: PlayerFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PlayerFormValues>({
    resolver: zodResolver(playerSchema),
    defaultValues: { ...playerFormDefaults, ...defaultValues },
  })

  const estado = watch("estado")
  const posicion = watch("posicion")
  const piernaDominante = watch("pierna_dominante")

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit((values) => onSubmit(playerFormToPayload(values)))}
    >
      <Tabs defaultValue="datos">
        <TabsList className="w-full">
          <TabsTrigger value="datos" className="flex-1">
            Datos
          </TabsTrigger>
          <TabsTrigger value="contacto" className="flex-1">
            Contacto y tutor
          </TabsTrigger>
          <TabsTrigger value="salud" className="flex-1">
            Salud
          </TabsTrigger>
        </TabsList>

        <TabsContent value="datos" className="flex flex-col gap-4 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" {...register("nombre")} />
              {errors.nombre && (
                <p className="text-xs text-destructive">{errors.nombre.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="apellidos">Apellidos</Label>
              <Input id="apellidos" {...register("apellidos")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dorsal">Dorsal</Label>
              <Input id="dorsal" type="number" min={0} max={99} {...register("dorsal")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fecha_nacimiento">Fecha de nacimiento</Label>
              <Input
                id="fecha_nacimiento"
                type="date"
                {...register("fecha_nacimiento")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Posición</Label>
              <Select
                value={posicion || undefined}
                onValueChange={(v) => setValue("posicion", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona posición" />
                </SelectTrigger>
                <SelectContent>
                  {positionOptions.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Pierna dominante</Label>
              <Select
                value={piernaDominante || undefined}
                onValueChange={(v) => setValue("pierna_dominante", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(dominantLegLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Estado</Label>
            <Select
              value={estado}
              onValueChange={(v) => setValue("estado", v as PlayerFormValues["estado"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(playerStatusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="foto_url">URL de la foto</Label>
            <Input
              id="foto_url"
              placeholder="https://…"
              {...register("foto_url")}
            />
          </div>
        </TabsContent>

        <TabsContent value="contacto" className="flex flex-col gap-4 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" {...register("telefono")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="direccion">Dirección</Label>
            <Input id="direccion" {...register("direccion")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tutor_legal">Tutor legal</Label>
              <Input id="tutor_legal" {...register("tutor_legal")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="telefono_tutor">Teléfono del tutor</Label>
              <Input id="telefono_tutor" {...register("telefono_tutor")} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea id="observaciones" rows={3} {...register("observaciones")} />
          </div>
        </TabsContent>

        <TabsContent value="salud" className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lesion_actual">Lesión actual</Label>
            <Textarea id="lesion_actual" rows={2} {...register("lesion_actual")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="historial_medico">Historial médico</Label>
            <Textarea id="historial_medico" rows={3} {...register("historial_medico")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="alergias">Alergias</Label>
            <Textarea id="alergias" rows={2} {...register("alergias")} />
          </div>
        </TabsContent>
      </Tabs>

      <Button type="submit" disabled={isSubmitting} className="mt-1">
        {isSubmitting ? "Guardando…" : submitLabel}
      </Button>
    </form>
  )
}
