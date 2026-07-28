import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

function initials(nombre: string, apellidos: string) {
  return `${nombre[0] ?? ""}${apellidos[0] ?? ""}`.toUpperCase()
}

export function PlayerAvatar({
  nombre,
  apellidos,
  fotoUrl,
  className,
}: {
  nombre: string
  apellidos: string
  fotoUrl?: string | null
  className?: string
}) {
  return (
    <Avatar className={cn("size-12", className)}>
      <AvatarImage src={fotoUrl ?? undefined} alt={`${nombre} ${apellidos}`} />
      <AvatarFallback className="text-sm">
        {initials(nombre, apellidos)}
      </AvatarFallback>
    </Avatar>
  )
}
