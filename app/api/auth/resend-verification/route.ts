import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import crypto from "crypto"
import nodemailer from "nodemailer"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email } = session.user

    if (!email) {
      return NextResponse.json({ error: "No email provided" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: "Email is already verified" }, { status: 200 })
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    
    // Update user record
    await prisma.user.update({
      where: { email },
      data: { verificationToken }
    })

    // Send email
    const port = Number(process.env.EMAIL_SERVER_PORT) || 587
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST || 'smtp.ethereal.email',
      port: port,
      secure: port === 465,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const verifyUrl = `${origin}/verify-email?token=${verificationToken}`

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Kitabu Support" <noreply@kitabu.com>',
      to: email,
      subject: "Verify your email address - Kitabu",
      html: `
        <h2>Verify your Kitabu account</h2>
        <p>Please click the link below to verify your email address:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p>This verification link ensures you have access to your account and purchased books.</p>
        <p><small>If you did not request this, please ignore this email.</small></p>
      `
    })

    return NextResponse.json({ message: "Verification email sent successfully" }, { status: 200 })
  } catch (error) {
    console.error("Resend Verification Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
