'use client'

import { ReactNode } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'

interface MainLayoutProps {
  children: ReactNode
  showSidebar?: boolean
  title?: string
  subtitle?: string
  actions?: ReactNode
}

export function MainLayout({ 
  children, 
  showSidebar = true, 
  title, 
  subtitle, 
  actions 
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar - Fixed width */}
      {showSidebar && (
        <div className="sidebar-width border-r border-border flex flex-col">
          <Sidebar />
        </div>
      )}

      {/* Main Content Area */}
      <div className="content-width flex flex-col">
        {/* Top Bar - Fixed height */}
        <TopBar title={title || ''} subtitle={subtitle || ''} actions={actions} />

        {/* Page Content - Standardized padding */}
        <main className="page-padding flex-1 overflow-auto">
          <div className="container-standard">
            {title && (
              <div className="mb-6">
                <h1 className="text-3xl font-bold">{title}</h1>
                {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
