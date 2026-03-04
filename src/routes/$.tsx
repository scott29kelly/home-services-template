import { lazy, Suspense } from 'react'

const NotFound = lazy(() => import('../pages/NotFound'))

export default function CatchAllRoute() {
  return (
    <Suspense fallback={null}>
      <NotFound />
    </Suspense>
  )
}
