import { onCLS, onINP, onLCP, type Metric } from 'web-vitals'

function logMetric(metric: Metric): void {
  // Console-only reporting per CONTEXT.md decisions
  // Replace this function body with an analytics.track() call to forward to a backend
  if (import.meta.env.DEV) {
    console.groupCollapsed(
      `%c[Web Vitals] ${metric.name}: ${metric.value.toFixed(3)} — ${metric.rating}`,
      `color: ${metric.rating === 'good' ? 'green' : metric.rating === 'needs-improvement' ? 'orange' : 'red'}`
    )
    console.log(metric)
    console.groupEnd()
  } else {
    // In production: silent unless an analytics handler is wired up
    // Future: replace this no-op with an analytics.track() call
    void metric
  }
}

/**
 * Register Core Web Vitals observers.
 * Call once from main.tsx after render — never inside components.
 */
export function reportWebVitals(): void {
  onCLS(logMetric)
  onINP(logMetric)
  onLCP(logMetric)
}
