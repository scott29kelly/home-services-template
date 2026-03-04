import { lazy, Suspense } from 'react'
import { Navigate } from 'react-router'
import { features } from '../config/features'

const Ava = lazy(() => import('../pages/Ava'))

export default function AvaRoute() {
  if (!features.assistant) {
    return <Navigate to="/" replace />
  }
  return (
    <Suspense fallback={null}>
      <Ava />
    </Suspense>
  )
}
