'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Policy, ChecklistState } from '@/types/policy';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DecisionTreeComponent } from '@/components/DecisionTree';
import { ProgressCircle } from '@/components/ProgressCircle';
import { motion } from 'framer-motion';
import { InteractiveChecklist } from '@/components/shared/InteractiveChecklist';
import {
  ArrowLeft, Download, Share2, Edit, CheckSquare, Settings2, FileText, ChevronRight
} from 'lucide-react';
import { ValidateCaseSection } from '@/components/shared/ValidateCaseSection';
import { WorkflowGraph } from '@/components/shared/WorkflowGraph';

interface PolicyDetailClientProps {
  policy: Policy;
  initialState: ChecklistState;
}

export function PolicyDetailClient({
  policy,
  initialState,
}: PolicyDetailClientProps) {
  const [completedCount, setCompletedCount] = useState(
    policy.checklist_items.filter(c => c.completed).length
  );

  const totalCount = policy.checklist_items.length;
  const currentPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white hover:bg-white/5 transition-colors group">
                  <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
                  Back
                </Button>
              </Link>
              <Badge
                variant="default"
                className={
                  policy.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : policy.status === 'draft'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-muted text-foreground'
                }
              >
                {policy.status.toUpperCase()}
              </Badge>
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                Updated {new Date(policy.updatedAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">{policy.title}</h1>
            <p className="text-gray-400 max-w-2xl leading-relaxed text-sm md:text-base">
              {policy.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button variant="outline" className="bg-[#0f172a] border-gray-800 text-gray-300 hover:text-white hover:bg-[#1e293b] hover:border-gray-600 transition-colors">
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
            <Button variant="outline" className="bg-[#0f172a] border-gray-800 text-gray-300 hover:text-white hover:bg-[#1e293b] hover:border-gray-600 transition-colors">
              <Download className="w-4 h-4 mr-2" /> Export PDF
            </Button>
            <Button variant="outline" className="bg-[#0f172a] border-gray-800 text-gray-300 hover:text-white hover:bg-[#1e293b] hover:border-gray-600 transition-colors">
              <Edit className="w-4 h-4 mr-2" /> Edit Policy
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg shadow-emerald-900/20 border-0">
              <CheckSquare className="w-4 h-4 mr-2" /> Mark Complete
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 bg-[#0f172a] border-gray-800 shadow-xl shadow-black/20 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-emerald-500" />
                Execution Progress
              </h3>
              <p className="text-sm text-gray-400">
                <span className="text-white font-medium">{completedCount}</span> of{' '}
                <span className="text-white font-medium">{totalCount}</span> steps completed
              </p>
            </div>
            <ProgressCircle
              percentage={currentPct}
              size="lg"
              title="Overall"
            />
          </div>
        </Card>
      </motion.div>

      {/* Grid Layout: Left (60%) / Right (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 xl:gap-8 min-h-[calc(100vh-16rem)]">

        {/* ── LEFT COLUMN (60%): Workflow + Checklist ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 space-y-6 flex flex-col h-full"
        >
          {/* Workflow Section */}
          <Card className="p-6 bg-[#020617] border-gray-800 rounded-2xl flex-shrink-0">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-800">
              <div className="p-1.5 bg-blue-500/10 rounded-lg">
                <Settings2 className="w-4 h-4 text-blue-500" />
              </div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Execution Workflow
              </h3>
            </div>

            <div className="space-y-4">
              {policy.steps.map((step, idx) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 + 0.3 }}
                  className="p-4 bg-[#0f172a] hover:bg-[#151f32] rounded-xl border border-gray-800 hover:border-gray-700 transition-colors group flex items-start gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400 font-bold text-sm">
                    {step.order}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-4">
                      <h4 className="font-semibold text-white truncate text-base">
                        {step.title}
                      </h4>
                      <Badge
                        variant="outline"
                        className={`flex-shrink-0 text-[10px] uppercase tracking-wider ${step.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : step.status === 'in-progress'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-gray-800 text-gray-400 border-gray-700'
                          }`}
                      >
                        {step.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Checklist Section */}
          <Card className="p-6 bg-[#020617] border-gray-800 rounded-2xl flex-1">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-800">
              <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                <CheckSquare className="w-4 h-4 text-emerald-500" />
              </div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Action Items Checklist
              </h3>
            </div>
            <InteractiveChecklist
              policyId={policy.id}
              items={policy.checklist_items as any}
              onUpdate={items => setCompletedCount(items.filter(c => c.completed).length)}
            />
          </Card>
        </motion.div>

        {/* ── RIGHT COLUMN (40%): Decision Tree + Preview ──────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 space-y-6 flex flex-col h-full"
        >
          {/* Decision Tree Section */}
          <Card className="p-6 bg-[#020617] border-gray-800 rounded-2xl flex-1 min-h-[400px] flex flex-col">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-800">
              <div className="p-1.5 bg-amber-500/10 rounded-lg">
                <Settings2 className="w-4 h-4 text-amber-500 transform rotate-90" />
              </div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Decision Matrix
              </h3>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden border border-gray-800/60 bg-[#0a1120]">
              <DecisionTreeComponent tree={policy.decisionTree} />
            </div>
          </Card>

          {/* Original Source / Policy Preview Section */}
          <Card className="p-6 bg-[#0f172a] border-gray-800 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gray-800 rounded-lg">
                  <FileText className="w-4 h-4 text-gray-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Source Document
                </h3>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-blue-400 hover:text-blue-300 hover:bg-transparent">
                View Full Text <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            <div className="relative rounded-xl border border-gray-800 bg-[#020617] p-4 text-sm text-gray-500 max-h-[250px] overflow-hidden">
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#020617] to-transparent pointer-events-none" />
              {policy.description || policy.title}
            </div>
          </Card>
        </motion.div>

        {/* Workflow Graph (New) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-12 rounded-2xl border border-gray-800 bg-[#0f172a] overflow-hidden"
        >
          <div className="flex items-center gap-3 border-b border-gray-800 px-6 py-5 shrink-0">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
              <Settings2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Workflow Graph</h2>
              <p className="text-sm text-gray-500">Visual mapping of policy logic</p>
            </div>
          </div>
          <div className="relative" style={{ height: 600 }}>
            {policy.graph?.nodes && policy.graph.nodes.length > 0 ? (
              <WorkflowGraph graph={policy.graph} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <p className="text-sm italic text-gray-500">Graph not available for this policy</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <ValidateCaseSection policyId={policy.id} />
    </div>
  );
}
