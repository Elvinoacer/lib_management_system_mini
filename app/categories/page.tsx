"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { BookMarked, Cpu, Globe, HeartPulse, Lightbulb, Palette, TrendingUp, Users, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

const ICON_MAP: Record<string, any> = {
  "Business": <TrendingUp className="h-8 w-8 text-primary" />,
  "Technology": <Cpu className="h-8 w-8 text-primary" />,
  "Science": <Globe className="h-8 w-8 text-primary" />,
  "Health & Wellness": <HeartPulse className="h-8 w-8 text-primary" />,
  "Self-Help": <Lightbulb className="h-8 w-8 text-primary" />,
  "Fiction": <BookMarked className="h-8 w-8 text-primary" />,
  "Arts & Photography": <Palette className="h-8 w-8 text-primary" />,
  "Biographies": <Users className="h-8 w-8 text-primary" />,
}

export default function CategoriesPage() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error("Failed to fetch categories")
      return res.json()
    }
  })
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Browse Categories</h1>
            <p className="mt-2 text-muted-foreground text-lg">
              Explore our extensive collection of books by genre and topic.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {isLoading ? (
              <div className="col-span-full py-12 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : categories?.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                No categories found.
              </div>
            ) : (
              categories?.map((category: any) => (
                <Link key={category.slug} href={`/books?genre=${category.slug}`} className="group block">
                  <div className="flex h-full flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center shadow-sm transition-all hover:shadow-md hover:border-primary/50">
                    <div className="mb-4 rounded-full bg-primary/10 p-4 transition-transform group-hover:scale-110">
                      {ICON_MAP[category.name] || <BookMarked className="h-8 w-8 text-primary" />}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{category.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {category.count} {category.count === 1 ? 'book' : 'books'}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="mt-12 text-center">
            <Link href="/books" className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              View All Books
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
