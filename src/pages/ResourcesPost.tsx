/**
 * ResourcesPost — Individual blog post reader page.
 * Renders markdown content with prose typography, BlogPosting JSON-LD,
 * a CTA section, and related post cards in the footer.
 */
import { useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import PageMeta from '../components/ui/PageMeta'
import { getAllPosts, getPostBySlug } from '../lib/blog'
import type { BlogPost } from '../lib/blog'
import { company } from '../config/company'

// Month names for timezone-safe date formatting (avoids new Date() UTC offset issues)
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/**
 * Formats a YYYY-MM-DD date string to "Month DD, YYYY" without timezone conversion.
 */
function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return `${MONTH_NAMES[month - 1]} ${day}, ${year}`
}

/**
 * BlogPosting JSON-LD structured data for SEO.
 * Sanitizes JSON to prevent script injection via \u003c escaping.
 */
function BlogPostingSchema({ post }: { post: BlogPost }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: post.author },
    image: company.url + post.coverImage,
    url: company.url + '/resources/' + post.slug,
    keywords: post.tags.join(', '),
  }

  const json = JSON.stringify(schema).replace(/</g, '\\u003c')

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}

/**
 * Related post card — cover image thumbnail, title, and date.
 */
function RelatedPostCard({ post }: { post: BlogPost }) {
  return (
    <article className="bg-white rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow duration-200 flex flex-col">
      <Link to={`/resources/${post.slug}`} className="block overflow-hidden bg-surface aspect-video">
        <img
          src={post.coverImage}
          alt={post.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/resources/${post.slug}`}>
          <h3 className="text-sm font-bold text-navy leading-snug mb-2 hover:text-brand-blue transition-colors duration-150 line-clamp-2">
            {post.title}
          </h3>
        </Link>
        <time dateTime={post.date} className="text-xs text-text-secondary mt-auto">
          {formatDate(post.date)}
        </time>
      </div>
    </article>
  )
}

/**
 * Finds related posts by shared tags, falls back to latest posts.
 * Excludes the current post and limits to 3 results.
 */
function getRelatedPosts(currentPost: BlogPost, allPosts: BlogPost[]): BlogPost[] {
  const others = allPosts.filter((p) => p.slug !== currentPost.slug)

  // Posts that share at least one tag with the current post
  const byTag = others.filter((p) => p.tags.some((t) => currentPost.tags.includes(t)))

  if (byTag.length >= 3) return byTag.slice(0, 3)

  // Fill remaining slots with latest posts (already sorted newest-first)
  const tagSlugs = new Set(byTag.map((p) => p.slug))
  const fillFrom = others.filter((p) => !tagSlugs.has(p.slug))
  return [...byTag, ...fillFrom].slice(0, 3)
}

export default function ResourcesPost() {
  const { slug } = useParams<{ slug: string }>()
  const allPosts = useMemo(() => getAllPosts(), [])

  const post = slug ? getPostBySlug(slug) : undefined

  // Redirect to listing if slug not found
  if (!post) return <Navigate to="/resources" replace />

  const relatedPosts = getRelatedPosts(post, allPosts)

  return (
    <>
      <PageMeta
        title={post.title}
        description={post.excerpt}
        path={'/resources/' + post.slug}
      />
      <BlogPostingSchema post={post} />

      {/* Article */}
      <article>
        {/* Hero image — above fold, eager loaded */}
        <div className="w-full bg-surface">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-0">
            <img
              src={post.coverImage}
              alt={post.title}
              loading="eager"
              decoding="async"
              className="w-full rounded-2xl aspect-video object-cover shadow-sm"
            />
          </div>
        </div>

        {/* Title + byline */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-2">
          {/* Tag pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/resources?tag=${encodeURIComponent(tag)}`}
                className="text-xs font-medium px-3 py-1 rounded-full bg-sky-50 text-brand-blue border border-sky-100 hover:bg-sky-100 transition-colors duration-150"
              >
                {tag}
              </Link>
            ))}
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy leading-tight mb-4">
            {post.title}
          </h1>

          {/* Byline — date and author, no read time per CONTEXT.md */}
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-8">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-hidden="true">&middot;</span>
            <span>{post.author}</span>
          </div>
        </div>

        {/* Markdown content — prose typography */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
          <div className="prose prose-lg prose-headings:font-heading prose-headings:text-navy prose-a:text-brand-blue prose-strong:text-navy max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                img: ({ src, alt }) => (
                  <img
                    src={src}
                    alt={alt ?? ''}
                    loading="lazy"
                    decoding="async"
                    className="rounded-xl w-full"
                  />
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </div>
      </article>

      {/* Post footer CTA */}
      <section className="bg-brand-blue py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-3">
            Ready to protect your home?
          </h2>
          <p className="text-sky-100 text-lg mb-8 max-w-xl mx-auto">
            Our certified team is ready to help with inspections, repairs, and full replacements.
            Get in touch today for a free assessment.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-brand-blue font-semibold rounded-full shadow hover:bg-sky-50 transition-colors duration-150 min-w-[200px]"
            >
              Schedule an Inspection
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-transparent text-white font-semibold rounded-full border-2 border-white hover:bg-white/10 transition-colors duration-150 min-w-[200px]"
            >
              Get a Free Quote
            </Link>
          </div>
        </div>
      </section>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="py-14 bg-surface border-t border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="font-heading text-2xl font-bold text-navy mb-8">Related Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <RelatedPostCard key={related.slug} post={related} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
