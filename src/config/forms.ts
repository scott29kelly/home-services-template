/**
 * Form configuration — submission settings, field definitions, and content.
 * Edit this file to customize form behavior, field labels, and thank-you page content.
 */
export const forms = {
  submission: {
    /** Form submission backend: 'formspree' | 'webhook' | 'netlify' | 'none' */
    provider: 'formspree' as 'formspree' | 'webhook' | 'netlify' | 'none',
    /** Formspree form ID (e.g., 'xwkgpqrd'). Leave empty to fall back to console.log. */
    formspreeId: '',
    /** Webhook URL for CRM integration (used when provider is 'webhook') */
    webhookUrl: '',
  },

  contact: {
    heading: 'Get Your Free Estimate',
    subheading: "Fill out the form below and we'll get back to you within 24 hours.",
    fields: {
      firstName: { label: 'First Name', placeholder: 'John', required: true },
      lastName: { label: 'Last Name', placeholder: 'Smith', required: true },
      email: { label: 'Email', placeholder: 'john@example.com', required: true },
      phone: { label: 'Phone', placeholder: '(555) 123-4567', required: true },
      address: { label: 'Property Address', placeholder: 'Street, City, State ZIP', required: false },
      service: { label: 'Service Needed', placeholder: 'Select a service', required: true },
      referral: { label: 'How did you hear about us?', placeholder: 'Select...', required: false },
      message: { label: 'Additional Details', placeholder: 'Tell us about your project...', required: false },
    },
    submitText: 'Send Message',
    submittingText: 'Sending...',
    successMessage: "Thank you! We'll be in touch within 24 hours.",
  },

  booking: {
    heading: 'Schedule an Inspection',
    subheading: "Pick a date and preferred time. We'll call to confirm.",
    submitText: 'Request Appointment',
    submittingText: 'Scheduling...',
    timeRanges: ['Morning (8am-12pm)', 'Afternoon (12pm-4pm)', 'Evening (4pm-7pm)'],
    blockedDays: [0] as number[], // 0 = Sunday
    maxDaysOut: 60,
  },

  thankYou: {
    heading: 'Thank You!',
    subheading: "We've received your request and a team member will be in touch shortly.",
    nextSteps: [
      "We'll review your information and call you within 24 hours.",
      'For emergencies, call us directly — we offer 24/7 emergency services.',
      'Check your email for a confirmation with next steps.',
    ],
  },
}
