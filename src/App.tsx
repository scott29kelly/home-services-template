import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/layout/Layout'

// Eager load Home for fast FCP
import Home from './pages/Home'

// Lazy load all other pages
const Roofing = lazy(() => import('./pages/Roofing'))
const Siding = lazy(() => import('./pages/Siding'))
const StormDamage = lazy(() => import('./pages/StormDamage'))
const Services = lazy(() => import('./pages/Services'))
const Projects = lazy(() => import('./pages/Projects'))
const TestimonialsPage = lazy(() => import('./pages/TestimonialsPage'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const ServiceAreas = lazy(() => import('./pages/ServiceAreas'))
const Ava = lazy(() => import('./pages/Ava'))

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="roofing" element={<Roofing />} />
          <Route path="siding" element={<Siding />} />
          <Route path="storm-damage" element={<StormDamage />} />
          <Route path="services" element={<Services />} />
          <Route path="projects" element={<Projects />} />
          <Route path="testimonials" element={<TestimonialsPage />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="service-areas" element={<ServiceAreas />} />
          <Route path="ava" element={<Ava />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
