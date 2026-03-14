import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    
    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // For security reasons, don't reveal that the user does not exist
      return NextResponse.json({ success: true, message: "Password reset link sent" })
    }

    // Generate JWT resetting token valid for 1 hour
    const token = jwt.sign(
      { userId: user.id },
      process.env.NEXTAUTH_SECRET || "fallback-secret-key-*%",
      { expiresIn: "1h" }
    )

    // Simulate sending email.
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`
    
    console.log(`[PASSWORD RESET] Email to: ${email}`)
    console.log(`Reset Link: ${resetUrl}`)

    return NextResponse.json({ success: true, message: "Password reset link sent" })
  } catch (error) {
    console.error("Forgot password API error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
