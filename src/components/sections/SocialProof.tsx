import { Star, CheckCircle, MapPin, Shield, Award, Clock, Heart } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface ProofItem {
  icon: LucideIcon
  label: string
}

const proofItems: ProofItem[] = [
  { icon: Star, label: 'A+ BBB Rating' },
  { icon: CheckCircle, label: '500+ Homes Protected' },
  { icon: MapPin, label: 'Locally Licensed' },
  { icon: Shield, label: 'Certified Installers' },
  { icon: Award, label: 'Manufacturer Certified' },
  { icon: Clock, label: '15+ Years' },
  { icon: Heart, label: 'Family Owned' },
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
