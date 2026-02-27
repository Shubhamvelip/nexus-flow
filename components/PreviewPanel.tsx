'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, GitBranch, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { WorkflowStep, DecisionNode, ChecklistItem } from '@/lib/types';

interface PreviewPanelProps {
  workflowSteps: WorkflowStep[];
  decisionTree: DecisionNode[];
  checklist: ChecklistItem[];
}

export function PreviewPanel({
  workflowSteps,
  decisionTree,
  checklist,
}: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState('workflow');

  return (
    <Card className="h-full bg-card border-border overflow-hidden flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        {/* Tab List */}
        <TabsList className="bg-muted border-b border-border rounded-none w-full justify-start px-4 py-3 h-auto gap-4">
          <TabsTrigger value="workflow" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Workflow Steps</span>
            <span className="sm:hidden">Steps</span>
          </TabsTrigger>
          <TabsTrigger value="decision" className="gap-2">
            <GitBranch className="w-4 h-4" />
            <span className="hidden sm:inline">Decision Tree</span>
            <span className="sm:hidden">Tree</span>
          </TabsTrigger>
          <TabsTrigger value="checklist" className="gap-2">
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Checklist</span>
            <span className="sm:hidden">List</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        <TabsContent
          value="workflow"
          className="flex-1 overflow-auto p-4 space-y-3 mt-0"
        >
          {workflowSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-3 p-3 bg-muted rounded-lg"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground">
                {step.order}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground">{step.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {step.description}
                </p>
              </div>
              {step.completed && (
                <div className="flex-shrink-0 flex items-center">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
              )}
            </motion.div>
          ))}
        </TabsContent>

        {/* Decision Tree Tab */}
        <TabsContent
          value="decision"
          className="flex-1 overflow-auto p-4 space-y-3 mt-0"
        >
          {decisionTree.map((node, index) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 bg-muted rounded-lg space-y-2"
            >
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">Q:</span>
                <p className="text-foreground text-sm">{node.question}</p>
              </div>
              <div className="ml-6 space-y-1 border-l border-primary/30 pl-3">
                <div>
                  <span className="text-xs font-medium text-emerald-500">
                    YES →
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {node.trueAction}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-red-500">
                    NO →
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {node.falseAction}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </TabsContent>

        {/* Checklist Tab */}
        <TabsContent
          value="checklist"
          className="flex-1 overflow-auto p-4 space-y-2 mt-0"
        >
          {checklist.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-3 p-3 bg-muted rounded-lg"
            >
              <input
                type="checkbox"
                checked={item.completed}
                disabled
                className="mt-0.5 w-4 h-4 cursor-not-allowed"
              />
              <div className="flex-1 min-w-0">
                <h4
                  className={`font-medium text-sm ${
                    item.completed
                      ? 'text-muted-foreground line-through'
                      : 'text-foreground'
                  }`}
                >
                  {item.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
