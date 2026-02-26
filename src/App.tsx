import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Layout from './components/layout/Layout'
import { PageSkeleton } from './components/ui/Skeleton'
import { getServiceRoutes } from './lib/route-generator'
import { features } from './config'

// Eager load Home for fast FCP
import Home from './pages/Home'

// Lazy load all other pages
const ServicePage = lazy(() => import('./pages/ServicePage'))
const Services = lazy(() => import('./pages/Services'))
const Projects = lazy(() => import('./pages/Projects'))
const TestimonialsPage = lazy(() => import('./pages/TestimonialsPage'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const ServiceAreas = lazy(() => import('./pages/ServiceAreas'))
const CityPage = lazy(() => import('./pages/CityPage'))
const Ava = lazy(() => import('./pages/Ava'))
const ThankYou = lazy(() => import('./pages/ThankYou'))
const Financing = lazy(() => import('./pages/Financing'))
const ResourcesIndex = lazy(() => import('./pages/ResourcesIndex'))
const ResourcesPost = lazy(() => import('./pages/ResourcesPost'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const NotFound = lazy(() => import('./pages/NotFound'))

const serviceRoutes = getServiceRoutes()

export default function App() {
  return (
    <>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            {/* Config-driven service routes */}
            {serviceRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<ServicePage />}
              />
            ))}
            <Route path="services" element={<Services />} />
            <Route path="projects" element={<Projects />} />
            <Route path="testimonials" element={<TestimonialsPage />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="service-areas" element={<ServiceAreas />} />
            {/* Config-driven city page routes */}
            {features.cityPages && (
              <Route path="service-areas/:slug" element={<CityPage />} />
            )}
            {features.assistant ? (
              <Route path="ava" element={<Ava />} />
            ) : (
              <Route path="ava" element={<Navigate to="/" replace />} />
            )}
            <Route path="thank-you" element={<ThankYou />} />
            {features.financingCalculator && (
              <Route path="financing" element={<Financing />} />
            )}
            {features.blog && (
              <>
                <Route path="resources" element={<ResourcesIndex />} />
                <Route path="resources/:slug" element={<ResourcesPost />} />
              </>
            )}
            <Route path="portfolio/:slug" element={<ProjectDetail />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
      {import.meta.env.VITE_VERCEL_SPEED_INSIGHTS === 'true' && <SpeedInsights />}
    </>
  )
}
