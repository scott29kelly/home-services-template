import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useLocation, useSearchParams } from 'react-router'
import { CalendarCheck } from 'lucide-react'
import { bookingSchema, type BookingFormData } from '../../lib/schemas'
import { createBooking, fetchBookingAvailability, type BookingSlot } from '../../lib/booking-api'
import { services } from '../../config'
import { forms } from '../../config/forms'
import BookingCalendar from '../ui/BookingCalendar'
import {
  buildLeadMetadata,
  buildSubmissionSummary,
  persistLastSubmission,
} from '../../lib/attribution'
import { trackEvent } from '../../lib/analytics'

const serviceOptions = [
  ...services.map((s) => s.navLabel),
  'Free Roof Inspection',
  'Insurance Claim Help',
  'Other',
]

const { fields } = forms.contact // Reuse contact field config for shared fields

const inputClasses =
  'w-full px-4 py-3 bg-surface border border-border rounded-xl text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all'
const selectClasses =
  'w-full px-4 py-3 bg-surface border border-border rounded-xl text-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all'
const labelClasses = 'block text-sm font-medium text-navy mb-1'
const errorClasses = 'text-red-600 text-sm mt-1'

export default function BookingForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [availabilityState, setAvailabilityState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([])
  const startedTrackingRef = useRef(false)
  const initialService = searchParams.get('service') ?? ''
  const initialNotes = searchParams.get('message') ?? ''
  const sourceLabel = searchParams.get('source') ?? 'booking-form'

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    mode: 'onTouched',
    defaultValues: {
      preferredDate: '',
      preferredTime: '',
      service: serviceOptions.includes(initialService) ? initialService : '',
      notes: initialNotes,
    },
  })

  const watchedValues = watch()
  const selectedDate = watch('preferredDate')
  const selectedTime = watch('preferredTime')

  useEffect(() => {
    if (startedTrackingRef.current) return

    const hasStarted = Object.values(watchedValues).some((value) => Boolean(value))
    if (!hasStarted) return

    startedTrackingRef.current = true
    trackEvent('lead_form_started', {
      form_type: 'booking',
      source_label: sourceLabel,
      path: location.pathname,
    })
  }, [location.pathname, sourceLabel, watchedValues])

  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([])
      setAvailabilityError(null)
      setAvailabilityState('idle')
      return
    }

    let cancelled = false
    setValue('preferredTime', '', { shouldValidate: true })
    setAvailabilityState('loading')
    setAvailabilityError(null)

    void fetchBookingAvailability(selectedDate).then((result) => {
      if (cancelled) return

      if (!result.ok) {
        setAvailableSlots([])
        setAvailabilityState('error')
        setAvailabilityError(result.error)
        return
      }

      setAvailableSlots(result.slots)
      setAvailabilityState('ready')
      setAvailabilityError(result.message ?? null)
    })

    return () => {
      cancelled = true
    }
  }, [selectedDate, setValue])

  const onSubmit = async (data: BookingFormData) => {
    setSubmitError(null)
    const metadata = buildLeadMetadata({
      path: location.pathname + location.search,
      formType: 'booking',
      service: data.service,
      sourceLabel,
    })

    const result = await createBooking({
      ...data,
      ...metadata,
    })

    if (result.ok) {
      persistLastSubmission(buildSubmissionSummary({
        leadType: 'booking',
        submittedAt: metadata.submittedAt,
        service: data.service,
        sourceLabel,
        referenceCode: result.referenceCode,
        customerName: `${data.firstName} ${data.lastName}`.trim(),
        preferredDate: result.preferredDate,
        preferredTime: result.preferredTime,
        scheduledFor: result.scheduledFor,
        path: location.pathname + location.search,
      }))
      trackEvent('lead_form_submitted', {
        form_type: 'booking',
        service: data.service,
        source_label: sourceLabel,
        path: location.pathname,
      })
      navigate('/thank-you')
    } else {
      trackEvent('lead_form_submit_failed', {
        form_type: 'booking',
        source_label: sourceLabel,
        path: location.pathname,
      })
      setSubmitError(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <h2 className="text-2xl font-bold text-navy mb-2">{forms.booking.heading}</h2>
      <p className="text-text-secondary mb-6">{forms.booking.subheading}</p>

      {/* Date picker */}
      <div>
        <label className={labelClasses}>Inspection Date *</label>
        <BookingCalendar
          onSelect={(date) => {
            setValue('preferredDate', date, { shouldValidate: true })
          }}
          selectedDate={selectedDate || null}
        />
        <input type="hidden" {...register('preferredDate')} />
        {errors.preferredDate && (
          <p id="preferredDate-error" role="alert" className={errorClasses}>
            {errors.preferredDate.message}
          </p>
        )}
      </div>

      {/* Live appointment windows */}
      <div>
        <label className={labelClasses}>Live Appointment Window *</label>
        <p className="text-sm text-text-secondary mb-3">
          {forms.booking.timezoneNote}
        </p>

        {availabilityState === 'idle' && (
          <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-3 text-sm text-text-secondary">
            {forms.booking.availabilityHint}
          </div>
        )}

        {availabilityState === 'loading' && (
          <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
            {forms.booking.availabilityLoadingText}
          </div>
        )}

        {availabilityState === 'error' && availabilityError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {availabilityError}
          </div>
        )}

        {availabilityState === 'ready' && availableSlots.length === 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {availabilityError ?? forms.booking.availabilityEmptyText}
          </div>
        )}

        {availableSlots.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableSlots.map((slot) => {
              const isSelected = selectedTime === slot.label
              return (
                <button
                  key={slot.label}
                  type="button"
                  data-booking-slot="true"
                  onClick={() => {
                    setValue('preferredTime', slot.label, { shouldValidate: true })
                  }}
                  className={[
                    'rounded-xl border px-4 py-3 text-left transition-all',
                    isSelected
                      ? 'border-brand-blue bg-brand-blue/10 text-brand-blue ring-2 ring-brand-blue/30'
                      : 'border-border bg-surface text-navy hover:border-brand-blue/30 hover:bg-brand-blue/5',
                  ].join(' ')}
                >
                  <span className="block text-sm font-semibold">{slot.label}</span>
                  <span className="block text-xs text-text-secondary mt-1">
                    Available to confirm now
                  </span>
                </button>
              )
            })}
          </div>
        )}

        <input type="hidden" {...register('preferredTime')} />
        {errors.preferredTime && (
          <p id="preferredTime-error" role="alert" className={errorClasses}>
            {errors.preferredTime.message}
          </p>
        )}
      </div>

      {/* First Name / Last Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="booking-firstName" className={labelClasses}>
            {fields.firstName.label} *
          </label>
          <input
            id="booking-firstName"
            type="text"
            {...register('firstName')}
            placeholder={fields.firstName.placeholder}
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? 'booking-firstName-error' : undefined}
            className={inputClasses}
          />
          {errors.firstName && (
            <p id="booking-firstName-error" role="alert" className={errorClasses}>
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="booking-lastName" className={labelClasses}>
            {fields.lastName.label} *
          </label>
          <input
            id="booking-lastName"
            type="text"
            {...register('lastName')}
            placeholder={fields.lastName.placeholder}
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? 'booking-lastName-error' : undefined}
            className={inputClasses}
          />
          {errors.lastName && (
            <p id="booking-lastName-error" role="alert" className={errorClasses}>
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      {/* Email / Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="booking-email" className={labelClasses}>
            {fields.email.label} *
          </label>
          <input
            id="booking-email"
            type="email"
            {...register('email')}
            placeholder={fields.email.placeholder}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'booking-email-error' : undefined}
            className={inputClasses}
          />
          {errors.email && (
            <p id="booking-email-error" role="alert" className={errorClasses}>
              {errors.email.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="booking-phone" className={labelClasses}>
            {fields.phone.label} *
          </label>
          <input
            id="booking-phone"
            type="tel"
            {...register('phone')}
            placeholder={fields.phone.placeholder}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'booking-phone-error' : undefined}
            className={inputClasses}
          />
          {errors.phone && (
            <p id="booking-phone-error" role="alert" className={errorClasses}>
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      {/* Address */}
      <div>
        <label htmlFor="booking-address" className={labelClasses}>
          {fields.address.label}
        </label>
        <input
          id="booking-address"
          type="text"
          {...register('address')}
          placeholder={fields.address.placeholder}
          className={inputClasses}
        />
      </div>

      {/* Service */}
      <div>
        <label htmlFor="booking-service" className={labelClasses}>
          {fields.service.label} *
        </label>
        <select
          id="booking-service"
          {...register('service')}
          aria-invalid={!!errors.service}
          aria-describedby={errors.service ? 'booking-service-error' : undefined}
          className={selectClasses}
        >
          <option value="">{fields.service.placeholder}</option>
          {serviceOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {errors.service && (
          <p id="booking-service-error" role="alert" className={errorClasses}>
            {errors.service.message}
          </p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="booking-notes" className={labelClasses}>
          Additional Notes
        </label>
        <textarea
          id="booking-notes"
          rows={3}
          {...register('notes')}
          placeholder="Any gate codes, access notes, or details about the inspection..."
          className={`${inputClasses} resize-none`}
        />
      </div>

      {/* Honeypot -- hidden from users and screen readers, visible to bots */}
      <input
        {...register('_gotcha')}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}
      />

      {/* Submission error */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm" role="alert">
          {submitError}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-safety-orange to-orange-500 text-white font-semibold rounded-full shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <CalendarCheck className="w-4 h-4" />
        {isSubmitting ? forms.booking.submittingText : forms.booking.submitText}
      </button>
    </form>
  )
}
