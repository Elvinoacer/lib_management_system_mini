import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { authConfig } from './auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("LOGIN FAILED: Missing email or password")
            return null
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string }
          })

          if (!user) {
            console.log("LOGIN FAILED: User not found for email:", credentials.email)
            return null
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          )

          if (!isValid) {
            console.log("LOGIN FAILED: Password mismatch for email:", credentials.email)
            return null
          }

          console.log("LOGIN SUCCESS: User authenticated:", user.email)
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified
          }
        } catch (error) {
          console.error("AUTHORIZE ERROR:", error)
          return null
        }
      }
    })
  ],
})
