/**
 * Service area configuration.
 */
export const serviceAreas = {
  summary: 'Serving the Greater Metro Area',
  states: [
    {
      name: 'Texas',
      badge: 'HQ' as string | undefined,
      areas: [
        'Anytown (HQ)', 'Springfield', 'Riverside', 'Fairview',
        'Madison', 'Georgetown', 'Lakewood', 'Cedar Park',
      ],
    },
    {
      name: 'Oklahoma',
      badge: undefined as string | undefined,
      areas: [
        'Tulsa', 'Norman', 'Edmond', 'Broken Arrow',
        'Lawton', 'Moore', 'Stillwater', 'Midwest City',
      ],
    },
  ],
}
