import { PrismaClient } from "./src/generated/prisma/client/client.js"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import bcrypt from "bcryptjs"
import "dotenv/config"

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  const user = await prisma.user.findUnique({
    where: { email: "testing@example.com" }
  })
  
  if (!user) return console.log("User not found")

  const isValid = await bcrypt.compare("password123", user.passwordHash)
  console.log("Password Valid:", isValid)
  
  await prisma.$disconnect()
  await pool.end()
}
main()
