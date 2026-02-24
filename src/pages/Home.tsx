import Hero from '../components/sections/Hero'
import SocialProof from '../components/sections/SocialProof'
import BentoGrid from '../components/sections/BentoGrid'
import Stats from '../components/sections/Stats'
import ProcessTimeline from '../components/sections/ProcessTimeline'
import Testimonials from '../components/sections/Testimonials'
import Certifications from '../components/sections/Certifications'
import CTA from '../components/sections/CTA'
import PageMeta from '../components/ui/PageMeta'
import JsonLd from '../components/seo/JsonLd'
import { buildLocalBusinessSchema, buildBreadcrumbSchema } from '../lib/seo'

export default function Home() {
  return (
    <>
      <PageMeta
        title="Expert Storm Repair | Roofing & Siding"
        description="Professional roofing, siding, and storm damage repair services. A+ BBB rated. Licensed & insured. Free inspections."
        path="/"
      />
      <JsonLd data={buildLocalBusinessSchema()} />
      <JsonLd data={buildBreadcrumbSchema([{ name: 'Home', url: '/' }])} />
      <Hero />
      <SocialProof />
      <BentoGrid />
      <Stats />
      <ProcessTimeline />
      <Testimonials />
      <Certifications />
      <CTA />
    </>
  )
}
