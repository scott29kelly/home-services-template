/**
 * Announcement banner configuration.
 *
 * The banner fetches data from an external CMS endpoint (Google Apps Script)
 * so business owners can toggle site-wide messages without code changes.
 */
export const banner = {
  /**
   * URL of the Google Apps Script web app that serves banner data as JSON.
   * Set to '' to disable external banner fetching (uses fallback only).
   *
   * Setup instructions for template developers:
   * 1. Create a Google Sheet with a "Banner" sheet tab
   * 2. Add rows: A1="enabled" B1=TRUE/FALSE, A2="text" B2="your message",
   *    A3="ctaText" B3="Call Now", A4="ctaHref" B4="tel:555-123-4567",
   *    A5="urgency" B5="high"/"medium"/"low"
   * 3. Open Extensions > Apps Script
   * 4. Paste the doGet function (see project README)
   * 5. Deploy > New deployment > Web app > Execute as: Me, Access: Anyone
   * 6. Paste the deployment URL here
   */
  endpoint: '',

  /** Fallback banner when endpoint is empty or fetch fails (for development/demo) */
  fallback: {
    enabled: false,
    text: '',
    ctaText: '',
    ctaHref: '',
    urgency: 'medium' as const,
  },

  /** Cache TTL in milliseconds (5 minutes default) */
  cacheTtl: 5 * 60 * 1000,
}
