import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import cloudinary from "@/lib/cloudinary"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { bookId } = await params
    // Verify ownership
    const download = await prisma.download.findUnique({
      where: {
        userId_bookId: {
          userId: session.user.id!,
          bookId
        }
      },
      include: { book: true }
    })

    if (!download) {
      return NextResponse.json({ error: "Unauthorized or not purchased" }, { status: 403 })
    }

    // Generate signed URL
    const url = cloudinary.utils.private_download_url(
      download.book.fileKey,
      '', // format
      {
        attachment: true,
        expires_at: Math.floor(Date.now() / 1000) + 900 // 15 mins
      }
    )

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Download URL generation error:", error)
    return NextResponse.json({ error: "Failed to generate download link" }, { status: 500 })
  }
}
