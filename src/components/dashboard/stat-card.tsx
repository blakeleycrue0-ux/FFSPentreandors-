import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  accent?: "default" | "brand" | "warning" | "destructive" | "success"
  sublabel?: string
}

const accentClasses: Record<NonNullable<StatCardProps["accent"]>, string> = {
  default: "bg-muted text-foreground",
  brand: "bg-brand/10 text-brand",
  warning: "bg-warning/15 text-warning-foreground",
  destructive: "bg-destructive/10 text-destructive",
  success: "bg-success/15 text-success-foreground",
}

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "default",
  sublabel,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            accentClasses[accent]
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          {sublabel && (
            <p className="truncate text-xs text-muted-foreground/80">{sublabel}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
