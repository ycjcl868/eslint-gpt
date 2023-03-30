import { Analytics } from '@vercel/analytics/react'
import { Provider } from 'react-wrap-balancer'
import type { AppProps } from 'next/app'
import { NextIntlProvider } from 'next-intl'
import '../styles/globals.css'
import '../styles/markdown.css'
import 'prismjs'
import 'prismjs/plugins/toolbar/prism-toolbar.min.css'
import 'prismjs/plugins/toolbar/prism-toolbar.min.js'
import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js'
import '../styles/prism.css'
import 'prismjs/components/prism-clike.min.js'
import 'prismjs/components/prism-javascript.min.js'
import 'prismjs/components/prism-js-extras.min.js'
import 'prismjs/components/prism-json.min.js'
import 'prismjs/components/prism-jsx.min.js'
import 'prismjs/components/prism-tsx.min.js'
import 'prismjs/components/prism-typescript.min.js'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NextIntlProvider messages={pageProps.messages}>
      <Provider>
        <Component {...pageProps} />
      </Provider>
      <Analytics />
    </NextIntlProvider>
  )
}

export default MyApp
