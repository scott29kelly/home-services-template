/**
 * JsonLd — Injects JSON-LD structured data into the page.
 *
 * Sanitizes output to prevent XSS by replacing `<` with the Unicode
 * escape `\u003c` before setting innerHTML on the script tag.
 *
 * Usage:
 *   <JsonLd data={buildLocalBusinessSchema()} />
 *
 * Multiple JSON-LD blocks on the same page are valid per Google's spec.
 */
interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[]
}

export default function JsonLd({ data }: JsonLdProps) {
  // Sanitize to prevent XSS: replace < with Unicode escape
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}
