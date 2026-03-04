import { lazy, Suspense } from 'react'

const About = lazy(() => import('../pages/About'))

export default function AboutRoute() {
  return (
    <Suspense fallback={null}>
      <About />
    </Suspense>
  )
}
