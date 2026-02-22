/**
 * Form configuration — field labels, placeholders, and validation messages.
 */
export const forms = {
  contact: {
    heading: 'Get Your Free Estimate',
    subheading: "Fill out the form below and we'll get back to you within 24 hours.",
    fields: {
      name: { label: 'Full Name', placeholder: 'John Smith' },
      email: { label: 'Email', placeholder: 'john@example.com' },
      phone: { label: 'Phone', placeholder: '(555) 123-4567' },
      service: { label: 'Service Needed', placeholder: 'Select a service' },
      message: { label: 'Message', placeholder: 'Tell us about your project...' },
    },
    submitText: 'Send Message',
    successMessage: 'Thank you! We\'ll be in touch within 24 hours.',
  },
}
