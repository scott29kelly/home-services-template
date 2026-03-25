import { useState } from 'react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { financing } from '../../config/financing'

const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const currencyFmtCents = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatCurrency(value: number): string {
  return Number.isInteger(value) ? currencyFmt.format(value) : currencyFmtCents.format(value)
}

/**
 * Standard amortization formula.
 * For 0% APR, returns principal / termMonths to avoid division-by-zero.
 */
function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number,
): number {
  if (annualRate === 0) return principal / termMonths
  const r = annualRate / 100 / 12
  const n = termMonths
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

export default function FinancingCalculator({ compact = false }: { compact?: boolean }) {
  const [loanAmount, setLoanAmount] = useState(financing.defaultLoanAmount)
  const { ref, isInView } = useScrollReveal()

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoanAmount(Number(e.target.value))
  }

  // Calculate the slider progress percentage for styling
  const sliderProgress =
    ((loanAmount - financing.minLoanAmount) /
      (financing.maxLoanAmount - financing.minLoanAmount)) *
    100

  const content = (
    <>
        {/* Loan Amount Slider */}
        <div
          className={`scroll-reveal ${isInView ? 'in-view' : ''} mb-12`}
        >
          <div className="flex items-center justify-between mb-4">
            <label
              htmlFor="loan-amount"
              className="text-lg font-semibold text-navy"
            >
              Project Amount
            </label>
            <span className="text-2xl sm:text-3xl font-bold text-brand-blue">
              {currencyFmt.format(loanAmount)}
            </span>
          </div>

          <input
            id="loan-amount"
            type="range"
            min={financing.minLoanAmount}
            max={financing.maxLoanAmount}
            step={financing.step}
            value={loanAmount}
            onChange={handleSliderChange}
            aria-valuemin={financing.minLoanAmount}
            aria-valuemax={financing.maxLoanAmount}
            aria-valuenow={loanAmount}
            aria-valuetext={currencyFmt.format(loanAmount)}
            className="financing-slider w-full h-3 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:ring-offset-2"
            style={{
              background: `linear-gradient(to right, var(--color-brand-blue) 0%, var(--color-brand-blue) ${sliderProgress}%, #e2e8f0 ${sliderProgress}%, #e2e8f0 100%)`,
            }}
          />

          <div className="flex justify-between mt-2 text-sm text-text-secondary">
            <span>{currencyFmt.format(financing.minLoanAmount)}</span>
            <span>{currencyFmt.format(financing.maxLoanAmount)}</span>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${compact ? '' : 'lg:grid-cols-4'} gap-4 lg:gap-6`}>
          {financing.options.map((option, i) => {
            const monthly = calculateMonthlyPayment(
              loanAmount,
              option.rate,
              option.termMonths,
            )
            const totalCost = monthly * option.termMonths
            const totalInterest = totalCost - loanAmount

            return (
              <div
                key={option.label}
                className={`scroll-reveal ${isInView ? 'in-view' : ''} relative rounded-2xl border p-6 transition-shadow hover:shadow-lg ${
                  option.featured
                    ? 'border-brand-blue bg-brand-blue/5 shadow-md ring-2 ring-brand-blue/20'
                    : 'border-border bg-white'
                }`}
                style={{ transitionDelay: `${0.1 + i * 0.08}s` }}
              >
                {option.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-blue text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Popular
                  </span>
                )}

                <h3 className="text-sm font-semibold text-text-secondary mb-1 mt-1">
                  {option.label}
                </h3>

                <p className={`${compact ? 'text-2xl' : 'text-3xl'} font-bold text-navy mb-1`}>
                  {formatCurrency(Math.round(monthly * 100) / 100)}
                  <span className="text-sm font-normal text-text-secondary">
                    /mo
                  </span>
                </p>

                <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Total Cost</span>
                    <span className="font-medium text-navy">
                      {formatCurrency(Math.round(totalCost))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Total Interest</span>
                    <span
                      className={`font-medium ${
                        totalInterest === 0 ? 'text-green-600' : 'text-navy'
                      }`}
                    >
                      {totalInterest === 0
                        ? '$0'
                        : formatCurrency(Math.round(totalInterest))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Term</span>
                    <span className="font-medium text-navy">
                      {option.termMonths} months
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">APR</span>
                    <span className="font-medium text-navy">
                      {option.rate === 0 ? '0%' : `${option.rate}%`}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Disclaimer */}
        <p
          className={`scroll-reveal ${isInView ? 'in-view' : ''} mt-8 text-xs text-text-secondary text-center max-w-2xl mx-auto`}
          style={{ transitionDelay: '0.5s' }}
        >
          {financing.disclaimer}
        </p>
    </>
  )

  if (compact) {
    return <div ref={ref as React.RefObject<HTMLDivElement>}>{content}</div>
  }

  return (
    <section className="py-20 lg:py-28" ref={ref as React.RefObject<HTMLElement>}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {content}
      </div>
    </section>
  )
}
