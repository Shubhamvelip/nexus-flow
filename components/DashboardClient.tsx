'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Plus,
  FileText,
  ArrowRight,
  CheckCircle2,
  Clock,
  Zap,
  BarChart3,
  Lightbulb,
  GitBranch,
  ChevronRight,
  Sparkles,
  BookOpen,
  TrendingUp,
  ListChecks,
  Search,
  X,
} from 'lucide-react';
import { MainLayout } from '@/components/shared/MainLayout';
import type { DashboardPolicy, DashboardStats } from '@/lib/data-service';
import { fetchRecentPolicies, getCompletionStats } from '@/lib/data-service';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';

// ── Tips of the day ───────────────────────────────────────────────────────────

const TIPS = [
  {
    icon: <BookOpen className="w-4 h-4 text-green-400" />,
    title: 'Policy Completeness',
    body: 'A clear scope and well-defined stakeholders reduce policy revision cycles by up to 40%. Define the "who, what, when" before generating.',
  },
  {
    icon: <GitBranch className="w-4 h-4 text-green-400" />,
    title: 'Decision Trees',
    body: 'Use the Decision Tree tab to map exception handling. Field officers make 3× faster decisions when decision logic is visual.',
  },
  {
    icon: <ListChecks className="w-4 h-4 text-green-400" />,
    title: 'Checklist Discipline',
    body: 'Check off items only when the action is fully complete. Partial completions skew progress metrics and mislead review boards.',
  },
];


// ── Stat cards ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  iconBg,
  label,
  value,
  sub,
  highlight = false,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number | string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.18 }}
      className={`
        relative overflow-hidden bg-[#0f172a] border rounded-2xl p-5 flex flex-col justify-between h-full transition-all
        ${highlight
          ? 'border-green-500/30 shadow-[0_0_24px_rgba(34,197,94,0.07)]'
          : 'border-gray-800 hover:border-green-500/20'
        }
      `}
    >
      {highlight && (
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
      )}
      <div className="flex items-start justify-between relative">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>{icon}</div>
        <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-4 relative">
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-white tabular-nums"
        >
          {value}
        </motion.p>
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}

// ── Policy card ───────────────────────────────────────────────────────────────

