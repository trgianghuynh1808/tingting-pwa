'use client'

import { Inter } from 'next/font/google'
import { useEffect, useState } from 'react'
import { Provider as ReduxProvider } from 'react-redux'

// *INFO: internal modules
import './globals.css'
import { indexDB } from '@/db'
import { store } from '@/store'
import { Header, BottomTabNavigator } from '@/components/layout'
import { EInputMode } from '@/enums'
import { AppContext } from '@/contexts'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState<boolean>(false)
  const [isReady, setIsReady] = useState<boolean>(false)
  const [inputMode, setInputMode] = useState<EInputMode>(EInputMode.FAMILY)

  async function initDB(): Promise<void> {
    await indexDB.initialize()
  }

  async function initializeApp(): Promise<void> {
    await initDB()
    setIsReady(true)
  }

  function LoadingSpiner() {
    // *TODO: implement loadingSpiner later
    return (
      <div>
        <span>Loading...</span>
      </div>
    )
  }

  useEffect(() => {
    if (!mounted) {
      initializeApp()
      setMounted(true)
    }
  }, [mounted])

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body
        className={`${inter.className} w-full min-h-screen bg-gray-300 flex justify-center`}
        suppressHydrationWarning={true}
      >
        <ReduxProvider store={store}>
          <AppContext.Provider
            value={{
              inputMode,
              setInputMode,
            }}
          >
            <main className="w-full md:w-3/5 lg:w-1/5 bg-white rounded shadow-lg flex flex-col justify-between">
              {!isReady ? (
                <LoadingSpiner />
              ) : (
                <>
                  <Header />
                  {children}
                </>
              )}

              <BottomTabNavigator />
            </main>
          </AppContext.Provider>
        </ReduxProvider>
      </body>
    </html>
  )
}
