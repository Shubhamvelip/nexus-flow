'use client';

import { useState } from 'react';
import { Search, RefreshCw, User as UserIcon, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface TopBarProps {
  title: string;
  searchPlaceholder?: string;
}

export function TopBar({
  title,
  searchPlaceholder = 'Search policies, tasks...',
}: TopBarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate sync
    setTimeout(() => setIsSyncing(false), 1500);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const displayName = user?.displayName || user?.email || 'Guest';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="bg-[#070d1a] border-b border-gray-800 h-14 flex items-center px-6 gap-4">
      {/* Title */}
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-semibold text-white truncate">{title}</h2>
      </div>

      {/* Search Bar */}
      <div className="hidden md:block w-60">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            className="pl-9 pr-4 text-xs bg-[#0f172a] text-gray-300 border border-gray-800 rounded-xl focus-visible:ring-1 focus-visible:ring-green-500/50 placeholder:text-gray-600 h-8"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Sync Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleSync}
          disabled={isSyncing}
          className="p-2 hover:bg-gray-800/60 rounded-xl transition-colors text-gray-500 hover:text-white disabled:opacity-50 mr-2"
          title="Sync to database"
        >
          <motion.div
            animate={isSyncing ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1, repeat: isSyncing ? Infinity : 0 }}
          >
            <RefreshCw className="w-4 h-4" />
          </motion.div>
        </motion.button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 hover:bg-green-700 transition-colors border border-green-500/30 ring-2 ring-transparent focus:ring-green-500/50 outline-none"
          >
            <span className="text-white text-xs font-bold">{initial}</span>
          </button>

          <AnimatePresence>
            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-[#0f172a] border border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-3 border-b border-gray-800/60">
                    <p className="text-sm font-medium text-white truncate">{displayName}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || 'Guest Account'}</p>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        router.push('/settings');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      Profile Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-2.5 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