function PolicyCard({ policy, idx }: { policy: DashboardPolicy; idx: number }) {
  const statusStyles: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    draft: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    archived: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + idx * 0.06, duration: 0.35 }}
      whileHover={{ y: -2 }}
    >
      <Link href={`/policies/${policy.id}`}>
        <div className="group bg-[#0f172a] border border-gray-800 hover:border-green-500/40 hover:bg-[#0e1f3a] rounded-2xl p-5 transition-all cursor-pointer">
          {/* Top row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm leading-snug group-hover:text-green-400 transition-colors line-clamp-1">
                {policy.title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                {policy.description}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs px-2 py-0.5 rounded-lg font-medium border ${statusStyles[policy.status] ?? statusStyles.archived}`}>
                {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-700 group-hover:text-green-500 transition-colors" />
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {policy.workflowSteps} steps
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {policy.checklistTotal} tasks
            </span>
            <span className="ml-auto">{policy.createdAt}</span>
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Progress</span>
              <span className="text-xs font-semibold text-white tabular-nums">
                {policy.completionPercentage}%
              </span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${policy.completionPercentage}%` }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 + idx * 0.06 }}
              />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function DashboardClient() {
  const router = useRouter();
  const { user } = useAuth();

  const [policies, setPolicies] = useState<DashboardPolicy[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalPolicies: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [todayTip, setTodayTip] = useState(TIPS[0]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter policies based on debounced search
  const filteredPolicies = useMemo(() => {
    if (!debouncedSearch) return policies;
    const lowerQuery = debouncedSearch.toLowerCase();
    return policies.filter(
      (policy) =>
        policy.title.toLowerCase().includes(lowerQuery) ||
        policy.description.toLowerCase().includes(lowerQuery)
    );
  }, [policies, debouncedSearch]);

  useEffect(() => {
    setTodayTip(TIPS[new Date().getDay() % TIPS.length]);
  }, []);

  useEffect(() => {
    async function loadData() {
      if (!user?.uid) return;
      setIsLoading(true);
      try {
        const [fetchedPolicies, fetchedStats] = await Promise.all([
          fetchRecentPolicies(user.uid, 5),
          getCompletionStats(user.uid),
        ]);
        setPolicies(fetchedPolicies);
        setStats(fetchedStats);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user?.uid]);

  if (isLoading) {
    return (
      <MainLayout title="Dashboard">
        <div className="flex items-center justify-center h-64 text-sm text-gray-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading dashboard…
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">

        {/* ── WELCOME ──────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {policies.length > 0
                ? `You have ${policies.length} ${policies.length === 1 ? 'policy' : 'policies'} tracked.`
                : 'Generate your first policy to get started.'}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <div className="relative">
              <input
                type="text"
                placeholder="Search policies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 py-2.5 text-sm bg-[#0f172a] text-gray-300 border border-gray-800 rounded-xl focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500/50 placeholder:text-gray-600 w-full sm:w-64 transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white rounded-full bg-transparent border-none transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/generator')}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors flex-shrink-0 shadow-lg shadow-green-900/20"
            >
              <Plus className="w-4 h-4" />
              New Policy
            </motion.button>
          </div>
        </motion.div>

        {/* ── STATS ────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <StatCard
            icon={<BarChart3 className="w-5 h-5 text-green-500" />}
            iconBg="bg-green-500/10"
            label="Total"
            value={stats.totalPolicies}
            sub={stats.totalPolicies === 1 ? 'Policy tracked' : 'Policies tracked'}
            highlight={stats.totalPolicies > 0}
          />
          <StatCard
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            iconBg="bg-emerald-500/10"
            label="Completed"
            value={stats.completedTasks}
            sub="Tasks marked done"
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-amber-400" />}
            iconBg="bg-amber-500/10"
            label="Pending"
            value={stats.pendingTasks}
            sub="Tasks remaining"
          />
        </motion.div>

        {/* ── MAIN GRID: LEFT + RIGHT ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start"
        >
          {/* ── LEFT: RECENT POLICIES ─────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Recent Policies</h2>
              {policies.length > 0 && (
                <Link
                  href="/policies"
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-400 transition-colors"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {filteredPolicies.length > 0 ? (
              <div className="space-y-3">
                {filteredPolicies.map((policy, idx) => (
                  <PolicyCard key={policy.id} policy={policy} idx={idx} />
                ))}
              </div>
            ) : (
              /* ── Empty state ── */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="bg-[#0f172a] border-2 border-dashed border-gray-800 rounded-2xl py-16 px-8 flex flex-col items-center gap-5 text-center"
              >
                <motion.div
                  animate={{ scale: [0.95, 1.02, 0.95] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-16 h-16 rounded-2xl bg-gray-800/60 border border-gray-700 flex items-center justify-center"
                >
                  <FileText className="w-7 h-7 text-gray-600" />
                </motion.div>
                <div className="space-y-1.5">
                  <p className="text-base font-semibold text-gray-200">
                    {searchQuery ? "No matching policies found" : "No policies yet"}
                  </p>
                  <p className="text-sm text-gray-500 max-w-xs">
                    {searchQuery
                      ? "Try adjusting your search terms to find what you're looking for."
                      : "Use the Policy Generator to convert any government policy document into a structured workflow, decision tree, and checklist."}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => router.push('/generator')}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors shadow-lg shadow-green-900/20"
                  >
                    <Zap className="w-4 h-4" />
                    Generate First Policy
                  </motion.button>
                </div>

                {/* Ghost preview */}
                <div className="flex gap-2 mt-1">
                  {['Workflow', 'Decision Tree', 'Checklist'].map((label) => (
                    <div
                      key={label}
                      className="px-3 py-1 bg-gray-800/40 border border-gray-800 rounded-lg text-xs text-gray-700"
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* ── RIGHT: SIDEBAR ───────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-[#0f172a] border border-gray-800 rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-green-500/10 rounded-lg">
                  <Sparkles className="w-4 h-4 text-green-500" />
                </div>
                <h3 className="text-sm font-semibold text-white">Quick Actions</h3>
              </div>
              <div className="space-y-2">
                <motion.button
                  whileHover={{ scale: 1.01, x: 2 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => router.push('/generator')}
                  className="w-full flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white rounded-xl py-2.5 px-4 text-sm font-semibold transition-colors text-left"
                >
                  <Plus className="w-4 h-4 flex-shrink-0" />
                  Generate New Policy
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01, x: 2 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => router.push('/policies')}
                  className="w-full flex items-center gap-3 border border-gray-700 hover:border-gray-500 bg-transparent text-white rounded-xl py-2.5 px-4 text-sm font-semibold transition-colors text-left"
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  View All Policies
                </motion.button>
              </div>
            </motion.div>

            {/* System Summary */}
            {policies.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#0f172a] border border-gray-800 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-green-500/10 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Summary</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Policies', value: stats.totalPolicies },
                    { label: 'Total tasks', value: stats.pendingTasks + stats.completedTasks },
                    { label: 'Workflow steps', value: policies.reduce((s, p) => s + p.workflowSteps, 0) },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{item.label}</span>
                      <span className="text-sm font-bold text-white tabular-nums">{item.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Tip of the Day */}
            <motion.div
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-[#0f172a] border border-green-500/20 rounded-2xl p-5 bg-gradient-to-br from-green-500/5 to-transparent"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-500/10 rounded-xl flex-shrink-0">
                  <Lightbulb className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-green-400 uppercase tracking-wide mb-1">
                    Tip of the Day
                  </p>
                  <h3 className="text-sm font-semibold text-white mb-1.5">{todayTip.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{todayTip.body}</p>
                </div>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
