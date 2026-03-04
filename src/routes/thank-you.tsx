import { lazy, Suspense } from 'react'

const ThankYou = lazy(() => import('../pages/ThankYou'))

export default function ThankYouRoute() {
  return (
    <Suspense fallback={null}>
      <ThankYou />
    </Suspense>
  )
}
