"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SearchBar } from "@/components/books/search-bar"
import { CategoryFilter } from "@/components/books/category-filter"
import { BookCard, type Book } from "@/components/books/book-card"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal, Grid3X3, List } from "lucide-react"

// Mock data - in production this would come from the database
const allBooks: Book[] = [
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
  {
    id: "9",
    title: "Poetry of the Savanna",
    author: "Amina Hassan",
    coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
    price: 600,
    isFree: false,
    genres: ["Fiction", "Poetry"],
    rating: 4.6,
    reviewCount: 92,
  },
  {
    id: "10",
    title: "Data Science Essentials",
    author: "Mark Njoroge",
    coverUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=600&fit=crop",
    price: 2500,
    isFree: false,
    genres: ["Technology", "Data Science"],
    rating: 4.8,
    reviewCount: 178,
  },
  {
    id: "11",
    title: "Startup Playbook",
    author: "Lucy Wanjiru",
    coverUrl: "https://images.unsplash.com/photo-1553484771-371a605b060b?w=400&h=600&fit=crop",
    price: 1400,
    isFree: false,
    genres: ["Business", "Entrepreneurship"],
    rating: 4.7,
    reviewCount: 234,
  },
  {
    id: "12",
    title: "The Mind's Garden",
    author: "Samuel Kiprop",
    coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    price: 0,
    isFree: true,
    genres: ["Self-Help", "Psychology"],
    rating: 4.5,
    reviewCount: 567,
  },
]

export default function BooksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [showFilters, setShowFilters] = useState(false)

  const filteredBooks = allBooks.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === "All Categories" ||
      book.genres.some((g) => g.toLowerCase() === selectedCategory.toLowerCase())
    return matchesSearch && matchesCategory
  })

  const handleAddToCart = (book: Book) => {
    console.log("Added to cart:", book.title)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="border-b border-border bg-card py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-foreground">Browse Books</h1>
            <p className="mt-2 text-muted-foreground">
              Discover your next great read from our collection
            </p>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search books, authors..."
              />
              <Button
                variant="outline"
                className="gap-2 sm:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden w-56 shrink-0 lg:block">
              <CategoryFilter
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />
            </aside>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="fixed inset-0 z-50 bg-background p-4 lg:hidden">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <Button variant="ghost" onClick={() => setShowFilters(false)}>
                    Close
                  </Button>
                </div>
                <div className="mt-6">
                  <CategoryFilter
                    selected={selectedCategory}
                    onSelect={(cat) => {
                      setSelectedCategory(cat)
                      setShowFilters(false)
                    }}
                  />
                </div>
              </div>
            )}

            {/* Books Grid */}
            <div className="flex-1">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredBooks.length} books
                </p>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-primary">
                    <Grid3X3 className="h-4 w-4" />
                    <span className="sr-only">Grid view</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <List className="h-4 w-4" />
                    <span className="sr-only">List view</span>
                  </Button>
                </div>
              </div>

              {filteredBooks.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredBooks.map((book) => (
                    <BookCard key={book.id} book={book} onAddToCart={handleAddToCart} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-lg font-medium text-foreground">No books found</p>
                  <p className="mt-2 text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
