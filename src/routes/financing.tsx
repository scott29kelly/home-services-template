import { Navigate } from 'react-router'
import { features } from '../config/features'
import Financing from '../pages/Financing'

export default function FinancingRoute() {
  if (!features.financingCalculator) {
    return <Navigate to="/" replace />
  }
  return <Financing />
}
