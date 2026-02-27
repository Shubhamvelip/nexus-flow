'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { mockPolicies } from '@/lib/mockData';

export function PoliciesContent() {
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
          <h1 className="text-3xl font-bold text-foreground">All Policies</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your government policies
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          New Policy
        </Button>
      </motion.div>

      {/* Policies Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {mockPolicies.map((policy, index) => (
          <motion.div
            key={policy.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Link href={`/policies/${policy.id}`}>
              <Card className="p-6 bg-card border-border hover:border-primary/50 cursor-pointer transition-all h-full flex flex-col">
                {/* Status Badge */}
                <div className="mb-3">
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

                {/* Content */}
                <h3 className="font-semibold text-foreground text-lg line-clamp-2 mb-2">
                  {policy.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                  {policy.description}
                </p>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Progress
                    </span>
                    <span className="text-xs font-medium text-foreground">
                      {policy.progress}%
                    </span>
                  </div>
                  <Progress value={policy.progress} className="h-2" />
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Updated{' '}
                    {new Date(policy.updatedAt).toLocaleDateString()}
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State for filtering */}
      {mockPolicies.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-muted-foreground">No policies found</p>
        </motion.div>
      )}
    </div>
  );
}
