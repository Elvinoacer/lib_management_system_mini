"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export interface Book {
  id: string
  title: string
  author: string
  coverUrl: string
  price: number
  isFree: boolean
  genres: string[]
  rating?: number
  reviewCount?: number
}

interface BookCardProps {
  book: Book
  onAddToCart?: (book: Book) => void
}

export function BookCard({ book, onAddToCart }: BookCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
      {/* Cover Image */}
      <Link href={`/books/${book.id}`} className="relative h-56 w-full overflow-hidden bg-secondary sm:h-64">
        <Image
          src={book.coverUrl}
          alt={book.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {book.isFree && (
          <Badge className="absolute left-3 top-3 bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground shadow-sm">
            Free
          </Badge>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap gap-1.5">
          {book.genres.slice(0, 2).map((genre) => (
            <Badge key={genre} variant="secondary" className="bg-secondary/50 text-[10px] sm:text-xs">
              {genre}
            </Badge>
          ))}
        </div>

        <Link href={`/books/${book.id}`}>
          <h3 className="line-clamp-2 text-base font-bold leading-tight text-foreground transition-colors group-hover:text-primary sm:text-lg">
            {book.title}
          </h3>
        </Link>

        <p className="text-sm text-muted-foreground">{book.author}</p>

        {book.rating && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm font-medium text-foreground">{book.rating.toFixed(1)}</span>
            {book.reviewCount && (
              <span className="text-sm text-muted-foreground">({book.reviewCount})</span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-foreground">
            {book.isFree ? "Free" : `KES ${book.price.toLocaleString()}`}
          </span>
          <Button
            size="sm"
            onClick={() => onAddToCart?.(book)}
            className="gap-1"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
