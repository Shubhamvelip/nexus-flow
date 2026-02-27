'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle, ArrowRight, Clock, AlertCircle } from 'lucide-react';

export interface WorkflowStepData {
    id?: string;
    title?: string;
    step?: string;          // from API (Gemini) response
    description: string;
    order?: number;
    status?: 'pending' | 'in-progress' | 'completed' | 'skipped';
    completed?: boolean;    // from lib/types.ts schema
}

interface WorkflowTimelineProps {
    steps: WorkflowStepData[];
    /** If true, marks are not interactive and stay as-is */
    readonly?: boolean;
}

function getStepLabel(step: WorkflowStepData, idx: number): string {
    return step.title ?? step.step ?? `Step ${idx + 1}`;
}

function getStepStatus(step: WorkflowStepData) {
    if (step.completed === true || step.status === 'completed') return 'completed';
    if (step.status === 'in-progress') return 'in-progress';
    if (step.status === 'skipped') return 'skipped';
    return 'pending';
}

export function WorkflowTimeline({ steps, readonly = false }: WorkflowTimelineProps) {
    if (!steps || steps.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-800/60 border border-gray-700 flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-gray-600" />
                </div>
                <p className="text-sm text-gray-500">No workflow steps defined.</p>
            </div>
        );
    }

    return (
        <div className="relative">
            {steps.map((step, idx) => {
                const status = getStepStatus(step);
                const label = getStepLabel(step, idx);
                const isCompleted = status === 'completed';
                const isActive = status === 'in-progress';
                const isLast = idx === steps.length - 1;

                return (
                    <motion.div
                        key={step.id ?? idx}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.07, duration: 0.4 }}
                        className="flex gap-4 group"
                    >
                        {/* Timeline column */}
                        <div className="flex flex-col items-center flex-shrink-0">
                            {/* Step indicator */}
                            <motion.div
                                initial={{ scale: 0.7 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: idx * 0.07 + 0.1 }}
                                className={`
                  relative w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 transition-all
                  ${isCompleted
                                        ? 'bg-green-500/20 border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                                        : isActive
                                            ? 'bg-blue-500/20 border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                                            : 'bg-gray-900 border-gray-700 group-hover:border-gray-500'
                                    }
                `}
                            >
                                {isCompleted ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : isActive ? (
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="w-3 h-3 rounded-full bg-blue-500"
                                    />
                                ) : (
                                    <span className="text-xs font-bold text-gray-400">{idx + 1}</span>
                                )}

                                {/* Pulse ring for active */}
                                {isActive && (
                                    <motion.div
                                        animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                                        transition={{ duration: 1.2, repeat: Infinity }}
                                        className="absolute inset-0 rounded-full border-2 border-blue-500"
                                    />
                                )}
                            </motion.div>

                            {/* Connector line */}
                            {!isLast && (
                                <motion.div
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    transition={{ delay: idx * 0.07 + 0.2, duration: 0.4 }}
                                    style={{ transformOrigin: 'top' }}
                                    className={`w-0.5 flex-1 my-1 min-h-[2rem] ${isCompleted ? 'bg-green-500/40' : 'bg-gray-800'
                                        }`}
                                />
                            )}
                        </div>

                        {/* Content */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.07 + 0.15 }}
                            className={`pb-6 flex-1 min-w-0 ${isLast ? 'pb-0' : ''}`}
                        >
                            <div
                                className={`
                  rounded-xl border p-3.5 transition-all
                  ${isCompleted
                                        ? 'bg-green-500/5 border-green-500/20'
                                        : isActive
                                            ? 'bg-blue-500/5 border-blue-500/20'
                                            : 'bg-[#0a1628] border-gray-800 group-hover:border-gray-700'
                                    }
                `}
                            >
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <p className={`text-sm font-semibold leading-tight ${isCompleted ? 'text-green-400' : isActive ? 'text-blue-400' : 'text-white'
                                        }`}>
                                        {label}
                                    </p>
                                    {isCompleted && (
                                        <span className="text-xs text-green-500 font-medium flex-shrink-0 mt-0.5">✓ Done</span>
                                    )}
                                    {isActive && (
                                        <span className="text-xs text-blue-400 font-medium flex-shrink-0 mt-0.5 flex items-center gap-1">
                                            <motion.span
                                                animate={{ opacity: [1, 0, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            >●</motion.span>
                                            Active
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">{step.description}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                );
            })}

            {/* Completion banner */}
            {steps.every((s) => getStepStatus(s) === 'completed') && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-2.5 justify-center py-3 bg-green-500/10 border border-green-500/25 rounded-xl mt-2"
                >
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-semibold text-green-400">
                        All workflow steps complete!
                    </span>
                </motion.div>
            )}
        </div>
    );
}
