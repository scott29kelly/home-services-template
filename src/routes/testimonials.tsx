import { lazy, Suspense } from 'react'

const TestimonialsPage = lazy(() => import('../pages/TestimonialsPage'))

export default function TestimonialsRoute() {
  return (
    <Suspense fallback={null}>
      <TestimonialsPage />
    </Suspense>
  )
}
