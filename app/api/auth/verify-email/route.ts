import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { token } = await req.json()
    
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { verificationToken: token }
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired verification link" }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null
      }
    })

    return NextResponse.json({ success: true, message: "Email verified successfully" })
  } catch (error) {
    console.error("Verify email API error:", error)
    return NextResponse.json({ error: "Failed to verify email" }, { status: 500 })
  }
}
