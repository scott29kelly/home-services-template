import { getAllPosts, type BlogPost } from './blog'
import { projects, type Project, type ProjectCategory } from '../config/projects'
import { services, type ServiceConfig } from '../config/services'

const SERVICE_TAG_KEYWORDS: Record<string, string[]> = {
  roofing: ['roof', 'roofing', 'shingle'],
  siding: ['siding', 'exterior'],
  'storm-damage': ['storm', 'insurance', 'hail', 'damage'],
}

function includesKeyword(value: string, keywords: string[]): boolean {
  const lower = value.toLowerCase()
  return keywords.some((keyword) => lower.includes(keyword))
}

export function getProjectCategoryForService(serviceSlug: string): ProjectCategory | null {
  if (serviceSlug === 'roofing') return 'roofing'
  if (serviceSlug === 'siding') return 'siding'
  if (serviceSlug === 'storm-damage') return 'storm'
  return null
}

export function getProjectsForService(serviceSlug: string, limit = 3): Project[] {
  const category = getProjectCategoryForService(serviceSlug)
  if (!category) return []

  return projects.items
    .filter((project) => project.category === category)
    .slice(0, limit)
}

export function getProjectsForCity(cityName: string, limit = 3): Project[] {
  return projects.items
    .filter((project) => project.location.toLowerCase().includes(cityName.toLowerCase()))
    .slice(0, limit)
}

export function getRelatedPostsForService(serviceSlug: string, limit = 3): BlogPost[] {
  const keywords = SERVICE_TAG_KEYWORDS[serviceSlug] ?? []
  if (keywords.length === 0) return getAllPosts().slice(0, limit)

  const matches = getAllPosts().filter(
    (post) =>
      post.tags.some((tag) => includesKeyword(tag, keywords)) ||
      includesKeyword(post.title, keywords) ||
      includesKeyword(post.excerpt, keywords),
  )

  return matches.slice(0, limit)
}

export function getRelatedPostsForCity(cityName: string, limit = 3): BlogPost[] {
  const matchingPosts = getAllPosts().filter(
    (post) =>
      post.title.toLowerCase().includes(cityName.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(cityName.toLowerCase()),
  )

  if (matchingPosts.length > 0) return matchingPosts.slice(0, limit)
  return getAllPosts().slice(0, limit)
}

export function getSuggestedServicesForPost(post: BlogPost, limit = 2): ServiceConfig[] {
  return services
    .filter((service) => {
      const keywords = SERVICE_TAG_KEYWORDS[service.slug] ?? []
      return (
        includesKeyword(post.title, keywords) ||
        includesKeyword(post.excerpt, keywords) ||
        post.tags.some((tag) => includesKeyword(tag, keywords))
      )
    })
    .slice(0, limit)
}
