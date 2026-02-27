'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ExecutionChecklist } from './ExecutionChecklist';
import { SourceReferencePanel } from './SourceReferencePanel';
import { AIAssistantDrawer } from './AIAssistantDrawer';
import { mockPolicies } from '@/lib/mockData';
import { Progress } from '@/components/ui/progress';

interface PolicyDetailContentProps {
  policyId: string;
}

export function PolicyDetailContent({ policyId }: PolicyDetailContentProps) {
  const router = useRouter();
  const policy = useMemo(() => {
    return mockPolicies.find((p) => p.id === policyId) || mockPolicies[0];
  }, [policyId]);

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-start justify-between gap-4"
      >
        <div className="flex-1">
          <Link href="/policies">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Policies
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">{policy.title}</h1>
          <p className="text-muted-foreground mt-2">{policy.description}</p>
        </div>
        <div className="flex gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="icon"
              className="border-border text-foreground hover:bg-muted"
            >
              <Download className="w-5 h-5" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="icon"
              className="border-border text-foreground hover:bg-muted"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Progress Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Policy Execution Progress
              </h2>
              <span className="text-3xl font-bold text-primary">
                {policy.progress}%
              </span>
            </div>
            <Progress value={policy.progress} className="h-2" />
            <p className="text-sm text-foreground/80">
              {policy.progress < 50
                ? 'You\'re making good progress. Keep going!'
                : policy.progress < 100
                  ? 'Almost there! Complete the remaining tasks.'
                  : 'Policy execution is complete!'}
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Left: Execution Checklist */}
        <div className="lg:col-span-2">
          <ExecutionChecklist items={policy.checklist} />
        </div>

        {/* Right: Source Reference */}
        <div>
          <SourceReferencePanel
            policyTitle={policy.title}
            source={policy.source}
          />
        </div>
      </motion.div>

      {/* Additional Info Sections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Policy Details Card */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Policy Information
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Status
              </p>
              <p className="text-sm text-foreground mt-1 capitalize">
                <span
                  className={`inline-block px-3 py-1 rounded-full font-medium text-xs ${
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
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Created
              </p>
              <p className="text-sm text-foreground mt-1">
                {policy.createdAt.toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Last Updated
              </p>
              <p className="text-sm text-foreground mt-1">
                {policy.updatedAt.toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        {/* Quick Actions Card */}
        <Card className="p-6 bg-card border-border space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <Button 
              onClick={() => router.push(`/policies/${policy.id}/edit`)}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Edit Policy
            </Button>
            <Button
              onClick={() => router.push(`/policies/${policy.id}/history`)}
              variant="outline"
              className="w-full border-border text-foreground hover:bg-muted"
            >
              View History
            </Button>
            <Button
              onClick={() => {
                // Trigger PDF export
                alert('Exporting policy as PDF: ' + policy.title);
              }}
              variant="outline"
              className="w-full border-border text-foreground hover:bg-muted"
            >
              Export as PDF
            </Button>
            {policy.status === 'draft' && (
              <Button
                onClick={() => router.push('/policies?action=new')}
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Save as New Policy
              </Button>
            )}
          </div>
        </Card>
      </motion.div>

      {/* AI Assistant Drawer */}
      <AIAssistantDrawer />
    </div>
  );
}
