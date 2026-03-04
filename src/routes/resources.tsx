import { lazy, Suspense } from 'react'
import { Navigate } from 'react-router'
import { features } from '../config/features'

const ResourcesIndex = lazy(() => import('../pages/ResourcesIndex'))

export default function ResourcesRoute() {
  if (!features.blog) {
    return <Navigate to="/" replace />
  }
  return (
    <Suspense fallback={null}>
      <ResourcesIndex />
    </Suspense>
  )
}
