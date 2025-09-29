import { z } from "zod"

// User validation schemas
export const clientProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, { message: "Display name must be at least 2 characters" })
    .max(50, { message: "Display name cannot exceed 50 characters" }),
  bio: z
    .string()
    .max(500, { message: "Bio cannot exceed 500 characters" })
    .optional(),
  location: z
    .string()
    .max(100, { message: "Location cannot exceed 100 characters" })
    .optional(),
  website: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .optional()
    .or(z.literal("")),
})

// Reader validation schemas
export const readerApplicationSchema = z.object({
  type: z.enum(["psychic", "tarot", "astrology", "all"])
    .describe("Please select a reader type"),
  bio: z
    .string()
    .min(100, { message: "Bio must be at least 100 characters" })
    .max(1000, { message: "Bio cannot exceed 1000 characters" }),
  attributes: z
    .array(z.string())
    .min(1, { message: "Please select at least one attribute" })
    .max(5, { message: "Cannot select more than 5 attributes" }),
  hourlyRate: z
    .number()
    .min(10, { message: "Minimum hourly rate is $10" })
    .max(200, { message: "Maximum hourly rate is $200" }),
})

// Reading validation schemas
export const readingRequestSchema = z.object({
  readerId: z.string()
    .describe("Reader is required"),
  topic: z
    .string()
    .min(5, { message: "Topic must be at least 5 characters" })
    .max(200, { message: "Topic cannot exceed 200 characters" }),
  description: z
    .string()
    .min(20, { message: "Description must be at least 20 characters" })
    .max(1000, { message: "Description cannot exceed 1000 characters" }),
  duration: z
    .number()
    .min(15, { message: "Minimum duration is 15 minutes" })
    .max(120, { message: "Maximum duration is 120 minutes" }),
})

export const readingReviewSchema = z.object({
  rating: z
    .number()
    .min(1, { message: "Rating must be at least 1" })
    .max(5, { message: "Rating cannot exceed 5" }),
  review: z
    .string()
    .max(500, { message: "Review cannot exceed 500 characters" })
    .optional(),
})

// Post validation schemas
export const postSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title must be at least 5 characters" })
    .max(200, { message: "Title cannot exceed 200 characters" }),
  content: z
    .string()
    .min(20, { message: "Content must be at least 20 characters" })
    .max(5000, { message: "Content cannot exceed 5000 characters" }),
  category: z.string()
    .describe("Category is required"),
})

// Comment validation schemas
export const commentSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Comment cannot be empty" })
    .max(500, { message: "Comment cannot exceed 500 characters" }),
})

// Dispute validation schemas
export const disputeSchema = z.object({
  readingId: z.string()
    .describe("Reading ID is required"),
  reason: z
    .string()
    .min(20, { message: "Reason must be at least 20 characters" })
    .max(1000, { message: "Reason cannot exceed 1000 characters" }),
  evidence: z
    .string()
    .max(2000, { message: "Evidence cannot exceed 2000 characters" })
    .optional(),
})
