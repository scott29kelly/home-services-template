import { Star, CheckCircle, MapPin, Shield, Award, Clock, Heart } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { company } from '../../config/company'

interface ProofItem {
  icon: LucideIcon
  label: string
}

const proofItems: ProofItem[] = [
  { icon: Star, label: `${company.proof.averageRating.toFixed(1)} average across ${company.proof.reviewCount}+ reviews` },
  { icon: CheckCircle, label: `${company.stats.homes.end}${company.stats.homes.suffix} ${company.stats.homes.label}` },
  { icon: MapPin, label: `${company.address.city} Based Team` },
  { icon: Shield, label: company.proof.workmanshipWarranty },
  { icon: Award, label: `${company.proof.manufacturerPartners.length} certified manufacturer partners` },
  { icon: Clock, label: `${company.stats.years.end}${company.stats.years.suffix} ${company.stats.years.label}` },
  { icon: Heart, label: 'Family owned and locally operated' },
]

export default function SocialProof() {
  return (
    <section className="bg-surface border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-6 overflow-x-auto scrollbar-hide">
          {proofItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2 shrink-0">
              <item.icon className="w-5 h-5 text-brand-blue" />
              <span className="text-sm font-medium text-navy/70 whitespace-nowrap">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
