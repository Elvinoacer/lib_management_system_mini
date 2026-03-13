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
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      {/* Cover Image */}
      <Link href={`/books/${book.id}`} className="relative aspect-[3/4] overflow-hidden bg-secondary">
        <Image
          src={book.coverUrl}
          alt={book.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {book.isFree && (
          <Badge className="absolute left-2 top-2 bg-primary text-primary-foreground">
            Free
          </Badge>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap gap-1">
          {book.genres.slice(0, 2).map((genre) => (
            <Badge key={genre} variant="secondary" className="text-xs">
              {genre}
            </Badge>
          ))}
        </div>

        <Link href={`/books/${book.id}`}>
          <h3 className="line-clamp-2 font-semibold text-card-foreground transition-colors group-hover:text-primary">
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
