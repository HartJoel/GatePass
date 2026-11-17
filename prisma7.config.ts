import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // CLI commands (migrate, db push, introspect) use the direct/unpooled connection.
    // The app itself connects through the pooled DATABASE_URL via the Neon adapter at runtime.
    url: env('DATABASE_URL_UNPOOLED'),
  },
})
