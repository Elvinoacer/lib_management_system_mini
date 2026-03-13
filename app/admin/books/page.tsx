"use client"

import { useState } from "react"
import Image from "next/image"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react"

interface Book {
  id: string
  title: string
  author: string
  coverUrl: string
  price: number
  isFree: boolean
  genres: string[]
  status: "published" | "draft"
  sales: number
}

// Mock data
const books: Book[] = [
  {
    id: "1",
    title: "The Art of Business Strategy",
    author: "James Kimani",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop",
    price: 1500,
    isFree: false,
    genres: ["Business", "Strategy"],
    status: "published",
    sales: 234,
  },
  {
    id: "2",
    title: "Modern Web Development",
    author: "Sarah Ochieng",
    coverUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=600&fit=crop",
    price: 2000,
    isFree: false,
    genres: ["Technology"],
    status: "published",
    sales: 189,
  },
  {
    id: "3",
    title: "Mindful Leadership",
    author: "David Mwangi",
    coverUrl: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=400&h=600&fit=crop",
    price: 0,
    isFree: true,
    genres: ["Self-Help"],
    status: "published",
    sales: 128,
  },
  {
    id: "4",
    title: "African Tales & Legends",
    author: "Wanjiku Ngugi",
    coverUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop",
    price: 800,
    isFree: false,
    genres: ["Fiction"],
    status: "draft",
    sales: 0,
  },
  {
    id: "5",
    title: "Introduction to AI",
    author: "Kevin Otieno",
    coverUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=600&fit=crop",
    price: 0,
    isFree: true,
    genres: ["Technology", "AI"],
    status: "published",
    sales: 445,
  },
]

export default function AdminBooksPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Books</h1>
                <p className="mt-1 text-muted-foreground">
                  Manage your book catalogue
                </p>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Book
              </Button>
            </div>

            {/* Search */}
            <div className="mt-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Books Table */}
            <div className="mt-6 overflow-hidden rounded-lg border border-border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Book
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Genres
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Sales
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {filteredBooks.map((book) => (
                      <tr key={book.id} className="hover:bg-secondary/50">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded bg-secondary">
                              <Image
                                src={book.coverUrl}
                                alt={book.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{book.title}</p>
                              <p className="text-sm text-muted-foreground">{book.author}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {book.genres.map((genre) => (
                              <Badge key={genre} variant="secondary" className="text-xs">
                                {genre}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-foreground">
                            {book.isFree ? "Free" : `KES ${book.price.toLocaleString()}`}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <Badge
                            className={
                              book.status === "published"
                                ? "bg-primary/10 text-primary"
                                : "bg-yellow-500/10 text-yellow-500"
                            }
                          >
                            {book.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-muted-foreground">{book.sales}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2">
                                <Eye className="h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Pencil className="h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 text-destructive">
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredBooks.length} of {books.length} books
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
