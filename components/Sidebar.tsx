'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Zap,
  Settings,
  LogOut,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { mockUserProfile, mockDashboardStats } from '@/lib/mockData';
import { motion } from 'framer-motion';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/generator', label: 'Policy Generator', icon: FileText },
  { href: '/policies', label: 'Policies', icon: Zap },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-sidebar-foreground">Nexus Flow</h1>
        </div>
        <p className="text-xs text-sidebar-foreground/60 mt-1">Policy Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                  whileHover={{ x: 4 }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Stats Section */}
      <div className="px-4 py-4 border-t border-sidebar-border space-y-3">
        <div className="text-xs font-semibold text-sidebar-foreground/60 uppercase">
          Quick Stats
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-sidebar-foreground">
              {mockDashboardStats.tasksCompleted} completed
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-sidebar-foreground">
              {mockDashboardStats.pendingReviews} pending
            </span>
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-3 bg-sidebar-accent rounded-lg">
          <div className="w-10 h-10 bg-sidebar-primary rounded-full flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold">
              {mockUserProfile.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {mockUserProfile.name}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {mockUserProfile.role}
            </p>
          </div>
        </div>
        <button className="w-full flex items-center gap-2 mt-3 px-4 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
