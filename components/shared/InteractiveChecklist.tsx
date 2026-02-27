'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, AlertCircle, Clock, Trophy } from 'lucide-react';

export interface ChecklistItemData {
    id: string;
    title?: string;
    label?: string;   // plain string items from API
    description?: string;
    completed?: boolean;
    status?: 'pending' | 'completed' | 'flagged';
    order?: number;
}

interface InteractiveChecklistProps {
    /** Can be an array of objects OR plain strings (from Gemini API) */
    items: ChecklistItemData[] | string[];
    /** If true, shows descriptions when available */
    showDescriptions?: boolean;
}

function normalizeItems(raw: ChecklistItemData[] | string[]): ChecklistItemData[] {
    return raw.map((item, idx) => {
        if (typeof item === 'string') {
            return { id: `item-${idx}`, title: item, completed: false };
        }
        return item;
    });
}

function StatusIcon({ done, flagged }: { done: boolean; flagged: boolean }) {
    if (done) return <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />;
    if (flagged) return <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />;
    return <Circle className="w-4 h-4 text-gray-600 flex-shrink-0" />;
}

export function InteractiveChecklist({
    items,
    showDescriptions = true,
}: InteractiveChecklistProps) {
    const normalized = normalizeItems(items);

    const [completed, setCompleted] = useState<Set<string>>(
        new Set(normalized.filter((i) => i.completed).map((i) => i.id))
    );

    const toggle = (id: string) => {
        setCompleted((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    if (!normalized || normalized.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-800/60 border border-gray-700 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-gray-600" />
                </div>
                <p className="text-sm text-gray-500">No checklist items defined.</p>
            </div>
        );
    }

    const doneCount = completed.size;
    const total = normalized.length;
    const pct = Math.round((doneCount / total) * 100);
    const allDone = doneCount === total;

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
                    {normalized.map((item) => (
                        <motion.div
                            key={item.id}
                            animate={{ backgroundColor: completed.has(item.id) ? 'rgb(34,197,94)' : 'rgb(31,41,55)' }}
                            transition={{ duration: 0.3 }}
                            className="flex-1 h-1 rounded-full"
                        />
                    ))}
                </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
                {normalized.map((item, idx) => {
                    const isDone = completed.has(item.id);
                    const isFlagged = !isDone && item.status === 'flagged';
                    const label = item.title ?? item.label ?? `Item ${idx + 1}`;

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
                                    : isFlagged
                                        ? 'bg-amber-500/5 border-amber-500/20'
                                        : 'bg-[#080f1f] border-gray-800 hover:border-gray-600 hover:bg-[#0d1830]'
                                }
              `}
                        >
                            <motion.div
                                animate={{ rotate: isDone ? 0 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <StatusIcon done={isDone} flagged={isFlagged} />
                            </motion.div>

                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium transition-colors leading-snug ${isDone ? 'text-gray-500 line-through' : 'text-white'
                                    }`}>
                                    {label}
                                </p>
                                {showDescriptions && item.description && (
                                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{item.description}</p>
                                )}
                            </div>

                            {isFlagged && (
                                <span className="text-xs font-semibold text-amber-400 border border-amber-500/30 rounded px-2 py-0.5 flex-shrink-0">
                                    Flagged
                                </span>
                            )}

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
