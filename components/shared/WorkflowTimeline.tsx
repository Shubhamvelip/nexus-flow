'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle, ArrowRight, Clock, AlertCircle, PlayCircle, Layers, Fingerprint, Activity, Zap } from 'lucide-react';

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

const STEP_ICONS = [Layers, Activity, Fingerprint, Zap, PlayCircle, CheckCircle2];

function getIconForStep(idx: number) {
    return STEP_ICONS[idx % STEP_ICONS.length];
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
                  relative w-10 h-10 rounded-2xl flex items-center justify-center z-10 border transition-all duration-300
                  ${isCompleted
                                        ? 'bg-green-500/10 border-green-500/40 shadow-[0_0_15px_rgba(34,197,94,0.2)] text-green-400 group-hover:bg-green-500/20 group-hover:border-green-500'
                                        : isActive
                                            ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] text-blue-400'
                                            : 'bg-[#0f172a] border-gray-700 text-gray-500 group-hover:border-gray-500 group-hover:text-gray-300 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                                    }
                `}
                            >
                                {isCompleted ? (
                                    <CheckCircle2 className="w-5 h-5" />
                                ) : (
                                    (() => {
                                        const Icon = getIconForStep(idx);
                                        return <Icon className="w-5 h-5" />;
                                    })()
                                )}

                                {/* Pulse ring for active */}
                                {isActive && (
                                    <motion.div
                                        animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="absolute inset-0 rounded-2xl border border-blue-500"
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
                                    className={`w-0.5 flex-1 my-2 min-h-[2.5rem] rounded-full transition-colors duration-300 ${isCompleted ? 'bg-gradient-to-b from-green-500/50 to-green-500/10' : 'bg-gray-800 group-hover:bg-gray-700'
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
                  rounded-xl border p-4 transition-all duration-300
                  ${isCompleted
                                        ? 'bg-green-500/5 border-green-500/20'
                                        : isActive
                                            ? 'bg-blue-500/5 border-blue-500/30 shadow-[0_4px_20px_rgba(59,130,246,0.05)]'
                                            : 'bg-[#0f172a] border-gray-800 group-hover:border-gray-600 group-hover:bg-[#131d36] group-hover:-translate-y-0.5 group-hover:shadow-lg'
                                    }
                `}
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
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
