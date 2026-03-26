/**
 * Form configuration - submission settings, field definitions, and content.
 * Edit this file to customize form behavior, field labels, and thank-you page content.
 */
export const forms = {
  submission: {
    /** Shared lead capture endpoint for contact, booking, and Ava handoff flows. */
    endpoint: '/api/leads',
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
    subheading: 'Pick a date and choose from live appointment windows.',
    submitText: 'Confirm Appointment',
    submittingText: 'Confirming...',
    blockedDays: [0] as number[], // 0 = Sunday
    maxDaysOut: 60,
    availabilityHint: 'Select a day to see live openings. Saturday availability is limited.',
    availabilityLoadingText: 'Checking live availability...',
    availabilityEmptyText: 'No appointment windows are left for that day. Please choose another date.',
    timezoneNote: 'All appointment windows are shown in Eastern Time.',
  },

  thankYou: {
    heading: 'Thank You!',
    subheading: "We've received your request and a team member will be in touch shortly.",
    nextSteps: [
      "We'll review your information and call you within 24 hours.",
      'For emergencies, call us directly - we offer 24/7 emergency services.',
      'Check your email for a confirmation with next steps.',
    ],
  },
}
