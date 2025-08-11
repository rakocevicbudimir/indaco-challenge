import { z } from 'zod'

// Common types
export const MetaSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(50),
  type: z.enum(['category', 'tag']),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2).max(100),
  roles: z.array(z.enum(['user', 'admin'])),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Legal Document types
export const DocumentLineSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  lineNumber: z.number().int().positive(),
  version: z.string(), // Git-like version hash
  previousVersionId: z.string().uuid().optional(),
  references: z.array(z.string().uuid()), // References to other documents/lines
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const LegalDocumentSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  content: z.string(), // HTML or Markdown content
  excerpt: z.string().max(500).optional(),
  author: z.string().uuid(), // Reference to User
  tags: z.array(z.string().uuid()), // References to Tags
  isPublic: z.boolean(),
  version: z.string(), // Document version
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  lines: z.array(DocumentLineSchema).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Blog types
export const BlogArticleSchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().max(500),
  content: z.string(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  isPremium: z.boolean(),
  metaIds: z.array(z.number()),
  coverImage: z.string().url().optional(),
})

// Auth types
export const LoginCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const RegisterCredentialsSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(100),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }).max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string().min(8, { message: 'Password must be at least 8 characters' }),
})

// Response types
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown(),
  error: z.string().optional(),
})

// Export types
export type Meta = z.infer<typeof MetaSchema>
export type User = z.infer<typeof UserSchema>
export type DocumentLine = z.infer<typeof DocumentLineSchema>
export type LegalDocument = z.infer<typeof LegalDocumentSchema>
export type BlogArticle = z.infer<typeof BlogArticleSchema>
export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>
export type RegisterCredentials = z.infer<typeof RegisterCredentialsSchema>
export type ApiResponse = z.infer<typeof ApiResponseSchema>
