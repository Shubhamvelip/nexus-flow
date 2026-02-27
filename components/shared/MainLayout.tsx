'use client'

import { ReactNode } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'
import { ProtectedRoute } from '@/components/ProtectedRoute'

interface MainLayoutProps {
  children: ReactNode
  showSidebar?: boolean
  title?: string
  subtitle?: string
  actions?: ReactNode
  requireAuth?: boolean
}

export function MainLayout({
  children,
  showSidebar = true,
  title,
  subtitle,
  actions,
  requireAuth = true
}: MainLayoutProps) {
  const Wrapper = requireAuth ? ProtectedRoute : ({ children }: { children: ReactNode }) => <>{children}</>;

  return (
    <Wrapper>
      <div className="min-h-screen bg-[#020617] text-white flex">
        {/* Sidebar */}
        {showSidebar && (
          <div className="flex-shrink-0">
            <Sidebar />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <TopBar title={title || ''} />

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </Wrapper>
  )
}
