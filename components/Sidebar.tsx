'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Zap,
  Settings,
  LogOut,
  Clock,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { mockDashboardStats } from '@/lib/mockData';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/generator', label: 'Policy Generator', icon: FileText },
  { href: '/policies', label: 'Policies', icon: Zap },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName = user?.displayName || user?.email || 'Guest';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="w-64 bg-[#070d1a] border-r border-gray-800 flex flex-col h-screen">
      {/* Header */}
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-bold text-white">Nexus Flow</h1>
        </div>
        <p className="text-xs text-gray-500 mt-1 ml-10">Policy Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-5">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${isActive
                    ? 'bg-green-600/20 text-green-400 border border-green-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  whileHover={{ x: 2 }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Stats Section */}
      <div className="px-4 py-4 border-t border-gray-800 space-y-2.5">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide px-1">
          Quick Stats
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            <span className="text-gray-400 text-xs">
              {mockDashboardStats.tasksCompleted} completed
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-gray-400 text-xs">
              {mockDashboardStats.pendingReviews} pending
            </span>
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-xl">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {displayName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user ? 'User' : 'Not logged in'}
            </p>
          </div>
        </div>

        {user ? (
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-2 mt-2 px-3 py-2 text-xs text-gray-500 hover:text-white hover:bg-gray-800/40 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        ) : (
          <Link href="/login" className="w-full flex justify-center mt-2 px-3 py-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-xl transition-colors">
            Login / Sign Up
          </Link>
        )}
      </div>
    </aside>
  );
}
