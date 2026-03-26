import { vercelPreset } from '@vercel/react-router/vite'
import type { Config } from '@react-router/dev/config'
import { getPrerenderRoutes } from './src/lib/build-routes'

export default {
  appDirectory: 'src',
  buildDirectory: 'build',
  ssr: false,
  presets: [vercelPreset()],
  async prerender({ getStaticPaths }) {
    // Static paths come from the live route tree. Config/content-driven paths are
    // merged here so prerender stays aligned with services, cities, posts, and projects.
    return getPrerenderRoutes(getStaticPaths())
  },
} satisfies Config
