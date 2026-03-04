import { lazy, Suspense } from 'react'

const Contact = lazy(() => import('../pages/Contact'))

export default function ContactRoute() {
  return (
    <Suspense fallback={null}>
      <Contact />
    </Suspense>
  )
}
