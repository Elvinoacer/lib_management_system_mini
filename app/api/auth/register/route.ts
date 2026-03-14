import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import { registerSchema } from "@/lib/validations"
import crypto from "crypto"
import nodemailer from "nodemailer"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const verificationToken = crypto.randomBytes(32).toString('hex')

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        verificationToken,
      },
    })

    // Dispatch verification email
    try {
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
          <h2>Welcome to Kitabu!</h2>
          <p>Please click the link below to verify your email address:</p>
          <p><a href="${verifyUrl}">${verifyUrl}</a></p>
          <p>This verification link ensures you have access to your account and purchased books.</p>
        `
      })
    } catch (e) {
      console.error("Failed to send verification email", e)
      // Proceed even if email fails so user is created
    }

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 })
    }
    console.error("Registration Error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
