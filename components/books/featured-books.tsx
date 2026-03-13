"use client"

import { useQuery } from "@tanstack/react-query"
import { BookCard, type Book } from "./book-card"
import { Loader2 } from "lucide-react"
import { useCart } from "@/lib/store/cart"
import { toast } from "sonner"

interface FeaturedBooksProps {
  title?: string
  subtitle?: string
}

export function FeaturedBooks({
  title = "Featured Books",
  subtitle = "Discover our handpicked selection of the best digital books",
}: FeaturedBooksProps) {
  const { addItem } = useCart()
  
  const { data: featuredBooks = [], isLoading, isError } = useQuery<Book[]>({
    queryKey: ['featured-books'],
    queryFn: async () => {
      // Assuming a generic fetch, potentially adding ?limit=8 in the future
      const res = await fetch('/api/books')
      if (!res.ok) throw new Error("Failed to fetch books")
      return res.json()
    }
  })

  // We limit to 8 client-side to keep the homepage layout pristine
  const displayBooks = featuredBooks.slice(0, 8)

  const handleAddToCart = (book: Book) => {
    addItem({
      id: book.id,
      title: book.title,
      author: book.author,
      price: book.price || 0,
      coverUrl: book.coverUrl,
    })
    toast.success(`${book.title} added to cart`)
  }

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h2>
          <p className="mt-2 text-muted-foreground">{subtitle}</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-destructive">
            Failed to load featured books.
          </div>
        ) : displayBooks.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {displayBooks.map((book) => (
              <BookCard key={book.id} book={book} onAddToCart={handleAddToCart} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No featured books available at the moment.
          </div>
        )}
      </div>
    </section>
  )
}
