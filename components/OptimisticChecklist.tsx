'use client';

import { useOptimistic, useTransition } from 'react';
import { ChecklistItem, ChecklistState } from '@/types/policy';
import { saveChecklistState } from '@/lib/data-service';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface OptimisticChecklistProps {
  policyId: string;
  items: ChecklistItem[];
  initialState: ChecklistState;
  onStateChange?: (state: ChecklistState) => void;
}

export function OptimisticChecklist({
  policyId,
  items,
  initialState,
  onStateChange,
}: OptimisticChecklistProps) {
  const [isPending, startTransition] = useTransition();

  // Optimistic state updates - UI reflects immediately
  const [optimisticState, addOptimisticState] = useOptimistic<
    ChecklistState,
    { itemId: string; completed: boolean }
  >(initialState, (state, { itemId, completed }) => ({
    ...state,
    items: {
      ...state.items,
      [itemId]: completed,
    },
    lastUpdated: new Date(),
  }));

  const handleChecklistChange = async (
    itemId: string,
    completed: boolean
  ) => {
    // Optimistic update - show change immediately
    addOptimisticState({ itemId, completed });

    // Then save to backend
    startTransition(async () => {
      try {
        const newState = await saveChecklistState(policyId, itemId, completed);
        console.log(`[v0] Checklist item ${itemId} updated: ${completed}`);
        onStateChange?.(newState);
      } catch (error) {
        console.error('[v0] Failed to save checklist state:', error);
      }
    });
  };

  const completedCount = Object.values(optimisticState.items).filter(
    Boolean
  ).length;
  const totalCount = items.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <Card className="p-4 bg-card border-border">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Progress
            </h3>
            <span className="text-xs text-muted-foreground">
              {completedCount} of {totalCount} complete
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {completionPercentage}% Complete
          </p>
        </div>
      </Card>

      {/* Checklist Items */}
      <Card className="p-6 bg-card border-border">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Execution Checklist
          </h3>

          <AnimatePresence>
            {items
              .sort((a, b) => a.order - b.order)
              .map((item, idx) => {
                const isCompleted = optimisticState.items[item.id] || false;
                const isOptimistic = isPending;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-4 rounded-lg transition-all border ${
                      isCompleted
                        ? 'bg-primary/5 border-primary/20'
                        : 'bg-muted/50 border-border'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <motion.button
                        onClick={() =>
                          handleChecklistChange(item.id, !isCompleted)
                        }
                        disabled={isOptimistic}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="mt-1 flex-shrink-0 disabled:opacity-50"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                        )}
                      </motion.button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <motion.label
                          animate={{
                            textDecoration: isCompleted
                              ? 'line-through'
                              : 'none',
                          }}
                          className={`font-medium transition-colors cursor-pointer ${
                            isCompleted
                              ? 'text-muted-foreground'
                              : 'text-foreground'
                          }`}
                        >
                          {item.title}
                        </motion.label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      </div>

                      {/* Optimistic Indicator */}
                      {isOptimistic && (
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="flex-shrink-0"
                        >
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>
      </Card>

      {/* Summary */}
      <Card className="p-4 bg-muted/30 border-border">
        <p className="text-sm text-muted-foreground text-center">
          {completedCount === totalCount
            ? '✓ All tasks completed! Ready for next phase.'
            : `${totalCount - completedCount} remaining task${
                totalCount - completedCount !== 1 ? 's' : ''
              }`}
        </p>
      </Card>
    </div>
  );
}
