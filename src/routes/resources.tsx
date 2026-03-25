import type { Route } from './+types/resources'
import { redirect } from 'react-router'
import { features } from '../config/features'
import { getAllPosts, getAllTags } from '../lib/blog'
import ResourcesIndex from '../pages/ResourcesIndex'

export async function loader(_args: Route.LoaderArgs) {
  if (!features.blog) throw redirect('/', { status: 302 })
  const allPosts = getAllPosts()
  const allTags = getAllTags()
  return { allPosts, allTags }
}

export default function ResourcesRoute({ loaderData }: Route.ComponentProps) {
  return <ResourcesIndex allPosts={loaderData.allPosts} allTags={loaderData.allTags} />
}
