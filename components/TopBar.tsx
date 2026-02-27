'use client';

import { useState } from 'react';
import { Search, Globe, Bell, HelpCircle, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
    // Log current checklist state to console
    console.log('[v0] Syncing policy data to database...');
    console.log('[v0] Current checklist state:', {
      timestamp: new Date().toISOString(),
      status: 'syncing',
      checklistItems: [],
    });
    // Simulate sync
    setTimeout(() => {
      setIsSyncing(false);
      console.log('[v0] Sync completed successfully');
    }, 1500);
  };

  return (
    <header className="bg-card border-b border-border h-16 flex items-center px-6 gap-4">
      {/* Title */}
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-semibold text-foreground truncate">{title}</h2>
      </div>

      {/* Search Bar */}
      <div className="hidden md:block w-64">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            className="pl-10 pr-4 bg-muted text-foreground border-0 focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Sync Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleSync}
          disabled={isSyncing}
          className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
          title="Sync checklist to database"
        >
          <motion.div
            animate={isSyncing ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1, repeat: isSyncing ? Infinity : 0 }}
          >
            <RefreshCw className="w-5 h-5" />
          </motion.div>
        </motion.button>

        {/* Language Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          title="Language"
        >
          <Globe className="w-5 h-5" />
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="relative p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </motion.button>

        {/* Help */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          title="Help"
        >
          <HelpCircle className="w-5 h-5" />
        </motion.button>
      </div>
    </header>
  );
}
