"use client"

import { BookCard, type Book } from "./book-card"

// Mock data - in production this would come from the database
const featuredBooks: Book[] = [
  {
    id: "1",
    title: "The Art of Business Strategy",
    author: "James Kimani",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop",
    price: 1500,
    isFree: false,
    genres: ["Business", "Strategy"],
    rating: 4.8,
    reviewCount: 124,
  },
  {
    id: "2",
    title: "Modern Web Development",
    author: "Sarah Ochieng",
    coverUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=600&fit=crop",
    price: 2000,
    isFree: false,
    genres: ["Technology", "Programming"],
    rating: 4.9,
    reviewCount: 89,
  },
  {
    id: "3",
    title: "Mindful Leadership",
    author: "David Mwangi",
    coverUrl: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=400&h=600&fit=crop",
    price: 0,
    isFree: true,
    genres: ["Self-Help", "Leadership"],
    rating: 4.6,
    reviewCount: 203,
  },
  {
    id: "4",
    title: "African Tales & Legends",
    author: "Wanjiku Ngugi",
    coverUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop",
    price: 800,
    isFree: false,
    genres: ["Fiction", "Culture"],
    rating: 4.7,
    reviewCount: 156,
  },
  {
    id: "5",
    title: "Financial Freedom Guide",
    author: "Peter Kamau",
    coverUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=600&fit=crop",
    price: 1200,
    isFree: false,
    genres: ["Finance", "Self-Help"],
    rating: 4.5,
    reviewCount: 312,
  },
  {
    id: "6",
    title: "The Science of Innovation",
    author: "Grace Wambui",
    coverUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop",
    price: 1800,
    isFree: false,
    genres: ["Science", "Innovation"],
    rating: 4.4,
    reviewCount: 78,
  },
  {
    id: "7",
    title: "Introduction to AI",
    author: "Kevin Otieno",
    coverUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=600&fit=crop",
    price: 0,
    isFree: true,
    genres: ["Technology", "AI"],
    rating: 4.9,
    reviewCount: 445,
  },
  {
    id: "8",
    title: "East African History",
    author: "Joyce Akinyi",
    coverUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=600&fit=crop",
    price: 950,
    isFree: false,
    genres: ["History", "Education"],
    rating: 4.3,
    reviewCount: 67,
  },
]

interface FeaturedBooksProps {
  title?: string
  subtitle?: string
}

export function FeaturedBooks({
  title = "Featured Books",
  subtitle = "Discover our handpicked selection of the best digital books",
}: FeaturedBooksProps) {
  const handleAddToCart = (book: Book) => {
    console.log("Added to cart:", book.title)
  }

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h2>
          <p className="mt-2 text-muted-foreground">{subtitle}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredBooks.map((book) => (
            <BookCard key={book.id} book={book} onAddToCart={handleAddToCart} />
          ))}
        </div>
      </div>
    </section>
  )
}
