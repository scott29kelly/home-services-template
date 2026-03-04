import { lazy, Suspense } from 'react'

const ServiceAreas = lazy(() => import('../pages/ServiceAreas'))

export default function ServiceAreasRoute() {
  return (
    <Suspense fallback={null}>
      <ServiceAreas />
    </Suspense>
  )
}
