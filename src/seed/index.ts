import type { Payload } from 'payload'

import { seedPages } from './pages-data'

export async function seedIfEmpty(payload: Payload): Promise<void> {
  const existing = await payload.count({ collection: 'pages' })
  if (existing.totalDocs > 0) return

  payload.logger.info(`[seed] No pages found — seeding ${seedPages.length} pages from migrated HTML`)

  for (const page of seedPages) {
    await payload.create({
      collection: 'pages',
      data: page,
    })
  }

  payload.logger.info('[seed] Done')
}
