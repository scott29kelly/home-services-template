# Coding Conventions

**Analysis Date:** 2026-02-21

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `Button.tsx`, `Hero.tsx`, `Header.tsx`)
- Pages: PascalCase (e.g., `Home.tsx`, `Contact.tsx`, `Services.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useScrollReveal.ts`)
- Utilities/Config: camelCase (e.g., `site.ts`, `api.ts`)
- Directories: camelCase (e.g., `components/`, `pages/`, `hooks/`, `lib/`)

**Functions:**
- Component functions: PascalCase (exported as default)
- Utility functions: camelCase
- Event handlers: camelCase with `handle` prefix (e.g., `handleKey`, `closeMobile`)
- Animation variants: camelCase (e.g., `container`, `item`, `demoResponses`)

**Variables:**
- State variables: camelCase (e.g., `mobileOpen`, `dropdownOpen`, `openIndex`)
- Constants (data): camelCase (e.g., `navLinks`, `testimonials`, `demoResponses`)
- Configuration objects: camelCase or SCREAMING_SNAKE_CASE for module exports (e.g., `SITE` config)

**Types:**
- Interfaces: PascalCase with suffix `Props` for component props (e.g., `ButtonProps`, `HeroProps`, `FAQProps`)
- Type aliases: PascalCase (e.g., `Variant`, `Size`, `Message`)
- Type unions for variants: PascalCase as strings (e.g., `'primary' | 'secondary' | 'outline'`)

## Code Style

**Formatting:**
- No explicit formatter configured (Prettier not detected)
- Consistent indentation: 2 spaces
- Line length: appears to follow ~100-120 character guideline in practice
- Semicolons: consistently used at end of statements
- Arrow functions: preferred over function keyword for callbacks

**Linting:**
- No ESLint configuration detected
- TypeScript strict mode enabled (`"strict": true` in tsconfig.app.json)
- No unused locals/params warnings enabled (`"noUnusedLocals": false`, `"noUnusedParameters": false`)

## Import Organization

**Order:**
1. React and React-related imports (`import { useState, useEffect } from 'react'`)
2. Third-party library imports (`import { motion } from 'framer-motion'`, `import { Link } from 'react-router-dom'`)
3. Component/utility imports from local paths (`import Button from '../ui/Button'`, `import { SITE } from '../../config/site'`)
4. Type imports separated with `type` keyword (`import type { ReactNode } from 'react'`)

**Path Aliases:**
- `@/*` maps to `src/*` (configured in tsconfig.app.json)
- Used for imports like `import Button from '@/components/ui/Button'` (though relative imports also used)
- Relative imports are still commonly used throughout the codebase

## Error Handling

**Patterns:**
- Try-catch with fallback: Used in `api.ts` sendMessage function
  ```typescript
  try {
    const res = await fetch('/api/chat', { ... })
    if (!res.ok) throw new Error('API error')
    const data = await res.json()
    if (data.response) return data
    throw new Error('No response')
  } catch {
    // Graceful fallback with demo response
    return { response: getDemoResponse(...) }
  }
  ```
- Error messages are descriptive but generic (e.g., 'API error', 'No response')
- No specific error types or custom error classes detected
- Errors are logged implicitly through catch blocks (no explicit logging)

## Logging

**Framework:** `console` methods (built-in, no logging library detected)

**Patterns:**
- Console logging not heavily used in source code
- Implicit through try-catch blocks without explicit console statements
- No structured logging or log levels implemented

## Comments

**When to Comment:**
- JSDoc-style comments used for important functions/configuration
- Inline comments used to explain non-obvious logic or implementation decisions
- Comments precede code blocks explaining purpose (e.g., `// Close mobile menu on route change`)
- Configuration file has detailed JSDoc comment explaining purpose

**JSDoc/TSDoc:**
- JSDoc used on configuration exports (see `site.ts`)
- Component descriptions sparse; props documented via TypeScript interfaces
- Function parameters documented through types, not JSDoc annotations

## Function Design

**Size:**
- Most components 40-230 lines
- Large components broken into logical sections with dividing comments (see Header.tsx with sections for Top Bar, Main Header, Mobile Nav)
- Utility functions kept small (useScrollReveal: 8 lines, getDemoResponse: 11 lines)

**Parameters:**
- Component functions accept typed prop objects via destructuring
- Callbacks/handlers have standard naming (e.g., `onClick`, `onChange`)
- Optional props use default parameters in function signatures
- Generic types used for variant/size mapping (e.g., `Record<Variant, string>`)

**Return Values:**
- Components return JSX
- Utility functions return typed objects or values (e.g., `{ ref, isInView }` from hooks)
- API functions return typed objects (e.g., `{ response: string }`)
- Falsy checks explicit (e.g., `if (!res.ok)`, `if (!message)`)

## Module Design

**Exports:**
- Default exports used for components: `export default function Button(...) { }`
- Named exports for utilities and config: `export function useScrollReveal(...) { }`, `export const SITE = { }`
- Type exports explicit: `export type SiteConfig = typeof SITE`

**Barrel Files:**
- No barrel files detected (no `index.ts` files re-exporting)
- Each component imported directly by path

## TypeScript Patterns

**Generic Types:**
- `Record<Type, ValueType>` used for variant/size style mappings (e.g., `Record<Variant, string>`)
- `as const` used for type narrowing in animation objects (e.g., `transition: { ... ease: [...] as const }`)
- Type narrowing with `typeof` in configuration exports

**Interfaces vs Types:**
- Interfaces preferred for object shapes (ButtonProps, FAQProps, HeroProps)
- Types used for unions and aliases (Variant, Size, Message)

**Const Assertions:**
- `as const` used in framer-motion easing arrays for type safety
- Configuration exports wrapped with `as const` for literal type inference

## Component Patterns

**Functional Components:**
- All components are functional components with hooks
- Props destructured in function parameters with defaults
- Event callbacks bound via arrow functions in JSX

**State Management:**
- React hooks used directly (useState, useEffect, useRef, useCallback)
- Custom hook created for scroll-reveal pattern (useScrollReveal)
- No context API or state library detected

**Motion/Animation:**
- Framer Motion used throughout via `motion.*` components
- Standard animation patterns with variants (container/item pattern in BentoGrid, Testimonials)
- Easing: `ease: [0.25, 0.1, 0.25, 1]` used consistently for smooth transitions

---

*Convention analysis: 2026-02-21*
