/**
 * Blog engine using Vite raw imports plus a lightweight frontmatter parser.
 * This avoids pulling Node-oriented parsing code into the browser bundle.
 */
import { z } from 'zod'
import { parseFrontmatter } from './frontmatter'

const modules = import.meta.glob('../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

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

let cachedPosts: BlogPost[] | null = null

/**
 * Returns all published blog posts sorted by date descending.
 */
export function getAllPosts(): BlogPost[] {
  if (cachedPosts !== null) return cachedPosts

  const posts: BlogPost[] = []
  const slugs = new Set<string>()

  for (const [filePath, raw] of Object.entries(modules)) {
    const { data, content } = parseFrontmatter(raw)
    const parsed = postFrontmatterSchema.safeParse(data)

    if (!parsed.success) {
      console.warn(`[blog] Invalid frontmatter in ${filePath}:`, parsed.error.format())
      continue
    }

    if (!parsed.data.published) continue

    if (slugs.has(parsed.data.slug)) {
      console.warn(`[blog] Duplicate slug detected: "${parsed.data.slug}" in ${filePath} - skipping`)
      continue
    }

    slugs.add(parsed.data.slug)
    posts.push({ ...parsed.data, content })
  }

  cachedPosts = posts.sort((a, b) => b.date.localeCompare(a.date))
  return cachedPosts
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find((post) => post.slug === slug)
}

export function getAllTags(): string[] {
  const all = getAllPosts().flatMap((post) => post.tags)
  return [...new Set(all)].sort()
}
