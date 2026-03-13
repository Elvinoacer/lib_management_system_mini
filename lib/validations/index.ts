import { z } from "zod"

export const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().min(0),
  isFree: z.boolean().default(false),
  coverUrl: z.string().url().optional().or(z.literal("")),
  fileKey: z.string().min(1, "File key is required"),
  genres: z.array(z.string()).min(1, "At least one genre is required"),
  language: z.string().default("en"),
  pageCount: z.number().optional(),
})

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const orderSchema = z.object({
  bookIds: z.array(z.string()).min(1, "At least one book is required for checkout"),
  phoneNumber: z.string().optional(),
})
