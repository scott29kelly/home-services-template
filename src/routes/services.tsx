import { lazy, Suspense } from 'react'

const Services = lazy(() => import('../pages/Services'))

export default function ServicesRoute() {
  return (
    <Suspense fallback={null}>
      <Services />
    </Suspense>
  )
}
