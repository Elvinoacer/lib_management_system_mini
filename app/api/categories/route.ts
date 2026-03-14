import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      select: { genres: true }
    })
    
    const genreCounts = new Map<string, number>()
    books.forEach(book => {
      book.genres.forEach(genre => {
        genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1)
      })
    })

    const categories = Array.from(genreCounts.entries()).map(([name, count]) => ({
      name,
      slug: encodeURIComponent(name),
      count
    }))

    // Sort by count descending
    categories.sort((a, b) => b.count - a.count)

    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}
