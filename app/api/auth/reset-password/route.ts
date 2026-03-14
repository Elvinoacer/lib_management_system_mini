import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json()
    
    if (!token || !newPassword) {
      return NextResponse.json({ error: "Missing token or password" }, { status: 400 })
    }

    try {
      const secret = process.env.NEXTAUTH_SECRET
      if (!secret) throw new Error("NEXTAUTH_SECRET is not configured")
      
      const decoded: any = jwt.verify(token, secret)
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      })

      if (!user) {
         return NextResponse.json({ error: "Invalid token" }, { status: 400 })
      }

      const hash = await bcrypt.hash(newPassword, 10)

      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hash }
      })

      return NextResponse.json({ success: true, message: "Password reset successful" })
    } catch (err) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }
  } catch (error) {
    console.error("Reset password API error:", error)
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}
