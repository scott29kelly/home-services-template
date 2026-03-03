import { Navigate } from 'react-router'
import { features } from '../config/features'
import ResourcesIndex from '../pages/ResourcesIndex'

export default function ResourcesRoute() {
  if (!features.blog) {
    return <Navigate to="/" replace />
  }
  return <ResourcesIndex />
}
