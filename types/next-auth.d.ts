import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "ADMIN" | "MEMBER"
      emailVerified?: Date | null
    } & DefaultSession["user"]
  }
  interface User {
    id: string
    role: "ADMIN" | "MEMBER"
    emailVerified?: Date | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "ADMIN" | "MEMBER"
    emailVerified?: Date | null
  }
}
