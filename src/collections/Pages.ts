import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: "URL slug. Use 'home' for the root path; otherwise the page is served at /{slug}.",
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'metaDescription',
      type: 'textarea',
    },
    {
      name: 'bodyHtml',
      type: 'code',
      required: true,
      admin: {
        language: 'html',
        description: 'Raw HTML for the page body (rendered between the shared header and footer).',
      },
    },
  ],
}
