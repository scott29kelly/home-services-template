/**
 * Financing options configuration.
 * Edit this file to customize loan amounts, rates, terms, and FAQ content.
 */
export const financing = {
  defaultLoanAmount: 15000,
  minLoanAmount: 5000,
  maxLoanAmount: 75000,
  step: 500,
  options: [
    { label: '0% for 12 Months', rate: 0, termMonths: 12, featured: true },
    { label: '5.99% for 60 Months', rate: 5.99, termMonths: 60, featured: false },
    { label: '7.99% for 84 Months', rate: 7.99, termMonths: 84, featured: false },
    { label: '9.99% for 120 Months', rate: 9.99, termMonths: 120, featured: false },
  ],
  disclaimer:
    'These are estimates only. Actual rates and terms depend on credit approval. Contact us for a personalized quote.',
  faqs: [
    {
      question: 'Do you offer financing?',
      answer:
        'Yes! We partner with leading home improvement lenders to offer flexible financing options for roofing, siding, and storm damage repairs.',
    },
    {
      question: 'What credit score do I need?',
      answer:
        "Financing options are available for a range of credit profiles. Contact us to discuss your specific situation and we'll find the best option for you.",
    },
    {
      question: 'How do I apply?',
      answer:
        "Contact us for a free estimate. Once you approve the project scope, we'll walk you through the financing application process, which typically takes just a few minutes.",
    },
    {
      question: 'Can I pay off early?',
      answer:
        'Yes, all our financing options allow early payoff with no prepayment penalties.',
    },
    {
      question: 'Is there a down payment required?',
      answer:
        'Most of our financing options require no money down. Your first payment is typically due 30 days after project completion.',
    },
  ],
}
