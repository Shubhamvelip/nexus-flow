'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, AlertCircle, Trophy } from 'lucide-react';
import { updatePolicyChecklist, PolicyChecklistItem } from '@/lib/firebase';

interface InteractiveChecklistProps {
    items: PolicyChecklistItem[] | string[];
    showDescriptions?: boolean;
    policyId?: string;
    onProgressChange?: (pct: number) => void;
    onUpdate?: (items: PolicyChecklistItem[]) => void;
}

function normalizeItems(raw: PolicyChecklistItem[] | string[]): PolicyChecklistItem[] {
    return raw.map((item, idx) => {
        if (typeof item === 'string') {
            return { id: `item-temp-${idx}`, title: item, completed: false };
        }
        return item; // PolicyChecklistItem
    });
}

function StatusIcon({ done, flagged }: { done: boolean; flagged?: boolean }) {
    if (done) return <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />;
    if (flagged) return <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />;
    return <Circle className="w-4 h-4 text-gray-600 flex-shrink-0" />;
}

export function InteractiveChecklist({
    items,
    showDescriptions = true,
    policyId,
    onProgressChange,
    onUpdate,
}: InteractiveChecklistProps) {
    const [localItems, setLocalItems] = useState<PolicyChecklistItem[]>([]);

    useEffect(() => {
        const normalized = normalizeItems(items);
        setLocalItems(normalized);
        const doneCount = normalized.filter(i => i.completed).length;
        const total = normalized.length;
        const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
        onProgressChange?.(pct);
    }, [items, onProgressChange]);

    const toggle = async (id: string) => {
        let updatedItems: PolicyChecklistItem[] = [];
        let newPct = 0;

        setLocalItems((prev) => {
            updatedItems = prev.map(item =>
                item.id === id ? { ...item, completed: !item.completed } : item
            );

            const doneCount = updatedItems.filter(i => i.completed).length;
            const total = updatedItems.length;
            newPct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
            return updatedItems;
        });

        // Inform parent of new progress instantly
        setTimeout(() => {
            onProgressChange?.(newPct);
            onUpdate?.(updatedItems);
        }, 0);

        if (policyId && updatedItems.length > 0) {
            try {
                // Ensure no dangling local properties leak to Firestore, though we only have id, title, completed
                await updatePolicyChecklist(policyId, updatedItems);
            } catch (error) {
                console.error("Optimistic update failed:", error);
                // Optionally revert local state here
            }
        }
    };

    if (!localItems || localItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-800/60 border border-gray-700 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-gray-600" />
                </div>
                <p className="text-sm text-gray-500">No checklist items defined.</p>
            </div>
        );
    }

    const doneCount = localItems.filter(i => i.completed).length;
    const total = localItems.length;
    const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
    const allDone = total > 0 && doneCount === total;

    return (
        <div className="space-y-4">
            {/* Header + Progress */}
            <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                        {doneCount} of {total} tasks complete
                    </span>
                    <motion.span
                        key={pct}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`text-sm font-bold tabular-nums ${allDone ? 'text-green-400' : 'text-white'}`}
                    >
                        {pct}%
                    </motion.span>
                </div>

                {/* Progress bar */}
                <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full rounded-full ${allDone ? 'bg-green-500' : 'bg-green-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                    {/* Shine effect */}
                    {pct > 0 && (
                        <motion.div
                            className="absolute top-0 left-0 h-full w-full"
                            style={{
                                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                                backgroundSize: '200% 100%',
                            }}
                            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        />
                    )}
                </div>

                {/* Segment dots */}
                <div className="flex gap-1">
                    {localItems.map((item) => (
                        <motion.div
                            key={item.id}
                            animate={{ backgroundColor: item.completed ? 'rgb(34,197,94)' : 'rgb(31,41,55)' }}
                            transition={{ duration: 0.3 }}
                            className="flex-1 h-1 rounded-full"
                        />
                    ))}
                </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
                {localItems.map((item, idx) => {
                    const isDone = item.completed;
                    const label = item.title ?? `Item ${idx + 1}`;

                    return (
                        <motion.button
                            key={item.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.04, duration: 0.3 }}
                            whileHover={{ scale: 1.005 }}
                            whileTap={{ scale: 0.995 }}
                            onClick={() => toggle(item.id)}
                            className={`
                w-full text-left flex items-start gap-3 p-3.5 rounded-xl border transition-all
                ${isDone
                                    ? 'bg-green-500/8 border-green-500/25 shadow-[inset_0_0_20px_rgba(34,197,94,0.04)]'
                                    : 'bg-[#080f1f] border-gray-800 hover:border-gray-600 hover:bg-[#0d1830]'
                                }
              `}
                        >
                            <motion.div
                                animate={{ rotate: isDone ? 0 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <StatusIcon done={isDone} />
                            </motion.div>

                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium transition-colors leading-snug ${isDone ? 'text-gray-500 line-through' : 'text-white'
                                    }`}>
                                    {label}
                                </p>
                            </div>

                            {isDone && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-4 h-4 flex-shrink-0"
                                >
                                    <div className="w-full h-full rounded-full bg-green-500/20 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    </div>
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Completion state */}
            {allDone && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="flex items-center gap-3 justify-center py-3.5 bg-green-500/10 border border-green-500/25 rounded-xl"
                >
                    <Trophy className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-400">
                        All tasks complete — ready for deployment!
                    </span>
                </motion.div>
            )}
        </div>
    );
}
