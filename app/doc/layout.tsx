import LiveBlockProvider from '@/components/LiveBlockProvider'
import React from 'react'

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <LiveBlockProvider>
      {children}
    </LiveBlockProvider>
  )
}
