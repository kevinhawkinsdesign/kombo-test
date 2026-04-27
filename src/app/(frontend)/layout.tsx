import React from 'react'
import Script from 'next/script'

import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import './styles.css'

export const metadata = {
  description: 'AI-powered sales intelligence for B2B teams.',
  title: 'KomboAI',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
        <Script src="/site.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
