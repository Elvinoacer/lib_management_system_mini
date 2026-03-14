"use client"

import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

interface CategoryFilterProps {
  selected: string
  onSelect: (category: string) => void
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories")
      if (!res.ok) throw new Error("Failed to fetch categories")
      const data = await res.json()
      return ["All Categories", ...data.map((c: any) => c.name)]
    }
  })

  return (
    <div className="flex flex-col gap-1">
      <h3 className="mb-2 text-sm font-semibold text-foreground">Categories</h3>
      {isLoading ? (
        <div className="flex items-center gap-2 py-4 px-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      ) : (
        categories.map((category: string) => (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={cn(
              "rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
              selected === category
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {category}
          </button>
        ))
      )}
    </div>
  )
}
