/**
 * ResourcesIndex — Homeowner Resources listing page.
 * Card grid with tag filtering (URL-based via useSearchParams) and client-side pagination.
 */
import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PageMeta from '../components/ui/PageMeta'
import SectionHeading from '../components/ui/SectionHeading'
import type { BlogPost } from '../lib/blog'

const POSTS_PER_PAGE = 6

// Month names for timezone-safe date formatting (Pitfall 3 from RESEARCH.md)
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/**
 * Formats a YYYY-MM-DD date string to "Month DD, YYYY" without timezone conversion.
 * Avoids new Date('YYYY-MM-DD') which interprets as UTC midnight and can shift by 1 day.
 */
function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return `${MONTH_NAMES[month - 1]} ${day}, ${year}`
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Cover image */}
      <Link to={`/resources/${post.slug}`} className="block overflow-hidden bg-surface aspect-video">
        <img
          src={post.coverImage}
          alt={post.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </Link>

      {/* Card body */}
      <div className="p-6 flex flex-col flex-1">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium px-2 py-0.5 rounded-full bg-sky-50 text-brand-blue border border-sky-100"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <Link to={`/resources/${post.slug}`}>
          <h2 className="text-lg font-bold text-navy leading-snug mb-2 hover:text-brand-blue transition-colors duration-150 line-clamp-2">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-text-secondary text-sm leading-relaxed line-clamp-2 flex-1">
          {post.excerpt}
        </p>

        {/* Date + Read more */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <time dateTime={post.date} className="text-xs text-text-secondary">
            {formatDate(post.date)}
          </time>
          <Link
            to={`/resources/${post.slug}`}
            className="text-xs font-semibold text-brand-blue hover:underline"
          >
            Read more &rarr;
          </Link>
        </div>
      </div>
    </article>
  )
}

interface ResourcesIndexProps {
  allPosts: BlogPost[]
  allTags: string[]
}

export default function ResourcesIndex({ allPosts, allTags }: ResourcesIndexProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTag = searchParams.get('tag') ?? ''
  const [page, setPage] = useState(1)

  // Filter posts by active tag
  const filteredPosts = useMemo(
    () => (activeTag ? allPosts.filter((p) => p.tags.includes(activeTag)) : allPosts),
    [allPosts, activeTag],
  )

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const paginatedPosts = filteredPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE)

  function handleTagChange(tag: string) {
    setPage(1)
    setSearchParams(tag ? { tag } : {})
  }

  function handlePageChange(newPage: number) {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <PageMeta
        title="Homeowner Resources"
        description="Expert guides on roofing, siding, storm damage, and home maintenance. Practical advice from experienced contractors."
        path="/resources"
      />

      {/* Hero section */}
      <section className="bg-surface py-16 lg:py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <SectionHeading
            as="h1"
            title="Homeowner Resources"
            subtitle="Expert advice to help you make informed decisions about your home."
            align="center"
          />
        </div>
      </section>

      {/* Main content */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Tag filter pills */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {/* "All" pill */}
              <button
                onClick={() => handleTagChange('')}
                className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-all duration-150 ${
                  activeTag === ''
                    ? 'bg-brand-blue text-white border-brand-blue'
                    : 'bg-white text-navy border-border hover:border-brand-blue hover:text-brand-blue'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagChange(tag)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-all duration-150 ${
                    activeTag === tag
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'bg-white text-navy border-border hover:border-brand-blue hover:text-brand-blue'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Post grid or empty state */}
          {paginatedPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl font-bold text-navy mb-2">No resources found.</p>
              <p className="text-text-secondary">
                {activeTag
                  ? `No posts tagged "${activeTag}". Try a different filter.`
                  : 'Check back soon — new guides are published regularly.'}
              </p>
              {activeTag && (
                <button
                  onClick={() => handleTagChange('')}
                  className="mt-4 text-brand-blue text-sm font-medium hover:underline"
                >
                  View all resources
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}

          {/* Pagination — only shown when posts exceed per-page limit */}
          {totalPages > 1 && (
            <nav
              aria-label="Blog pagination"
              className="flex items-center justify-center gap-1 mt-14"
            >
              {/* Previous */}
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                aria-label="Previous page"
                className="p-2 rounded-lg border border-border text-navy hover:border-brand-blue hover:text-brand-blue transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => handlePageChange(num)}
                  aria-current={num === page ? 'page' : undefined}
                  className={`min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-medium border transition-colors ${
                    num === page
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'bg-white text-navy border-border hover:border-brand-blue hover:text-brand-blue'
                  }`}
                >
                  {num}
                </button>
              ))}

              {/* Next */}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                aria-label="Next page"
                className="p-2 rounded-lg border border-border text-navy hover:border-brand-blue hover:text-brand-blue transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </nav>
          )}
        </div>
      </section>
    </>
  )
}
