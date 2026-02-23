import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Send } from 'lucide-react'
import { contactSchema, type ContactFormData } from '../../lib/schemas'
import { submitForm } from '../../lib/form-handler'
import { services } from '../../config'
import { forms } from '../../config/forms'

const serviceOptions = [
  ...services.map((s) => s.navLabel),
  'Free Roof Inspection',
  'Insurance Claim Help',
  'Other',
]

const referralOptions = [
  'Google Search',
  'Facebook',
  'Friend/Family Referral',
  'Saw work in neighborhood',
  'Door knock',
  'Other',
]

const { fields } = forms.contact

const inputClasses =
  'w-full px-4 py-3 bg-surface border border-border rounded-xl text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all'
const selectClasses =
  'w-full px-4 py-3 bg-surface border border-border rounded-xl text-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all'
const labelClasses = 'block text-sm font-medium text-navy mb-1'
const errorClasses = 'text-red-600 text-sm mt-1'

export default function ContactForm() {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: 'onTouched',
  })

  const onSubmit = async (data: ContactFormData) => {
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
      <h2 className="text-2xl font-bold text-navy mb-2">{forms.contact.heading}</h2>
      <p className="text-text-secondary mb-6">{forms.contact.subheading}</p>

      {/* First Name / Last Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className={labelClasses}>
            {fields.firstName.label} *
          </label>
          <input
            id="firstName"
            type="text"
            {...register('firstName')}
            placeholder={fields.firstName.placeholder}
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            className={inputClasses}
          />
          {errors.firstName && (
            <p id="firstName-error" role="alert" className={errorClasses}>
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="lastName" className={labelClasses}>
            {fields.lastName.label} *
          </label>
          <input
            id="lastName"
            type="text"
            {...register('lastName')}
            placeholder={fields.lastName.placeholder}
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            className={inputClasses}
          />
          {errors.lastName && (
            <p id="lastName-error" role="alert" className={errorClasses}>
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      {/* Email / Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className={labelClasses}>
            {fields.email.label} *
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            placeholder={fields.email.placeholder}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={inputClasses}
          />
          {errors.email && (
            <p id="email-error" role="alert" className={errorClasses}>
              {errors.email.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="phone" className={labelClasses}>
            {fields.phone.label} *
          </label>
          <input
            id="phone"
            type="tel"
            {...register('phone')}
            placeholder={fields.phone.placeholder}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            className={inputClasses}
          />
          {errors.phone && (
            <p id="phone-error" role="alert" className={errorClasses}>
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className={labelClasses}>
          {fields.address.label}
        </label>
        <input
          id="address"
          type="text"
          {...register('address')}
          placeholder={fields.address.placeholder}
          className={inputClasses}
        />
      </div>

      {/* Service / Referral */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="service" className={labelClasses}>
            {fields.service.label} *
          </label>
          <select
            id="service"
            {...register('service')}
            aria-invalid={!!errors.service}
            aria-describedby={errors.service ? 'service-error' : undefined}
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
            <p id="service-error" role="alert" className={errorClasses}>
              {errors.service.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="referral" className={labelClasses}>
            {fields.referral.label}
          </label>
          <select
            id="referral"
            {...register('referral')}
            className={selectClasses}
          >
            <option value="">{fields.referral.placeholder}</option>
            {referralOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className={labelClasses}>
          {fields.message.label}
        </label>
        <textarea
          id="message"
          rows={4}
          {...register('message')}
          placeholder={fields.message.placeholder}
          className={`${inputClasses} resize-none`}
        />
      </div>

      {/* Honeypot — hidden from users and screen readers, visible to bots */}
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
        <Send className="w-4 h-4" />
        {isSubmitting ? forms.contact.submittingText : forms.contact.submitText}
      </button>
    </form>
  )
}
