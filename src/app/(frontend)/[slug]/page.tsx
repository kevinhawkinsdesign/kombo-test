import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@/payload.config'

type Props = { params: Promise<{ slug: string }> }

async function fetchPage(slug: string) {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  return docs[0] ?? null
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  if (slug === 'home') notFound()

  const page = await fetchPage(slug)
  if (!page) notFound()

  return <div dangerouslySetInnerHTML={{ __html: page.bodyHtml }} />
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const page = await fetchPage(slug)
  return {
    title: page?.title ?? 'Not found',
    description: page?.metaDescription ?? undefined,
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'pages',
    limit: 100,
    depth: 0,
    select: { slug: true },
  })
  return docs.filter((d) => d.slug && d.slug !== 'home').map((d) => ({ slug: d.slug! }))
}
