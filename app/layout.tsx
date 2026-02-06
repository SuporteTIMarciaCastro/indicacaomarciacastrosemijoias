import type { Metadata } from 'next'
import './globals.css'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Marcia Castro Semijoias',
  description: 'Created for Alcivan Lucas',
  generator: 'alcivanlucas.dev',
  icons: {
    icon: '/favicon.ico',
  },
}



//  corrigindo

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-DG7G7PWMZ3"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-DG7G7PWMZ3');
          `,
        }} />
        {/* Microsoft Clarity - Temporariamente desabilitado por problemas de carregamento */}
        {/* <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "slzrqc2h6j");
          `}
        </Script> */}
      </body>
    </html>
  )
}
