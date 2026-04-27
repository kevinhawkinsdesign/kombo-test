import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@/payload.config'

export default async function HomePage() {
  return renderPageBySlug('home')
}

async function renderPageBySlug(slug: string) {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })

  const page = docs[0]
  if (!page) notFound()

  return <div dangerouslySetInnerHTML={{ __html: page.bodyHtml }} />
}

export async function generateMetadata() {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
  })
  const page = docs[0]
  return {
    title: page?.title ?? 'KomboAI',
    description: page?.metaDescription ?? undefined,
  }
}
