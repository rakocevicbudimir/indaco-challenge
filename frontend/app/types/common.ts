import type { BlogArticle, LegalDocument } from './rules'

export type Reference = {
  id: number
  content: string
  toEntityId?: number
  toEntityType?: string
  fromEntityId?: number
  fromEntityType?: string
}

export type FullReference = Reference & {
  fromBlogId: number | null
  fromDocumentId: number | null
  fromSectionId: number | null
  toBlogId: number | null
  toBlog?: BlogArticle | null
  toDocumentId: number | null
  toDocument?: LegalDocument | null
  toSectionId: number | null
  createdAt: string
  updatedAt: string
}

export type Author = { id: number; email: string; firstName: string; lastName: string }
export type Meta = { id: number; name: string }
export type EntityMeta = { id: number; meta: Meta }
