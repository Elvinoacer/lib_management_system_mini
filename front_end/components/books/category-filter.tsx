"use client"

import { cn } from "@/lib/utils"

const categories = [
  "All Categories",
  "Fiction",
  "Non-Fiction",
  "Business",
  "Technology",
  "Self-Help",
  "Biography",
  "Science",
  "History",
]

interface CategoryFilterProps {
  selected: string
  onSelect: (category: string) => void
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="mb-2 text-sm font-semibold text-foreground">Categories</h3>
      {categories.map((category) => (
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
      ))}
    </div>
  )
}
