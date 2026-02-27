'use client';

import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  searchPlaceholder?: string;
}

export function MainLayout({
  children,
  title,
  searchPlaceholder,
}: MainLayoutProps) {
  return (
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
  );
}
