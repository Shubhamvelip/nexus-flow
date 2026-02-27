'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  Edit,
  CheckCircle2,
  GitBranch,
  Zap,
  FileText,
  Share2,
  ExternalLink,
  Trophy,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { WorkflowTimeline } from '@/components/shared/WorkflowTimeline';
import { VisualDecisionTree } from '@/components/shared/VisualDecisionTree';
import { InteractiveChecklist } from '@/components/shared/InteractiveChecklist';

// ── Types for Firestore policy document ─────────────────────────────────────

interface PolicyDoc {
  id: string;
  title: string;
  input_text?: string;
  workflow: Array<{ step: string; description: string }>;
  decision_tree: {
    question: string;
    yes: unknown;
    no: unknown;
  };
  checklist: string[];
  created_at: { seconds?: number } | null;
}

// ── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ label, color }: { label: string; color: 'green' | 'amber' | 'slate' }) {
  const styles = {
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    slate: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${styles[color]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

// ── Tab button ───────────────────────────────────────────────────────────────

function TabBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${active
          ? 'bg-green-600/20 text-green-400 border border-green-500/30'
          : 'text-gray-500 hover:text-gray-300 border border-transparent hover:border-gray-700'
        }`}
    >
      {icon}
      {label}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface PolicyDetailContentProps {
  policyId: string;
}

export function PolicyDetailContent({ policyId }: PolicyDetailContentProps) {
  const router = useRouter();
  const [policy, setPolicy] = useState<PolicyDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'workflow' | 'tree' | 'checklist'>('workflow');
  const [checklistProgress, setChecklistProgress] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/policies/${policyId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Policy not found');
        setPolicy(data.policy);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load policy');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [policyId]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 className="w-5 h-5 text-green-500 animate-spin" />
        <span className="text-sm text-gray-400">Loading policy…</span>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !policy) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-red-400">Policy not found</p>
          <p className="text-xs text-gray-600 mt-1">{error}</p>
        </div>
        <Link href="/policies">
          <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white border border-gray-700 rounded-xl px-4 py-2 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Policies
          </button>
        </Link>
      </div>
    );
  }

  const steps = policy.workflow ?? [];
  const checklist = policy.checklist ?? [];

  return (
    <div className="space-y-5">
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        {/* Back link */}
        <Link href="/policies">
          <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors mb-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Policies
          </button>
        </Link>

        {/* Title row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-2xl font-bold text-white truncate">{policy.title}</h1>
              <StatusBadge label="Active" color="green" />
            </div>
            {policy.input_text && (
              <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                {policy.input_text.slice(0, 160)}{policy.input_text.length > 160 ? '…' : ''}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              title="Export PDF"
              className="w-9 h-9 flex items-center justify-center border border-gray-700 hover:border-green-500/40 text-gray-400 hover:text-white rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              title="Share"
              className="w-9 h-9 flex items-center justify-center border border-gray-700 hover:border-green-500/40 text-gray-400 hover:text-white rounded-xl transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              title="Edit"
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl px-3 py-2 text-xs font-semibold transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ── PROGRESS BANNER ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="bg-[#0f172a] border border-green-500/20 rounded-2xl p-5 bg-gradient-to-r from-green-500/5 to-transparent"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Execution Progress</p>
            <p className="text-sm text-gray-300 mt-0.5">
              {checklist.length > 0 ? `${checklist.length} checklist items` : `${steps.length} workflow steps`}
            </p>
          </div>
          <motion.span
            key={checklistProgress}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-green-400 tabular-nums"
          >
            {checklistProgress}%
          </motion.span>
        </div>

        <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${checklistProgress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
          <div
            className="absolute inset-0 opacity-20"
            style={{ background: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.1) 8px, rgba(255,255,255,0.1) 9px)' }}
          />
        </div>

        <p className="text-xs text-gray-600 mt-2">
          {checklistProgress === 0
            ? 'Start checking off tasks to track your progress.'
            : checklistProgress < 50
              ? 'Good start! Keep working through the checklist.'
              : checklistProgress < 100
                ? 'Almost there! Complete the remaining items.'
                : '🎉 All done — ready for final approval!'}
        </p>
      </motion.div>

      {/* ── 3-COLUMN MAIN GRID ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 xl:grid-cols-3 gap-5"
      >
        {/* ── COL 1: CHECKLIST ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0f172a] border border-gray-800 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="p-1.5 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
            <h2 className="text-sm font-semibold text-white">Checklist</h2>
          </div>

          <ProgressAwareChecklist
            items={checklist}
            onProgressChange={setChecklistProgress}
          />
        </motion.div>

        {/* ── COL 2: WORKFLOW ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-[#0f172a] border border-gray-800 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="p-1.5 bg-green-500/10 rounded-lg">
              <Zap className="w-4 h-4 text-green-500" />
            </div>
            <h2 className="text-sm font-semibold text-white">Workflow</h2>
            <span className="ml-auto text-xs text-gray-600">{steps.length} steps</span>
          </div>

          <WorkflowTimeline steps={steps} />
        </motion.div>

        {/* ── COL 3: DECISION TREE ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0f172a] border border-gray-800 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="p-1.5 bg-green-500/10 rounded-lg">
              <GitBranch className="w-4 h-4 text-green-500" />
            </div>
            <h2 className="text-sm font-semibold text-white">Decision Tree</h2>
          </div>

          <VisualDecisionTree tree={policy.decision_tree as unknown as Parameters<typeof VisualDecisionTree>[0]['tree']} />
        </motion.div>
      </motion.div>

      {/* ── BOTTOM ACTIONS ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="flex items-center gap-3 flex-wrap"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
        >
          <Trophy className="w-4 h-4" />
          Mark Complete
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 border border-gray-700 hover:border-gray-500 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 border border-gray-700 hover:border-gray-500 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          View Document
        </motion.button>
        {policy.created_at?.seconds && (
          <span className="text-xs text-gray-600 ml-auto">
            Created {new Date((policy.created_at.seconds) * 1000).toLocaleDateString()}
          </span>
        )}
      </motion.div>
    </div>
  );
}

// ── Helper wrapper to track checklist progress externally ─────────────────────

function ProgressAwareChecklist({
  items,
  onProgressChange,
}: {
  items: string[];
  onProgressChange: (pct: number) => void;
}) {
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const toggle = (idx: number) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      const pct = items.length > 0 ? Math.round((next.size / items.length) * 100) : 0;
      onProgressChange(pct);
      return next;
    });
  };

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <CheckCircle2 className="w-8 h-8 text-gray-700" />
        <p className="text-sm text-gray-600">No checklist items.</p>
      </div>
    );
  }

  const pct = Math.round((completed.size / items.length) * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">{completed.size}/{items.length} done</span>
        <span className={`font-bold tabular-nums ${pct === 100 ? 'text-green-400' : 'text-white'}`}>{pct}%</span>
      </div>

      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="flex gap-0.5 mb-3">
        {items.map((_, i) => (
          <motion.div
            key={i}
            animate={{ backgroundColor: completed.has(i) ? 'rgb(34,197,94)' : 'rgb(31,41,55)' }}
            transition={{ duration: 0.25 }}
            className="flex-1 h-0.5 rounded-full"
          />
        ))}
      </div>

      <div className="space-y-1.5">
        {items.map((item, idx) => {
          const isDone = completed.has(idx);
          return (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              whileHover={{ x: 2 }}
              onClick={() => toggle(idx)}
              className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all text-xs ${isDone
                  ? 'bg-green-500/8 border-green-500/20 text-gray-500'
                  : 'bg-[#080f1f] border-gray-800 hover:border-gray-600 text-white'
                }`}
            >
              <motion.div
                animate={{ scale: isDone ? [1, 1.3, 1] : 1 }}
                transition={{ duration: 0.2 }}
                className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${isDone ? 'bg-green-500 border-green-500' : 'border-gray-600'
                  }`}
              >
                {isDone && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </motion.div>
              <span className={isDone ? 'line-through' : ''}>{item}</span>
            </motion.button>
          );
        })}
      </div>

      {pct === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 justify-center py-3 bg-green-500/10 border border-green-500/25 rounded-xl"
        >
          <Trophy className="w-4 h-4 text-green-500" />
          <span className="text-xs font-bold text-green-400">All done!</span>
        </motion.div>
      )}
    </div>
  );
}
