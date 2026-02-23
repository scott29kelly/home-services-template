import { z } from 'zod'

const phoneRegex = /^\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/

/**
 * Contact form validation schema.
 * Used with React Hook Form + zodResolver for inline validation.
 */
export const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(phoneRegex, 'Please enter a valid phone number (e.g., 555-123-4567)'),
  address: z.string().optional(),
  service: z.string().min(1, 'Please select a service'),
  referral: z.string().optional(),
  message: z.string().optional(),
  _gotcha: z.string().optional(),
})

export type ContactFormData = z.infer<typeof contactSchema>

/**
 * Booking form validation schema.
 * Includes date and time range fields for appointment scheduling.
 */
export const bookingSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(phoneRegex, 'Please enter a valid phone number (e.g., 555-123-4567)'),
  address: z.string().optional(),
  preferredDate: z.string().min(1, 'Please select a date'),
  preferredTime: z.string().min(1, 'Please select a time'),
  service: z.string().min(1, 'Please select a service'),
  notes: z.string().optional(),
  _gotcha: z.string().optional(),
})

export type BookingFormData = z.infer<typeof bookingSchema>
