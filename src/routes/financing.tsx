import { lazy, Suspense } from 'react'
import { Navigate } from 'react-router'
import { features } from '../config/features'

const Financing = lazy(() => import('../pages/Financing'))

export default function FinancingRoute() {
  if (!features.financingCalculator) {
    return <Navigate to="/" replace />
  }
  return (
    <Suspense fallback={null}>
      <Financing />
    </Suspense>
  )
}
