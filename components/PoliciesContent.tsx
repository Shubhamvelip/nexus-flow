'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight, FileText, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { mockPolicies } from '@/lib/mockData';

export function PoliciesContent() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-semibold text-white">All Policies</h1>
          <p className="text-sm text-gray-400 mt-1">Manage and track your government policies</p>
        </div>
        <Button
          onClick={() => router.push('/generator')}
          className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2 text-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Policy
        </Button>
      </motion.div>

      {/* Policies Grid or Empty State */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {mockPolicies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockPolicies.map((policy, index) => (
              <motion.div
                key={policy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -2 }}
              >
                <Link href={`/policies/${policy.id}`}>
                  <div className="group bg-[#0f172a] border border-gray-800 rounded-2xl p-5 hover:border-green-500/40 hover:bg-[#111f38] transition-all cursor-pointer h-full flex flex-col">
                    {/* Status Badge */}
                    <div className="mb-3">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium ${policy.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : policy.status === 'draft'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-slate-500/20 text-slate-400'
                          }`}
                      >
                        {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="font-semibold text-white text-sm line-clamp-2 mb-2 group-hover:text-green-400 transition-colors">
                      {policy.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-4 flex-1 leading-relaxed">
                      {policy.description}
                    </p>

                    {/* Progress */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Progress</span>
                        <span className="text-xs font-semibold text-white">{policy.progress}%</span>
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

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
                      <span className="text-xs text-gray-600">
                        Updated {new Date(policy.updatedAt).toLocaleDateString()}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-green-400 transition-colors" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          /* ── Empty State ── */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col items-center justify-center py-24 gap-5 bg-[#0f172a] border border-dashed border-gray-800 rounded-2xl"
          >
            <motion.div
              animate={{ scale: [0.95, 1, 0.95] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-16 h-16 rounded-2xl bg-gray-800/60 border border-gray-700 flex items-center justify-center"
            >
              <FileText className="w-7 h-7 text-gray-600" />
            </motion.div>

            <div className="text-center space-y-1.5">
              <p className="text-base font-semibold text-gray-300">No policies yet</p>
              <p className="text-sm text-gray-600 max-w-xs">
                Generate your first policy to get started. Use the AI generator to create a
                structured workflow in seconds.
              </p>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/generator')}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors"
              >
                <Zap className="w-4 h-4" />
                Generate First Policy
              </motion.button>
            </div>

            {/* Ghost grid preview */}
            <div className="grid grid-cols-3 gap-3 mt-4 opacity-20 pointer-events-none w-full max-w-lg px-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-800 rounded-xl h-24 border border-gray-700" />
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
