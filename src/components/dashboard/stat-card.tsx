import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
  label: string
  value: string | number
  accent?: "default" | "brand" | "warning" | "destructive" | "success"
  sublabel?: string
}

const accentClasses: Record<NonNullable<StatCardProps["accent"]>, string> = {
  default: "text-foreground",
  brand: "text-brand",
  warning: "text-warning-foreground",
  destructive: "text-destructive",
  success: "text-success-foreground",
}

export function StatCard({
  label,
  value,
  accent = "default",
  sublabel,
}: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <p
          className={cn(
            "font-heading text-3xl tabular-nums",
            accentClasses[accent]
          )}
        >
          {value}
        </p>
        <p className="truncate text-sm text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        {sublabel && (
          <p className="truncate text-xs text-muted-foreground/80">{sublabel}</p>
        )}
      </CardContent>
    </Card>
  )
}
