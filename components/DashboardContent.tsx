'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FileText,
  CheckCircle,
  Clock,
  Lightbulb,
  ArrowRight,
  Plus,
  Zap,
} from 'lucide-react';
import {
  mockDashboardStats,
  recentPolicies,
  dailyHint,
} from '@/lib/mockData';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function DashboardContent() {
  const router = useRouter();
  const hasStats = mockDashboardStats.totalPolicies > 0;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-1"
      >
        <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
        <p className="text-gray-400 text-sm">Manage and track your policies efficiently</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {[
          {
            label: 'Total',
            value: mockDashboardStats.totalPolicies,
            sub: 'Policies tracked',
            icon: <FileText className="w-5 h-5 text-green-500" />,
            bg: 'bg-green-500/10',
          },
          {
            label: 'Completed',
            value: mockDashboardStats.tasksCompleted,
            sub: 'Tasks done',
            icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Pending',
            value: mockDashboardStats.pendingReviews,
            sub: 'Awaiting review',
            icon: <Clock className="w-5 h-5 text-amber-400" />,
            bg: 'bg-amber-500/10',
          },
        ].map((stat) => (
          <motion.div key={stat.label} variants={itemVariants} className="h-full">
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0f172a] border border-gray-800 rounded-2xl p-5 hover:border-green-500/30 transition-all h-full flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>{stat.icon}</div>
                <span className="text-xs text-gray-600 uppercase tracking-wide font-medium">
                  {stat.label}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Policies + Sidebar */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
      >
        {/* LEFT: Recent Policies */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Recent Policies</h2>
            <Link
              href="/policies"
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-400 transition-colors"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentPolicies.length > 0 ? (
            <div className="space-y-3">
              {recentPolicies.map((policy, idx) => (
                <motion.div
                  key={policy.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  whileHover={{ y: -2 }}
                >
                  <Link href={`/policies/${policy.id}`}>
                    <div className="group bg-[#0f172a] border border-gray-800 rounded-2xl p-5 hover:border-green-500/40 hover:bg-[#111f38] transition-all cursor-pointer">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-sm leading-snug group-hover:text-green-400 transition-colors truncate">
                            {policy.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {policy.description}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium flex-shrink-0 ${policy.status === 'active'
                              ? 'bg-green-500/20 text-green-400'
                              : policy.status === 'draft'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-slate-500/20 text-slate-400'
                            }`}
                        >
                          {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Progress</span>
                          <span className="text-xs font-semibold text-white">
                            {policy.progress}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-green-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${policy.progress}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            /* ── Empty state ── */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#0f172a] border border-dashed border-gray-800 rounded-2xl py-16 flex flex-col items-center gap-4 text-center"
            >
              <motion.div
                animate={{ scale: [0.95, 1, 0.95] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-14 h-14 rounded-2xl bg-gray-800/60 border border-gray-700 flex items-center justify-center"
              >
                <FileText className="w-6 h-6 text-gray-600" />
              </motion.div>
              <div>
                <p className="text-sm font-semibold text-gray-300">No policies yet</p>
                <p className="text-xs text-gray-600 mt-1">
                  Generate your first policy to get started
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/generator')}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
              >
                <Zap className="w-4 h-4" />
                Generate First Policy
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* RIGHT: Tip + Quick Actions */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Daily Hint */}
          <div className="bg-[#0f172a] border border-green-500/20 rounded-2xl p-5 bg-gradient-to-br from-green-500/5 to-transparent">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-500/10 rounded-xl flex-shrink-0">
                <Lightbulb className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">{dailyHint.title}</h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">{dailyHint.content}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-5">
            <h3 className="font-semibold text-white text-sm mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => router.push('/generator')}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Policy
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => router.push('/generator')}
                className="w-full flex items-center justify-center gap-2 border border-gray-700 hover:border-gray-500 bg-transparent text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
              >
                Generate from PDF
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
