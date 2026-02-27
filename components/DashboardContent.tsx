'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  CheckCircle,
  Clock,
  Lightbulb,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  mockDashboardStats,
  recentPolicies,
  dailyHint,
} from '@/lib/mockData';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function DashboardContent() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
        <p className="text-muted-foreground">
          Manage and track your policies efficiently
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Total Policies Card */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Policies
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {mockDashboardStats.totalPolicies}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tasks Completed Card */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tasks Completed
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {mockDashboardStats.tasksCompleted}
                </p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Pending Reviews Card */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Reviews
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {mockDashboardStats.pendingReviews}
                </p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Recent Policies and Daily Hint Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Recent Policies */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Policies
            </h2>
            <Link href="/policies">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {recentPolicies.map((policy) => (
              <motion.div
                key={policy.id}
                whileHover={{ scale: 1.02, x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <Link href={`/policies/${policy.id}`}>
                  <Card className="p-4 bg-card border-border hover:border-primary/50 cursor-pointer transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {policy.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {policy.description}
                        </p>
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              Progress
                            </span>
                            <span className="text-xs font-medium text-foreground">
                              {policy.progress}%
                            </span>
                          </div>
                          <Progress
                            value={policy.progress}
                            className="h-2"
                          />
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${
                            policy.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : policy.status === 'draft'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-slate-500/20 text-slate-400'
                          }`}
                        >
                          {policy.status.charAt(0).toUpperCase() +
                            policy.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Daily Hint Panel */}
        <motion.div
          variants={itemVariants}
          className="space-y-4"
        >
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground">
                  {dailyHint.title}
                </h3>
                <p className="text-sm text-foreground/80 mt-2">
                  {dailyHint.content}
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 bg-card border-border space-y-3">
            <h3 className="font-semibold text-foreground">Quick Actions</h3>
            <Button 
              onClick={() => router.push('/policies?action=new')}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Policy
            </Button>
            <Button
              onClick={() => router.push('/generator')}
              variant="outline"
              className="w-full border-border text-foreground hover:bg-muted"
            >
              Generate from PDF
            </Button>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
