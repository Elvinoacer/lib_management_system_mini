"use client"

import { useState, use } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  BookOpen,
  Download,
  ArrowLeft,
  Check,
} from "lucide-react"
import { FeaturedBooks } from "@/components/books/featured-books"

// Mock book data - in production this would come from the database
const bookData = {
  id: "1",
  title: "The Art of Business Strategy",
  author: "James Kimani",
  coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=1200&fit=crop",
  price: 1500,
  isFree: false,
  genres: ["Business", "Strategy", "Leadership"],
  rating: 4.8,
  reviewCount: 124,
  description: `Master the art of strategic thinking and business planning with this comprehensive guide. Written by renowned business consultant James Kimani, this book provides actionable insights and real-world case studies from successful East African businesses.

Learn how to analyze market opportunities, develop competitive advantages, and execute strategies that drive sustainable growth. Whether you're a startup founder, corporate executive, or aspiring entrepreneur, this book will transform how you approach business challenges.

Key topics covered include market analysis, competitive positioning, strategic planning frameworks, execution excellence, and measuring success. Each chapter includes practical exercises and templates you can apply immediately to your business.`,
  publishedYear: 2024,
  pageCount: 342,
  language: "English",
  isbn: "978-9966-000-001",
  fileFormat: "PDF, EPUB",
}

const reviews = [
  {
    id: "1",
    userName: "Mary Wangari",
    rating: 5,
    date: "February 15, 2024",
    comment:
      "Excellent book! The frameworks presented are practical and easy to apply. Highly recommend for anyone in business.",
  },
  {
    id: "2",
    userName: "John Odhiambo",
    rating: 4,
    date: "February 10, 2024",
    comment:
      "Great insights into strategic thinking. The East African case studies make it very relatable. Would have liked more on digital strategy.",
  },
  {
    id: "3",
    userName: "Alice Njeri",
    rating: 5,
    date: "January 28, 2024",
    comment:
      "This book changed how I approach business planning. The chapter on competitive analysis is worth the price alone.",
  },
]

export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [isWishlisted, setIsWishlisted] = useState(false)

  // In production, fetch book data based on ID
  const book = bookData

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/books"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Books
            </Link>
          </div>
        </div>

        {/* Book Details */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Cover Image */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-secondary lg:sticky lg:top-24 lg:self-start">
              <Image
                src={book.coverUrl}
                alt={book.title}
                fill
                className="object-cover"
                priority
              />
              {book.isFree && (
                <Badge className="absolute left-4 top-4 bg-primary text-primary-foreground">
                  Free
                </Badge>
              )}
            </div>

            {/* Book Info */}
            <div className="flex flex-col gap-6">
              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {book.genres.map((genre) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>

              {/* Title and Author */}
              <div>
                <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
                  {book.title}
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">by {book.author}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.floor(book.rating)
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium text-foreground">{book.rating}</span>
                <span className="text-muted-foreground">
                  ({book.reviewCount} reviews)
                </span>
              </div>

              {/* Price and Actions */}
              <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">
                    {book.isFree ? "Free" : `KES ${book.price.toLocaleString()}`}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <Button size="lg" className="gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1 gap-2"
                      onClick={() => setIsWishlisted(!isWishlisted)}
                    >
                      <Heart
                        className={`h-5 w-5 ${isWishlisted ? "fill-primary text-primary" : ""}`}
                      />
                      {isWishlisted ? "Wishlisted" : "Wishlist"}
                    </Button>
                    <Button variant="outline" size="lg" className="flex-1 gap-2">
                      <Share2 className="h-5 w-5" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* Purchase benefits */}
                <div className="mt-2 flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    Instant download after purchase
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    Available in PDF & EPUB formats
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    Lifetime access
                  </div>
                </div>
              </div>

              {/* Book Details Grid */}
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-card p-6 sm:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Pages</p>
                  <p className="font-medium text-foreground">{book.pageCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="font-medium text-foreground">{book.publishedYear}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Language</p>
                  <p className="font-medium text-foreground">{book.language}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Format</p>
                  <p className="font-medium text-foreground">{book.fileFormat}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                  About this book
                </h2>
                <div className="prose prose-invert max-w-none">
                  {book.description.split("\n\n").map((paragraph, index) => (
                    <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Reviews Section */}
              <div>
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                  Reviews ({reviews.length})
                </h2>
                <div className="flex flex-col gap-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-lg border border-border bg-card p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">{review.userName}</p>
                          <p className="text-sm text-muted-foreground">{review.date}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? "fill-primary text-primary"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-3 text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Books */}
        <FeaturedBooks
          title="You might also like"
          subtitle="Based on this book's categories"
        />
      </main>
      <Footer />
    </div>
  )
}
