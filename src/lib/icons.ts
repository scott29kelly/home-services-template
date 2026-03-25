/**
 * Icon resolver — maps string names from config to Lucide icon components.
 */
import {
  Shield, CheckCircle, Home, PanelLeft, CloudLightning,
  Palette, DollarSign, Thermometer, Wrench,
  CloudHail, Wind, TreePine, AlertTriangle,
  Heart, Users, Star, Building,
  Trophy, Award, Medal, Mail, Phone, MapPin,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  Shield, CheckCircle, Home, PanelLeft, CloudLightning,
  Palette, DollarSign, Thermometer, Wrench,
  CloudHail, Wind, TreePine, AlertTriangle,
  Heart, Users, Star, Building,
  Trophy, Award, Medal, Mail, Phone, MapPin,
}

/** Resolve an icon name string to its Lucide component. Falls back to Shield. */
export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? Shield
}
