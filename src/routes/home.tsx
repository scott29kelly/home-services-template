import { lazy, Suspense } from 'react'

const Home = lazy(() => import('../pages/Home'))

export default function HomeRoute() {
  return (
    <Suspense fallback={null}>
      <Home />
    </Suspense>
  )
}
