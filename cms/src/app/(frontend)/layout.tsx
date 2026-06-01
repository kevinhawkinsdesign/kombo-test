import React from 'react'
import Script from 'next/script'

import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import './styles.css'

export const metadata = {
  description: 'AI-powered sales intelligence for B2B teams.',
  icons: { icon: '/icon-green.svg' },
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
        <Script id="intercom-settings" strategy="afterInteractive">{`
          window.intercomSettings = { api_base: "https://api-iam.intercom.io", app_id: "i1sg1inu" };
        `}</Script>
        <Script id="intercom-widget" strategy="afterInteractive">{`
          (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/i1sg1inu';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
        `}</Script>
      </body>
    </html>
  )
}
