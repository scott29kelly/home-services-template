# Home Services Website Template

A modern, conversion-optimized website template for roofing, siding, and home services contractors. Built with React 19, Vite, TypeScript, and Tailwind CSS v4. Includes an AI-powered chat assistant (Ava).

## Quick Start

```bash
npm install
npm run dev        # Start dev server at http://localhost:5173
npm run build      # Production build → dist/
npm run preview    # Preview production build
```

## Customization

### 1. Edit `src/config/site.ts`

This is the **single source of truth** for your company info. Update it with your:

- Company name & tagline
- Phone number, email, address
- Office hours
- Service areas (states & cities)
- Certifications
- Stats (homes restored, years experience, etc.)
- Social media links
- AI assistant name & greetings

All components import from this file, so most branding changes only require editing this one file.

### 2. Replace Images

Replace the placeholder images in `/images/`:

| Image | Size | Purpose |
|-------|------|---------|
| `hero-roofing.webp` | 1920x1080 | Homepage hero |
| `about-hero.webp` | 1920x1080 | About page hero |
| `contact-hero.webp` | 1920x1080 | Contact page hero |
| `project-1.webp` – `project-10.webp` | 800x600 | Project gallery |
| `testimonial-1.webp` – `testimonial-8.webp` | 400x400 | Customer photos |
| `team-*.webp` | 400x400 | Team headshots |
| `avatar-ava.webp` | 80x80 | Chat assistant avatar (small) |
| `avatar-ava-large.webp` | 200x200 | Chat assistant avatar (large) |

Provide both `.webp` and `.jpg` versions for browser compatibility.

### 3. Set Up Ava AI Assistant

The AI chat assistant uses [Groq](https://console.groq.com/) (free tier available):

1. Get a free API key at https://console.groq.com/keys
2. Set the environment variable `GROQ_API_KEY` in your hosting provider (e.g., Vercel environment variables)
3. The chat will work in demo mode (canned responses) if no API key is configured

The system prompt is in `api/chat.js` — customize it with your company details.

### 4. Update Content

- **Testimonials**: Edit quotes in `src/pages/TestimonialsPage.tsx` and `src/components/sections/Testimonials.tsx`
- **Team**: Edit team members in `src/pages/About.tsx` (look for `// TODO: Replace with your team`)
- **Service Areas**: Edit states/cities in `src/config/site.ts` under `serviceArea`
- **Projects**: Edit project data in `src/pages/Projects.tsx`
- **FAQs**: Edit FAQ content in individual page files

## Tech Stack

- **React 19** with React Router 7
- **Vite 7** for fast builds
- **Tailwind CSS v4** with custom theme tokens
- **Framer Motion** for animations
- **Lucide React** for icons
- **TypeScript** for type safety

## Project Structure

```
src/
├── config/site.ts          # Central configuration (edit this!)
├── pages/                  # Route pages
├── components/
│   ├── layout/             # Header, Footer, Layout
│   ├── sections/           # Reusable page sections
│   └── ui/                 # UI components (Button, Card, AvaWidget)
├── lib/api.ts              # Chat API client
└── hooks/                  # Custom React hooks

api/
├── chat.js                 # Vercel serverless function (Groq)
├── worker.js               # Cloudflare Worker (Anthropic)
└── worker-groq.js          # Cloudflare Worker (Groq)
```

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Set `GROQ_API_KEY` in Vercel → Settings → Environment Variables.

### Other Hosts

Run `npm run build` and deploy the `dist/` folder to any static host. The AI chat requires a serverless backend — use the `api/` files for Vercel or Cloudflare Workers.

## Theme Tokens

Colors are defined in `src/index.css` via Tailwind v4 `@theme`:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-navy` | `#0F172A` | Primary text, dark backgrounds |
| `--color-brand-blue` | `#0EA5E9` | Accent, links, interactive elements |
| `--color-safety-orange` | `#F97316` | CTAs, highlights |
| `--color-surface` | `#F8FAFC` | Light backgrounds |
| `--color-border` | `#E2E8F0` | Borders, dividers |

## License

MIT — use this template for any project.
