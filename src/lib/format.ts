import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

export function formatDateLong(dateStr: string) {
  return format(parseISO(dateStr), "EEEE d 'de' MMMM", { locale: es })
}

export function formatDateShort(dateStr: string) {
  return format(parseISO(dateStr), "d MMM yyyy", { locale: es })
}

export function formatTime(time: string) {
  return time.slice(0, 5)
}

export function calculateAge(birthDateStr: string) {
  const birth = parseISO(birthDateStr)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}
