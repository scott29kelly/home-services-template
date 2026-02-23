import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { CalendarCheck } from 'lucide-react'
import { bookingSchema, type BookingFormData } from '../../lib/schemas'
import { submitForm } from '../../lib/form-handler'
import { services } from '../../config'
import { forms } from '../../config/forms'
import BookingCalendar from '../ui/BookingCalendar'

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
  const [submitError, setSubmitError] = useState<string | null>(null)

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
    },
  })

  const selectedDate = watch('preferredDate')

  const onSubmit = async (data: BookingFormData) => {
    setSubmitError(null)
    const result = await submitForm(data as Record<string, unknown>)
    if (result.ok) {
      navigate('/thank-you')
    } else {
      setSubmitError(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <h2 className="text-2xl font-bold text-navy mb-2">{forms.booking.heading}</h2>
      <p className="text-text-secondary mb-6">{forms.booking.subheading}</p>

      {/* Date picker */}
      <div>
        <label className={labelClasses}>Preferred Date *</label>
        <BookingCalendar
          onSelect={(date) => {
            setValue('preferredDate', date, { shouldValidate: true })
          }}
          selectedDate={selectedDate || null}
        />
        {/* Hidden field for RHF registration */}
        <input type="hidden" {...register('preferredDate')} />
        {errors.preferredDate && (
          <p id="preferredDate-error" role="alert" className={errorClasses}>
            {errors.preferredDate.message}
          </p>
        )}
      </div>

      {/* Time range radio cards */}
      <div>
        <label className={labelClasses}>Preferred Time *</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {forms.booking.timeRanges.map((range) => {
            const isChecked = watch('preferredTime') === range
            return (
              <label
                key={range}
                className={[
                  'flex items-center justify-center px-4 py-3 rounded-xl border text-sm font-medium cursor-pointer transition-all',
                  isChecked
                    ? 'border-brand-blue bg-brand-blue/10 text-brand-blue ring-2 ring-brand-blue/30'
                    : 'border-border text-navy hover:border-brand-blue/30 hover:bg-brand-blue/5',
                ].join(' ')}
              >
                <input
                  type="radio"
                  value={range}
                  {...register('preferredTime')}
                  className="sr-only"
                />
                {range}
              </label>
            )
          })}
        </div>
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
          placeholder="Any details about the inspection or your availability..."
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
