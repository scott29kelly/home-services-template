import { lazy, Suspense } from 'react'

const Projects = lazy(() => import('../pages/Projects'))

export default function ProjectsRoute() {
  return (
    <Suspense fallback={null}>
      <Projects />
    </Suspense>
  )
}
