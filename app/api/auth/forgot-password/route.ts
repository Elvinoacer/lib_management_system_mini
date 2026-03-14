import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    
    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 })
    }

    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) throw new Error("NEXTAUTH_SECRET is not configured")

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
      secret,
      { expiresIn: "1h" }
    )

    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`
    
    // Send email using nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST || 'smtp.ethereal.email',
      port: Number(process.env.EMAIL_SERVER_PORT) || 587,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Kitabu Support" <noreply@kitabu.com>',
      to: email,
      subject: "Password Reset Request",
      html: `
        <h2>Reset Your Password</h2>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
      `
    })

    return NextResponse.json({ success: true, message: "Password reset link sent" })
  } catch (error) {
    console.error("Forgot password API error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
