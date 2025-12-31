/**
 * @file types/media.ts
 * @description Type definitions for media and articles
 * @author Team Kenya Dev
 */

export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED'
}

export interface MediaArticle {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  coverImage: string | null
  status: ArticleStatus
  metaTitle: string | null
  metaDescription: string | null
  tags: string[]
  viewCount: number
  likes: number
  shares: number
  publishedAt: Date | null
  featuredAt: Date | null
  createdAt: Date
  updatedAt: Date
  authorId: string
  author?: User
  reviewedById: string | null
  reviewedBy?: User | null
  reviewedAt: Date | null
  reviewNotes: string | null
  cohortRestriction: string | null
  revisions: MediaRevision[]
}

export interface MediaRevision {
  id: string
  content: string
  changes: any
  createdAt: Date
  articleId: string
  article?: MediaArticle
}

export interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  school: string | null
}

export interface CreateArticleInput {
  title: string
  excerpt?: string
  content: string
  coverImage?: string
  tags?: string[]
  status?: ArticleStatus
  cohortRestriction?: string
  metaTitle?: string
  metaDescription?: string
}

export interface UpdateArticleInput {
  title?: string
  excerpt?: string
  content?: string
  coverImage?: string
  tags?: string[]
  status?: ArticleStatus
  cohortRestriction?: string
  metaTitle?: string
  metaDescription?: string
}

export interface ArticleFilter {
  status?: ArticleStatus
  authorId?: string
  cohortRestriction?: string
  tags?: string[]
  publishedAfter?: Date
  publishedBefore?: Date
}

export interface ArticleSort {
  field: 'createdAt' | 'publishedAt' | 'viewCount' | 'likes' | 'title'
  order: 'asc' | 'desc'
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface ArticleSearchResult {
  article: MediaArticle
  relevanceScore: number
  highlightedContent?: string
}