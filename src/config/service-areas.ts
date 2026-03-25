/**
 * Service area configuration.
 * Exports both the new CityConfig array (for city pages) and the legacy serviceAreas
 * shape (for backward compatibility with ServiceAreas index page and SITE object).
 */

/* ── CityConfig interface ─────────────────────────────────────────── */

export interface CityConfig {
  /** URL slug: 'anytown' → /service-areas/anytown */
  slug: string
  /** Display name: 'Anytown' */
  name: string
  /** State abbreviation: 'TX' */
  state: string
  /** Unique 2-3 sentence description with LOCAL context */
  description: string
  /** Override: defaults to '{name} Roofing & Siding | {company}' */
  metaTitle?: string
  /** Override: falls back to description.slice(0, 160) */
  metaDescription?: string
  /** Slugs of nearby cities for internal linking */
  nearby: string[]
  /** City-specific FAQs (2-3 per city) */
  faqs?: { question: string; answer: string }[]
  /** Marks headquarters city */
  isHQ?: boolean
}

/* ── City pages array ─────────────────────────────────────────────── */

export const cityPages: CityConfig[] = [
  /* ── Texas Cities ──────────────────────────────────────────────── */
  {
    slug: 'anytown',
    name: 'Anytown',
    state: 'TX',
    isHQ: true,
    description:
      'As our hometown and headquarters, Anytown holds a special place in everything we do. We\'ve served this community for over a decade, building lasting relationships with homeowners in every neighborhood from Downtown to the Oak Meadows subdivision. Being locally owned means you\'ll see our trucks on your block and our team at your local hardware store.',
    nearby: ['springfield', 'fairview', 'madison', 'riverside'],
    faqs: [
      {
        question: 'What roofing services do you offer in Anytown?',
        answer:
          'As our headquarters city, we offer our full range of services in Anytown — including roof replacement, storm damage repair, siding installation, and insurance claim assistance. Anytown homeowners also benefit from same-day emergency response times since our crews are based here.',
      },
      {
        question: 'Do you offer free inspections in the Anytown area?',
        answer:
          'Yes, we offer free roof and siding inspections throughout Anytown and the surrounding neighborhoods. After the severe hail seasons we\'ve seen in recent years, many Anytown homeowners have discovered damage they didn\'t know they had. We\'ll walk your roof and document everything at no charge.',
      },
      {
        question: 'How long has your company been serving Anytown?',
        answer:
          'We\'ve been based in Anytown for over ten years. Our team has completed hundreds of roofing and siding projects right here in town, and many of our employees live in the same neighborhoods we serve.',
      },
    ],
  },
  {
    slug: 'springfield',
    name: 'Springfield',
    state: 'TX',
    description:
      'Springfield is one of the fastest-growing communities in the region, with new developments like Willow Creek Estates and Heritage Pointe bringing hundreds of new families to the area every year. New construction means new roofs — and our team understands the specific building codes, materials, and HOA requirements that Springfield\'s growing subdivisions demand.',
    nearby: ['anytown', 'cedar-park', 'fairview', 'madison'],
    faqs: [
      {
        question: 'What roofing services do you offer in Springfield?',
        answer:
          'We provide complete roofing services in Springfield including new roof installation, storm damage repair, and insurance claims assistance. Springfield\'s rapid growth means we work frequently with builders and homeowners on both new construction and existing homes across communities like Willow Creek Estates.',
      },
      {
        question: 'How do I file an insurance claim for storm damage in Springfield?',
        answer:
          'Springfield\'s storm season typically peaks in spring, and hail and wind damage are common in newer subdivisions where trees are still young and can\'t buffer gusts. We\'ll inspect your property, document the damage, and work directly with your insurance adjuster on your behalf.',
      },
      {
        question: 'Do you work with Springfield HOA requirements?',
        answer:
          'Absolutely. Many Springfield neighborhoods have HOA requirements for roofing materials, colors, and installation standards. We\'re familiar with the most common HOA guidelines in Springfield subdivisions and will ensure your new roof or siding meets all specifications.',
      },
    ],
  },
  {
    slug: 'riverside',
    name: 'Riverside',
    state: 'TX',
    description:
      'Riverside sits along the banks of the Elm Fork River, and the moisture and humidity that come with riverside living take a unique toll on roofing and siding materials. We\'ve completed hundreds of projects in Riverside where moisture infiltration, algae growth, and wood rot are common concerns for homeowners, especially in the older neighborhoods near the waterfront.',
    nearby: ['anytown', 'lakewood', 'pleasant-valley', 'fairview'],
    faqs: [
      {
        question: 'What roofing services do you offer in Riverside?',
        answer:
          'In Riverside, we specialize in moisture-resistant roofing systems ideal for the humid riverside climate. We frequently install algae-resistant shingles, proper ventilation systems, and water-resistant siding to address the unique challenges of living near the Elm Fork River.',
      },
      {
        question: 'Does the riverside climate cause extra roof wear in Riverside?',
        answer:
          'Yes — homes in Riverside experience higher humidity and moisture exposure than inland properties. This can accelerate shingle granule loss, cause wood decking to soften, and promote algae and moss growth. We recommend inspections every 2-3 years for Riverside homeowners and can treat roofs with algae-resistant coatings.',
      },
      {
        question: 'Do you offer free inspections in the Riverside area?',
        answer:
          'We offer free inspections throughout Riverside and the surrounding waterfront neighborhoods. We\'ll assess moisture damage, check flashing around chimneys and valleys, and provide a written report with our recommendations.',
      },
    ],
  },
  {
    slug: 'fairview',
    name: 'Fairview',
    state: 'TX',
    description:
      'Fairview is a rapidly developing suburb attracting growing families with its top-rated schools and planned communities. The mix of newer homes in The Meadows and Fairview Crossing alongside older established properties on the east side means our team handles everything from warranty-era repairs on 5-year-old roofs to full replacements on homes built in the 1980s.',
    nearby: ['anytown', 'springfield', 'riverside', 'madison'],
    faqs: [
      {
        question: 'What roofing services do you offer in Fairview?',
        answer:
          'Fairview homeowners can access our complete range of services including new roof installation, hail damage repair, siding replacement, and insurance claims assistance. We work in both the newer subdivisions like The Meadows and older established neighborhoods throughout Fairview.',
      },
      {
        question: 'How do I file an insurance claim for storm damage in Fairview?',
        answer:
          'Fairview homeowners frequently deal with hail damage during spring storm season. If you suspect damage, call us for a free inspection. We\'ll document the damage and guide you through the insurance claim process from start to finish, including meeting with your adjuster.',
      },
      {
        question: 'Do you offer free inspections in the Fairview area?',
        answer:
          'Yes, we provide free roof and siding inspections throughout Fairview. We\'re familiar with the common roofing systems used in Fairview\'s most popular subdivisions and can quickly identify whether damage warrants an insurance claim.',
      },
    ],
  },
  {
    slug: 'madison',
    name: 'Madison',
    state: 'TX',
    description:
      'Madison is an established community with mature trees lining streets like Elm Avenue and Oak Boulevard. While those towering oaks provide beautiful shade, they also create significant risk during storms — falling branches, accumulated leaf debris in valleys, and moss growth under canopies are common issues we address for Madison homeowners every season.',
    nearby: ['anytown', 'fairview', 'springfield', 'georgetown'],
    faqs: [
      {
        question: 'What roofing services do you offer in Madison?',
        answer:
          'We offer full roofing and siding services throughout Madison. Older homes in Madison\'s established neighborhoods often need complete roof replacements, updated flashing around chimneys, and improved attic ventilation — all of which we handle routinely in this area.',
      },
      {
        question: 'Do mature trees cause extra roofing problems in Madison?',
        answer:
          'Madison\'s beautiful tree canopy does create some unique challenges. We frequently service Madison homes with debris-clogged valleys, storm damage from falling branches, and algae or moss growth caused by persistent shade. We can clean, repair, or replace affected areas and recommend preventive treatments.',
      },
      {
        question: 'How do I file an insurance claim for storm damage in Madison?',
        answer:
          'Madison homeowners should inspect their property after every major storm, especially given the density of mature trees in the area. We offer free post-storm inspections and will help you navigate the claims process with your insurance company if damage is found.',
      },
    ],
  },
  {
    slug: 'georgetown',
    name: 'Georgetown',
    state: 'TX',
    description:
      'Georgetown blends historic charm with modern growth, and its downtown area is home to some of the oldest residential properties in the region. Many Georgetown homeowners are preserving century-old craftsman bungalows and Victorian-era homes, which require specialized knowledge of historic roofing materials, steep-pitch installation, and maintaining architectural character during restoration.',
    nearby: ['madison', 'anytown', 'cedar-park', 'summit-heights'],
    faqs: [
      {
        question: 'What roofing services do you offer in Georgetown?',
        answer:
          'Georgetown homeowners can count on us for everything from modern asphalt shingle installation to specialty work on historic properties. We\'ve replaced roofs on Georgetown homes dating back to the 1890s and understand how to match materials and profiles to preserve historic architecture.',
      },
      {
        question: 'Do you work on historic homes in Georgetown?',
        answer:
          'Yes — several members of our team have specific experience with Georgetown\'s historic districts. We understand the requirements for properties near the historic downtown and can recommend materials that maintain visual authenticity while providing modern weatherproofing performance.',
      },
      {
        question: 'Do you offer free inspections in the Georgetown area?',
        answer:
          'We offer free inspections throughout Georgetown. Older homes in the historic areas often have multiple roof systems layered on top of each other — we\'ll assess the full condition and advise on whether repair or full replacement makes the most sense.',
      },
    ],
  },
  {
    slug: 'lakewood',
    name: 'Lakewood',
    state: 'TX',
    description:
      'Lakewood is a sought-after waterfront community where homes along Lake Hartley face unique weathering challenges from constant wind off the water, elevated humidity, and the occasional severe storm system that tracks across the lake. Lakewood homeowners benefit from our expertise in moisture-resistant roofing systems designed for lakeside climates.',
    nearby: ['riverside', 'anytown', 'pleasant-valley', 'westfield'],
    faqs: [
      {
        question: 'What roofing services do you offer in Lakewood?',
        answer:
          'Lakewood homeowners trust us for roofing and siding solutions designed for high-moisture, high-wind lakeside environments. We install premium impact-resistant shingles, moisture barriers, and proper ventilation systems to handle the specific demands of Lake Hartley\'s climate.',
      },
      {
        question: 'Does lake proximity affect how quickly roofs wear in Lakewood?',
        answer:
          'Lakewood homes near the water experience accelerated wear from wind-driven rain, salt-like mineral deposits, and persistent humidity. We recommend annual inspections for waterfront properties and can apply protective treatments to extend the life of your roofing system.',
      },
      {
        question: 'Do you offer free inspections in the Lakewood area?',
        answer:
          'Yes, we provide free inspections for Lakewood homeowners. We pay special attention to ridge caps, flashing, and soffits — the areas most vulnerable to lake wind and moisture — and provide a detailed written assessment.',
      },
    ],
  },
  {
    slug: 'cedar-park',
    name: 'Cedar Park',
    state: 'TX',
    description:
      'Cedar Park has transformed from a small bedroom community into one of the most dynamic suburbs in the state, with master-planned neighborhoods like North Park and Cedar Ridge adding thousands of new homes each year. We work closely with Cedar Park homeowners who need roofing and siding on everything from brand-new builds to properties approaching their first major replacement cycle.',
    nearby: ['springfield', 'georgetown', 'anytown', 'summit-heights'],
    faqs: [
      {
        question: 'What roofing services do you offer in Cedar Park?',
        answer:
          'We offer complete roofing and siding services throughout Cedar Park. The area\'s explosive growth means we handle a high volume of new-construction warranty work and early-replacement projects. We\'re experienced with the builder-grade roofing systems common in Cedar Park\'s newer subdivisions.',
      },
      {
        question: 'How do I file an insurance claim for storm damage in Cedar Park?',
        answer:
          'Cedar Park\'s newer homes are not immune to storm damage — hail and high winds affect new and old roofs alike. We offer free post-storm inspections and will document damage thoroughly to support your insurance claim.',
      },
      {
        question: 'Do you offer free inspections in the Cedar Park area?',
        answer:
          'Absolutely. We inspect Cedar Park properties regularly and can advise on both warranty-related concerns and standard wear and tear. Many Cedar Park homeowners are surprised to learn their builder-grade roofing systems show significant wear by the 8-10 year mark.',
      },
    ],
  },
  {
    slug: 'oak-ridge',
    name: 'Oak Ridge',
    state: 'TX',
    description:
      'Oak Ridge is a wooded enclave where the dense tree coverage creates a naturally shaded environment that residents love — but it also accelerates roof aging through persistent moisture, fallen branches, and leaf debris that clogs gutters and holds moisture against roofing materials. We serve Oak Ridge homeowners who need proactive maintenance as much as storm repair.',
    nearby: ['madison', 'anytown', 'westfield', 'pleasant-valley'],
    faqs: [
      {
        question: 'What roofing services do you offer in Oak Ridge?',
        answer:
          'Oak Ridge homeowners benefit from our full range of services including roof replacement, debris damage repair, gutter system upgrades, and preventive maintenance programs. The wooded setting means we encounter a lot of branch damage and moisture-accelerated wear in Oak Ridge.',
      },
      {
        question: 'Do overhanging trees cause roofing problems in Oak Ridge?',
        answer:
          'Oak Ridge\'s wooded character is beautiful, but overhanging branches do accelerate roof wear. We frequently remove debris-trapped moisture damage, replace sections damaged by fallen limbs, and can install gutter guards to reduce clogging from leaf accumulation.',
      },
      {
        question: 'Do you offer free inspections in the Oak Ridge area?',
        answer:
          'Yes, we offer free inspections throughout Oak Ridge. We pay particular attention to areas under heavy tree canopy where debris accumulation and persistent shade create the most risk for premature aging.',
      },
    ],
  },
  {
    slug: 'westfield',
    name: 'Westfield',
    state: 'TX',
    description:
      'Westfield sits on the open plains west of the metro area, where there are few natural windbreaks and storm systems roll across the flatlands with sustained force. Westfield homeowners regularly face high-wind damage, wind-driven rain intrusion, and severe hail events — making impact-resistant roofing systems an especially smart investment in this community.',
    nearby: ['lakewood', 'oak-ridge', 'pleasant-valley', 'anytown'],
    faqs: [
      {
        question: 'What roofing services do you offer in Westfield?',
        answer:
          'Westfield homeowners face some of the most severe wind and hail exposure in our service area. We specialize in impact-resistant shingles rated for Class 4 hail resistance and high-wind installation techniques for Westfield properties on the open plains.',
      },
      {
        question: 'How do I file an insurance claim for storm damage in Westfield?',
        answer:
          'Westfield properties face frequent storm damage due to their exposure on the open plains. We offer free post-storm inspections and have extensive experience documenting wind and hail damage for insurance claims in the Westfield area.',
      },
      {
        question: 'Are impact-resistant shingles worth it in Westfield?',
        answer:
          'For Westfield homeowners, impact-resistant shingles are often one of the best investments you can make. Many insurance companies offer premium discounts for Class 4 rated roofing systems, and the durability savings over time are significant given how frequently Westfield experiences severe weather.',
      },
    ],
  },
  {
    slug: 'summit-heights',
    name: 'Summit Heights',
    state: 'TX',
    description:
      'Summit Heights occupies elevated terrain north of the valley, and homes here sit higher than the surrounding landscape — which means they\'re more exposed to hail, direct wind impact, and lightning during severe storms. Summit Heights homeowners have come to rely on us for rapid post-storm assessment and durable roofing systems built for elevated exposure.',
    nearby: ['georgetown', 'cedar-park', 'anytown', 'madison'],
    faqs: [
      {
        question: 'What roofing services do you offer in Summit Heights?',
        answer:
          'Summit Heights homeowners trust us for impact-resistant roofing systems designed for elevated terrain. We offer full roof replacement, hail damage repair, insurance claims assistance, and siding services throughout Summit Heights.',
      },
      {
        question: 'Does elevated terrain increase storm damage risk in Summit Heights?',
        answer:
          'Yes — Summit Heights properties are among the most exposed in our service area. Higher elevation means more direct hail impact, stronger wind speeds, and greater lightning risk. We strongly recommend Class 4 impact-resistant shingles for Summit Heights homeowners.',
      },
      {
        question: 'Do you offer free inspections in the Summit Heights area?',
        answer:
          'We offer free inspections throughout Summit Heights, especially after major storm events. Our team is familiar with the exposure patterns unique to elevated properties and can quickly identify wind-driven damage that standard inspections might miss.',
      },
    ],
  },
  {
    slug: 'pleasant-valley',
    name: 'Pleasant Valley',
    state: 'TX',
    description:
      'Pleasant Valley lives up to its name as one of the most family-friendly communities in the region, with well-maintained parks, strong HOA standards, and streets lined with young trees. HOA requirements here are among the strictest we work with, and we\'ve developed strong familiarity with Pleasant Valley\'s approved material lists and color palettes to make the approval process seamless for homeowners.',
    nearby: ['riverside', 'lakewood', 'westfield', 'oak-ridge'],
    faqs: [
      {
        question: 'What roofing services do you offer in Pleasant Valley?',
        answer:
          'We serve Pleasant Valley homeowners with full roofing and siding services, with particular expertise in meeting the neighborhood\'s HOA requirements. From material selection to color approval, we guide Pleasant Valley homeowners through every step of the HOA submission process.',
      },
      {
        question: 'How do HOA requirements affect roofing in Pleasant Valley?',
        answer:
          'Pleasant Valley\'s HOA has specific requirements for roofing materials, colors, and installation standards. We\'ve completed many projects in Pleasant Valley and are familiar with the approved vendor lists and submission timelines. We handle the HOA paperwork as part of our standard project process.',
      },
      {
        question: 'Do you offer free inspections in the Pleasant Valley area?',
        answer:
          'Yes, we offer free inspections in Pleasant Valley. We\'ll assess your current roof condition and advise on whether repair or replacement is needed, taking HOA guidelines into account from the start of our recommendation.',
      },
    ],
  },

  /* ── Oklahoma Cities ────────────────────────────────────────────── */
  {
    slug: 'tulsa',
    name: 'Tulsa',
    state: 'OK',
    description:
      'Tulsa sits at the heart of Tornado Alley, and the metro area experiences some of the most severe weather patterns in the country — from EF-3 tornadoes to baseball-sized hail events. Tulsa homeowners in neighborhoods like South Tulsa, Midtown, and Jenks-adjacent communities count on us for rapid storm response and the kind of insurance claim expertise that comes from years of working in high-frequency storm markets.',
    nearby: ['broken-arrow', 'owasso', 'norman', 'edmond'],
    faqs: [
      {
        question: 'What roofing services do you offer in Tulsa?',
        answer:
          'We provide comprehensive roofing and siding services throughout the Tulsa metro area. Given Tulsa\'s position in Tornado Alley, we specialize in storm damage repair, impact-resistant roofing systems, and insurance claims assistance for both residential and light commercial properties.',
      },
      {
        question: 'How do I file an insurance claim for storm damage in Tulsa?',
        answer:
          'Tulsa homeowners face storm damage frequently, and insurance claim navigation is one of our core competencies in this market. We offer free inspections, document all damage with photos and written reports, and work directly with your adjuster to ensure fair claim resolution.',
      },
      {
        question: 'Are there areas of Tulsa more prone to storm damage?',
        answer:
          'Storm paths in the Tulsa metro tend to track from southwest to northeast, putting areas like South Tulsa, East Tulsa, and communities near the Arkansas River at elevated risk during peak storm season. Regardless of your neighborhood, we recommend annual inspections given Tulsa\'s storm frequency.',
      },
    ],
  },
  {
    slug: 'norman',
    name: 'Norman',
    state: 'OK',
    description:
      'Norman is home to the University of Oklahoma and sits squarely within one of the most tornado-prone corridors in the United States. The mix of student rentals, young families in neighborhoods like Greens Creek and Lake Thunderbird Estates, and longtime residents in older campus-area homes means we serve an exceptionally diverse range of property types and owner needs in Norman.',
    nearby: ['moore', 'midwest-city', 'edmond', 'lawton'],
    faqs: [
      {
        question: 'What roofing services do you offer in Norman?',
        answer:
          'We offer full roofing and siding services throughout Norman. The OU campus area has a high concentration of older homes that need complete roofing system overhauls, while newer Norman subdivisions frequently need storm damage repairs after severe weather events.',
      },
      {
        question: 'How do I file an insurance claim for storm damage in Norman?',
        answer:
          'Norman sits in one of Oklahoma\'s most active storm corridors, and hail and tornado damage are common insurance claim events. We provide free inspections, thorough damage documentation, and direct coordination with your insurance carrier to help Norman homeowners get fair settlements.',
      },
      {
        question: 'Do you work on rental properties near the OU campus?',
        answer:
          'Yes — we work with property managers and individual landlords throughout the Norman campus area. Rental properties often have deferred maintenance, and we can prioritize safety-critical repairs while helping owners plan longer-term roofing and siding replacement schedules.',
      },
    ],
  },
  {
    slug: 'edmond',
    name: 'Edmond',
    state: 'OK',
    description:
      'Edmond is one of Oklahoma\'s most affluent communities, known for the upscale neighborhoods of Gaillardia, The Greens at Hafer, and Grayhawk. Edmond homeowners expect premium materials, meticulous craftsmanship, and the kind of attention to curb appeal detail that protects their significant investment — and we deliver exactly that on every Edmond project.',
    nearby: ['midwest-city', 'broken-arrow', 'stillwater', 'norman'],
    faqs: [
      {
        question: 'What roofing services do you offer in Edmond?',
        answer:
          'Edmond homeowners trust us for premium roofing and siding installations that match the quality standards of Edmond\'s upscale communities. We offer designer shingle options, architectural metal roofing, and premium siding systems in the material grades and color palettes Edmond neighborhoods demand.',
      },
      {
        question: 'What premium roofing options do you offer for Edmond homes?',
        answer:
          'For Edmond\'s higher-end properties, we offer a full range of premium products including CertainTeed Landmark Pro and Presidential Shake shingles, standing seam metal roofing, and James Hardie fiber cement siding. We\'ll provide samples and renderings to help you choose the ideal system for your home.',
      },
      {
        question: 'Do you offer free inspections in the Edmond area?',
        answer:
          'Yes, we offer free inspections throughout Edmond. We treat every Edmond property with the same care and discretion we\'d want for our own homes, and we provide detailed written reports with our recommendations before any work begins.',
      },
    ],
  },
  {
    slug: 'broken-arrow',
    name: 'Broken Arrow',
    state: 'OK',
    description:
      'Broken Arrow has been one of Oklahoma\'s fastest-growing cities for over a decade, with an explosive mix of new subdivisions in the south end of the city and aging mid-century homes in the established Rose District and older north-side neighborhoods. We\'re uniquely positioned to serve Broken Arrow\'s full range — from new construction roofing warranties to complete tear-off replacements on 30-year-old ranch homes.',
    nearby: ['tulsa', 'edmond', 'stillwater', 'moore'],
    faqs: [
      {
        question: 'What roofing services do you offer in Broken Arrow?',
        answer:
          'We service all of Broken Arrow from the historic Rose District to the newest south-side subdivisions. Our Broken Arrow services include full roof replacement, storm damage repair, new construction roofing, siding installation, and insurance claims assistance.',
      },
      {
        question: 'How do I file an insurance claim for storm damage in Broken Arrow?',
        answer:
          'Broken Arrow experiences significant storm activity as part of the Tulsa metro area. We offer free post-storm inspections and handle all aspects of the insurance claims process, from initial documentation to final adjuster coordination, for Broken Arrow homeowners.',
      },
      {
        question: 'Do you work in the newer Broken Arrow subdivisions?',
        answer:
          'Yes — we work extensively in newer Broken Arrow developments. Builder-grade roofing systems in newer subdivisions often reach their first replacement cycle sooner than homeowners expect, and we help Broken Arrow homeowners upgrade to longer-lasting systems when the time comes.',
      },
    ],
  },
  {
    slug: 'lawton',
    name: 'Lawton',
    state: 'OK',
    description:
      'Lawton is home to Fort Sill and a large military community that demands reliable, efficient service with minimal disruption to busy households. We understand the unique needs of military families — including tight timelines when PCS orders arrive and the importance of having thorough documentation for on-base housing allowance purposes — and we\'ve built our Lawton service model around those realities.',
    nearby: ['norman', 'moore', 'midwest-city', 'stillwater'],
    faqs: [
      {
        question: 'What roofing services do you offer in Lawton?',
        answer:
          'We provide complete roofing and siding services throughout Lawton and the Fort Sill area. We understand the needs of military families and offer flexible scheduling, clear written contracts, and thorough documentation packages suitable for BAH and military housing program requirements.',
      },
      {
        question: 'Do you work with military families on PCS timelines in Lawton?',
        answer:
          'Absolutely. We\'ve developed efficient project scheduling for Lawton military families who are working around PCS move dates. We can typically complete roof replacements in 1-2 days and prioritize Lawton projects with urgent timelines.',
      },
      {
        question: 'How do I file an insurance claim for storm damage in Lawton?',
        answer:
          'Lawton experiences extreme weather including severe hail, tornadoes, and powerful wind events. We offer free inspections and complete insurance claims assistance for Lawton homeowners, including detailed documentation packages for insurance carriers.',
      },
    ],
  },
  {
    slug: 'moore',
    name: 'Moore',
    state: 'OK',
    description:
      'Moore, Oklahoma became synonymous with tornado resilience after the devastating EF5 tornadoes that struck in 2003 and 2013. Today, Moore homeowners are among the most informed storm-recovery clients we work with — many have rebuilt once or twice and demand wind-rated, storm-resistant construction on every project. We bring the same commitment to resilience that Moore itself has shown.',
    nearby: ['norman', 'midwest-city', 'edmond', 'lawton'],
    faqs: [
      {
        question: 'What roofing services do you offer in Moore?',
        answer:
          'Moore homeowners deserve the most durable roofing systems available. We specialize in Class 4 impact-resistant shingles, high-wind installation methods, and storm-resistant siding systems throughout Moore. We also provide comprehensive insurance claims support for the frequent storm damage events Moore experiences.',
      },
      {
        question: 'What storm-resistant roofing options are available in Moore?',
        answer:
          'For Moore homeowners, we strongly recommend Class 4 impact-resistant shingles, fortified roof deck fastening schedules, and sealed roof deck systems. These upgrades meet IBHS FORTIFIED Home standards and can significantly reduce insurance premiums for Moore residents.',
      },
      {
        question: 'How do I file an insurance claim for storm damage in Moore?',
        answer:
          'Moore homeowners are no strangers to insurance claims, and we support every phase of the process. From free initial inspections to adjuster meetings and final project completion documentation, we\'ve guided hundreds of Moore families through successful insurance-funded roof replacements.',
      },
    ],
  },
  {
    slug: 'stillwater',
    name: 'Stillwater',
    state: 'OK',
    description:
      'Stillwater is the home of Oklahoma State University, and its mix of student rentals, faculty housing, and longtime family residences creates a diverse housing stock with varying maintenance histories. OSU game weekends bring tens of thousands of visitors to Stillwater, and we take pride in ensuring the community\'s homes look as good as its university facilities.',
    nearby: ['edmond', 'broken-arrow', 'lawton', 'norman'],
    faqs: [
      {
        question: 'What roofing services do you offer in Stillwater?',
        answer:
          'We provide full roofing and siding services throughout Stillwater. The university community means we work with a wide range of properties — from aging faculty homes near campus to newer student housing developments south of town and established residential neighborhoods to the north.',
      },
      {
        question: 'Do you work on rental properties in Stillwater?',
        answer:
          'Yes — rental property maintenance is a significant part of our Stillwater business. We work with individual landlords and property management companies to keep Stillwater rental properties well-maintained. We can coordinate access around tenant schedules and provide detailed work documentation for property records.',
      },
      {
        question: 'How do I file an insurance claim for storm damage in Stillwater?',
        answer:
          'Stillwater homeowners deal with storm damage regularly given Oklahoma\'s severe weather patterns. We provide free inspections, thorough damage documentation, and direct insurance adjuster coordination for all Stillwater storm claims.',
      },
    ],
  },
  {
    slug: 'midwest-city',
    name: 'Midwest City',
    state: 'OK',
    description:
      'Midwest City grew up alongside Tinker Air Force Base and retains a strong military community character today. Neighborhoods like Del City Gardens and Spencer Heights have an older housing stock with mid-century ranch homes that are reaching or exceeding their original roofing and siding lifespans. We serve Midwest City homeowners who want quality replacements at fair prices, delivered with the reliability military families expect.',
    nearby: ['moore', 'norman', 'edmond', 'broken-arrow'],
    faqs: [
      {
        question: 'What roofing services do you offer in Midwest City?',
        answer:
          'Midwest City homeowners can count on our full range of services including roof replacement, storm damage repair, siding installation, and insurance claims assistance. Many Midwest City homes are approaching 30-40 years old and are prime candidates for full roofing system replacements.',
      },
      {
        question: 'Do you serve military families near Tinker AFB in Midwest City?',
        answer:
          'Absolutely. We have significant experience serving military families in the Midwest City and Tinker AFB area. We offer flexible scheduling, clear written estimates, and thorough project documentation suitable for military housing program requirements.',
      },
      {
        question: 'How do I file an insurance claim for storm damage in Midwest City?',
        answer:
          'Midwest City experiences frequent storm damage as part of the Oklahoma City metro area. We provide free post-storm inspections and guide Midwest City homeowners through the complete insurance claims process from damage documentation to final settlement.',
      },
    ],
  },
]

/* ── Backward-compatible serviceAreas export ──────────────────────── */
// Keep for ServiceAreas.tsx index page and site.ts backward compatibility

export const serviceAreas = {
  summary: 'Serving the Greater Metro Area',
  states: [
    {
      name: 'Texas',
      badge: 'HQ' as string | undefined,
      areas: cityPages.filter(c => c.state === 'TX').map(c => c.name + (c.isHQ ? ' (HQ)' : '')),
    },
    {
      name: 'Oklahoma',
      badge: undefined as string | undefined,
      areas: cityPages.filter(c => c.state === 'OK').map(c => c.name),
    },
  ],
}

/* ── Helper function ──────────────────────────────────────────────── */

export function getCityBySlug(slug: string): CityConfig | undefined {
  return cityPages.find(c => c.slug === slug)
}
