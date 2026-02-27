'use client';

import { useState } from 'react';
import { Search, Globe, Bell, HelpCircle, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

interface TopBarProps {
  title: string;
  searchPlaceholder?: string;
}

export function TopBar({
  title,
  searchPlaceholder = 'Search policies, tasks...',
}: TopBarProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    console.log('[v0] Syncing policy data to database...');
    setTimeout(() => {
      setIsSyncing(false);
      console.log('[v0] Sync completed successfully');
    }, 1500);
  };

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
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleSync}
          disabled={isSyncing}
          className="p-2 hover:bg-gray-800/60 rounded-xl transition-colors text-gray-500 hover:text-white disabled:opacity-50"
          title="Sync to database"
        >
          <motion.div
            animate={isSyncing ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1, repeat: isSyncing ? Infinity : 0 }}
          >
            <RefreshCw className="w-4 h-4" />
          </motion.div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          className="p-2 hover:bg-gray-800/60 rounded-xl transition-colors text-gray-500 hover:text-white"
          title="Language"
        >
          <Globe className="w-4 h-4" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          className="relative p-2 hover:bg-gray-800/60 rounded-xl transition-colors text-gray-500 hover:text-white"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          className="p-2 hover:bg-gray-800/60 rounded-xl transition-colors text-gray-500 hover:text-white"
          title="Help"
        >
          <HelpCircle className="w-4 h-4" />
        </motion.button>
      </div>
    </header>
  );
}
