import { Navigate } from 'react-router'
import { features } from '../config/features'
import Ava from '../pages/Ava'

export default function AvaRoute() {
  if (!features.assistant) {
    return <Navigate to="/" replace />
  }
  return <Ava />
}
