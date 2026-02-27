'use client';

import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ProtectedRoute } from './ProtectedRoute';
import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  searchPlaceholder?: string;
  requireAuth?: boolean;
}

export function MainLayout({
  children,
  title,
  searchPlaceholder,
  requireAuth = true,
}: MainLayoutProps) {
  const Wrapper = requireAuth ? ProtectedRoute : ({ children }: { children: ReactNode }) => <>{children}</>;

  return (
    <Wrapper>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <TopBar title={title} searchPlaceholder={searchPlaceholder} />

          {/* Content Area */}
          <main className="flex-1 overflow-auto">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    </Wrapper>
  );
}
