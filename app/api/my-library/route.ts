import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const downloads = await prisma.download.findMany({
      where: { userId: session.user.id },
      include: { book: true },
      orderBy: { grantedAt: 'desc' }
    })

    const books = downloads.map(d => d.book)
    return NextResponse.json(books)
  } catch (error) {
    console.error("Failed to fetch library books:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
