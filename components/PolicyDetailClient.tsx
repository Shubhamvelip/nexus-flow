'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Policy, ChecklistState } from '@/types/policy';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OptimisticChecklist } from '@/components/OptimisticChecklist';
import { DecisionTreeComponent } from '@/components/DecisionTree';
import { ProgressCircle } from '@/components/ProgressCircle';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Share2 } from 'lucide-react';

interface PolicyDetailClientProps {
  policy: Policy;
  initialState: ChecklistState;
}

export function PolicyDetailClient({
  policy,
  initialState,
}: PolicyDetailClientProps) {
  const [checklistState, setChecklistState] = useState(initialState);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">{policy.title}</h1>
        </div>

        <div className="flex items-center gap-4">
          <Badge
            variant="default"
            className={
              policy.status === 'active'
                ? 'bg-emerald-600 text-white'
                : policy.status === 'draft'
                  ? 'bg-amber-600 text-white'
                  : 'bg-muted text-foreground'
            }
          >
            {policy.status.toUpperCase()}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Updated {new Date(policy.updatedAt).toLocaleDateString()}
          </span>
        </div>

        <p className="text-muted-foreground">{policy.description}</p>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Overall Progress
              </h3>
              <p className="text-sm text-muted-foreground">
                {Object.values(checklistState.items).filter(Boolean).length} of{' '}
                {Object.keys(checklistState.items).length} items complete
              </p>
            </div>
            <ProgressCircle
              percentage={policy.completionPercentage}
              size="lg"
              title="Overall"
            />
          </div>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="checklist" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="tree">Decision Tree</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
          </TabsList>

          {/* Checklist Tab */}
          <TabsContent value="checklist" className="space-y-4 mt-6">
            <OptimisticChecklist
              policyId={policy.id}
              items={policy.checklist_items}
              initialState={checklistState}
              onStateChange={setChecklistState}
            />
          </TabsContent>

          {/* Decision Tree Tab */}
          <TabsContent value="tree" className="space-y-4 mt-6">
            <DecisionTreeComponent tree={policy.decisionTree} />
          </TabsContent>

          {/* Workflow Tab */}
          <TabsContent value="workflow" className="space-y-4 mt-6">
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Workflow Steps
              </h3>
              <div className="space-y-3">
                {policy.steps.map((step, idx) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 bg-muted rounded-lg border border-border"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {step.order}. {step.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {step.description}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          step.status === 'completed'
                            ? 'bg-emerald-600/10 text-emerald-700 border-emerald-600/20'
                            : step.status === 'in-progress'
                              ? 'bg-blue-600/10 text-blue-700 border-blue-600/20'
                              : 'bg-muted text-foreground'
                        }
                      >
                        {step.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-3"
      >
        <Button variant="outline" className="border-border text-foreground hover:bg-muted">
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        <Button variant="outline" className="border-border text-foreground hover:bg-muted">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </motion.div>
    </div>
  );
}
