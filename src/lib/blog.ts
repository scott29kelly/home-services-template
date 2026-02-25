/**
 * Blog engine — glob import, frontmatter parsing, Zod validation, sorting, filtering.
 * Uses Vite's native import.meta.glob with ?raw query to import markdown as strings.
 * No vite-plugin-markdown needed.
 */
import matter from 'gray-matter'
import { z } from 'zod'

// Import all .md files as raw strings at build time (eager = synchronous, no async needed)
const modules = import.meta.glob('../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

// Zod schema for post frontmatter validation
const postFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  excerpt: z.string().min(1),
  tags: z.array(z.string()).min(1),
  coverImage: z.string().min(1),
  author: z.string().default('Acme Home Services'),
  published: z.boolean().default(true),
})

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>

export interface BlogPost extends PostFrontmatter {
  /** Raw markdown body content (frontmatter stripped) */
  content: string
}

// Module-level cache — posts are sorted once and reused across calls
let cachedPosts: BlogPost[] | null = null

/**
 * Returns all published blog posts sorted by date descending (newest first).
 * Invalid or unpublished posts are skipped with a console warning.
 * Duplicate slugs are detected and the second occurrence is skipped.
 */
export function getAllPosts(): BlogPost[] {
  if (cachedPosts !== null) return cachedPosts

  const posts: BlogPost[] = []
  const slugs = new Set<string>()

  for (const [filePath, raw] of Object.entries(modules)) {
    const { data, content } = matter(raw)
    const parsed = postFrontmatterSchema.safeParse(data)

    if (!parsed.success) {
      console.warn(`[blog] Invalid frontmatter in ${filePath}:`, parsed.error.format())
      continue
    }

    if (!parsed.data.published) continue

    if (slugs.has(parsed.data.slug)) {
      console.warn(`[blog] Duplicate slug detected: "${parsed.data.slug}" in ${filePath} — skipping`)
      continue
    }

    slugs.add(parsed.data.slug)
    posts.push({ ...parsed.data, content })
  }

  // Sort by date descending (newest first) — ISO date strings sort correctly with localeCompare
  cachedPosts = posts.sort((a, b) => b.date.localeCompare(a.date))
  return cachedPosts
}

/**
 * Returns a single post by its slug, or undefined if not found.
 */
export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find((p) => p.slug === slug)
}

/**
 * Returns all unique tags across all published posts, sorted alphabetically.
 */
export function getAllTags(): string[] {
  const all = getAllPosts().flatMap((p) => p.tags)
  return [...new Set(all)].sort()
}
