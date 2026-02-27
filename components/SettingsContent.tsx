'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export function SettingsContent() {
  const { user } = useAuth();
  const displayName = user?.displayName || user?.email || 'Guest';
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile and application preferences
        </p>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-6 bg-card border-border space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Full Name
              </label>
              <Input
                type="text"
                defaultValue={displayName}
                readOnly
                className="bg-input border-border text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                UID
              </label>
              <Input
                type="text"
                defaultValue={user?.uid || ''}
                readOnly
                className="bg-input border-border text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Email
              </label>
              <Input
                type="text"
                defaultValue={user?.email || ''}
                readOnly
                className="bg-input border-border text-foreground"
              />
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Save Changes
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Preferences Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="p-6 bg-card border-border space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Language
              </label>
              <Select defaultValue="en">
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Sync Frequency
              </label>
              <Select defaultValue="auto">
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="auto">Automatic (Every 5 min)</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Notifications Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="p-6 bg-card border-border space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Notifications
          </h2>
          <div className="space-y-3">
            {[
              { id: 'policy-updates', label: 'Policy Updates' },
              { id: 'task-reminders', label: 'Task Reminders' },
              { id: 'system-alerts', label: 'System Alerts' },
            ].map((item) => (
              <label key={item.id} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm text-foreground">{item.label}</span>
              </label>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="p-6 bg-red-500/5 border-red-500/30 space-y-4">
          <h2 className="text-lg font-semibold text-red-500">Danger Zone</h2>
          <p className="text-sm text-foreground/80">
            Irreversible actions that can permanently affect your account
          </p>
          <Button
            variant="outline"
            className="border-red-500/30 text-red-500 hover:bg-red-500/10"
          >
            Clear All Data
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
