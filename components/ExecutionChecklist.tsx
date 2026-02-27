'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle, Circle } from 'lucide-react';
import { motion } from 'framer-motion';
import { ChecklistItem } from '@/lib/types';

interface ExecutionChecklistProps {
  items: ChecklistItem[];
  onItemToggle?: (id: string) => void;
}

export function ExecutionChecklist({
  items,
  onItemToggle,
}: ExecutionChecklistProps) {
  const [completedItems, setCompletedItems] = useState<Set<string>>(
    new Set(items.filter((i) => i.completed).map((i) => i.id))
  );

  const handleToggle = (id: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompletedItems(newCompleted);
    onItemToggle?.(id);
  };

  const completionPercentage = Math.round(
    (completedItems.size / items.length) * 100
  );

  return (
    <Card className="bg-card border-border overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground">
            Execution Checklist
          </h3>
          <span className="text-sm font-medium text-muted-foreground">
            {completedItems.size}/{items.length} Complete
          </span>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full bg-primary rounded-full"
          ></motion.div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {completionPercentage}% Complete
        </p>
      </div>

      {/* Checklist Items */}
      <div className="divide-y divide-border">
        {items.map((item, index) => {
          const isCompleted = completedItems.has(item.id);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleToggle(item.id)}
              className={`p-4 cursor-pointer transition-colors ${
                isCompleted ? 'bg-primary/5' : 'hover:bg-muted'
              }`}
            >
              <div className="flex items-start gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-0.5 flex-shrink-0"
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </motion.div>
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </motion.button>
                <div className="flex-1 min-w-0">
                  <h4
                    className={`font-medium text-sm transition-all ${
                      isCompleted
                        ? 'text-muted-foreground line-through'
                        : 'text-foreground'
                    }`}
                  >
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
