import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css'

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
      <Toaster position="bottom-right" />
    </SessionProvider>
  )
}

export default MyApp 