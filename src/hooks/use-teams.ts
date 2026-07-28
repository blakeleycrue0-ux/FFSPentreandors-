import { useQuery } from "@tanstack/react-query"

import { supabase } from "@/lib/supabase"

export function useTeamsQuery() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("orden", { ascending: true })
      if (error) throw error
      return data
    },
  })
}
