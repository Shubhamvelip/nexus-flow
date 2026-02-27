'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle2, HelpCircle, ZoomIn, ZoomOut, Maximize, ArrowDown } from 'lucide-react';

// ── Two schemas: API response (recursive question/yes/no) ────────────────────

export interface ApiDecisionTree {
    question: string;
    yes: ApiDecisionTree | { action: string };
    no: ApiDecisionTree | { action: string };
}

// Types.ts schema (flat array of nodes)
export interface DecisionNodeFlat {
    id: string;
    question: string;
    trueAction: string;
    falseAction: string;
    children?: DecisionNodeFlat[];
}

type TreeData =
    | { type: 'api'; data: ApiDecisionTree }
    | { type: 'flat'; data: DecisionNodeFlat[] };

interface VisualDecisionTreeProps {
    tree: ApiDecisionTree | DecisionNodeFlat[] | null | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// API-schema recursive renderer
// ─────────────────────────────────────────────────────────────────────────────
function isApiTree(obj: unknown): obj is ApiDecisionTree {
    return !!obj && typeof obj === 'object' && 'question' in (obj as object);
}

function isLeaf(obj: unknown): obj is { action: string } {
    return !!obj && typeof obj === 'object' && 'action' in (obj as object) && !('question' in (obj as object));
}

interface ApiNodeProps {
    node: ApiDecisionTree;
    depth?: number;
}

function ApiTreeNode({ node, depth = 0 }: ApiNodeProps) {
    const [expandedYes, setExpandedYes] = useState(true);
    const [expandedNo, setExpandedNo] = useState(true);

    const yesIsLeaf = isLeaf(node.yes);
    const noIsLeaf = isLeaf(node.no);

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: depth * 0.08, duration: 0.35 }}
            className="flex flex-col items-center gap-0"
        >
            {/* Question box */}
            <div className="w-full max-w-sm">
                <div className="bg-gradient-to-br from-green-500/10 via-[#0f172a] to-blue-500/10 border border-green-500/30 rounded-2xl px-6 py-5 text-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-green-900/10 backdrop-blur-sm transition-all hover:border-green-500/50">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <HelpCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Decision</p>
                    </div>
                    <p className="text-sm font-semibold text-white leading-relaxed">{node.question}</p>
                </div>
            </div>

            {/* Connector down */}
            <div className="relative h-8 w-px bg-gray-600 flex flex-col justify-end items-center">
                <div className="w-2 h-2 border-b-2 border-r-2 border-gray-600 transform rotate-45 translate-y-1"></div>
            </div>

            {/* Branches */}
            <div className="flex w-full gap-8 items-start relative px-4">
                {/* Horizontal branch line connecting both sides */}
                <div className="absolute top-4 left-[25%] right-[25%] h-px bg-gray-700 -z-10" />

                {/* YES branch */}
                <div className="flex-1 flex flex-col items-center gap-0">
                    {/* Branch label */}
                    <button
                        onClick={() => setExpandedYes((v) => !v)}
                        className="flex items-center gap-2 bg-green-600/20 border border-green-500/40 rounded-xl px-4 py-2 text-xs font-bold text-green-400 hover:bg-green-600/30 hover:border-green-500 transition-all shadow-[0_0_15px_rgba(34,197,94,0.15)] z-10"
                    >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        YES
                        {!yesIsLeaf && (expandedYes ? <ChevronDown className="w-3.5 h-3.5 ml-1" /> : <ChevronRight className="w-3.5 h-3.5 ml-1" />)}
                    </button>

                    {/* Connector */}
                    <div className="relative h-6 w-px bg-green-500/40 flex flex-col justify-end items-center">
                        <div className="w-1.5 h-1.5 border-b-2 border-r-2 border-green-500/40 transform rotate-45 translate-y-0.5"></div>
                    </div>

                    {/* Content */}
                    <AnimatePresence>
                        {expandedYes && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="w-full"
                            >
                                {yesIsLeaf ? (
                                    <div className="bg-green-500/10 border border-green-500/30 rounded-2xl px-5 py-4 text-center max-w-[280px] shadow-lg shadow-green-900/10">
                                        <div className="flex items-center justify-center mb-2">
                                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium text-green-300 leading-relaxed">
                                            {(node.yes as { action: string }).action}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="pl-1">
                                        <ApiTreeNode node={node.yes as ApiDecisionTree} depth={depth + 1} />
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex-1 flex flex-col items-center gap-0">
                    <button
                        onClick={() => setExpandedNo((v) => !v)}
                        className="flex items-center gap-2 bg-[#0f172a] border border-gray-600 rounded-xl px-4 py-2 text-xs font-bold text-gray-300 hover:bg-gray-800 hover:text-white transition-all shadow-lg z-10"
                    >
                        <AlertCircle className="w-3.5 h-3.5" />
                        NO
                        {!noIsLeaf && (expandedNo ? <ChevronDown className="w-3.5 h-3.5 ml-1" /> : <ChevronRight className="w-3.5 h-3.5 ml-1" />)}
                    </button>

                    <div className="relative h-6 w-px bg-gray-600 flex flex-col justify-end items-center">
                        <div className="w-1.5 h-1.5 border-b-2 border-r-2 border-gray-600 transform rotate-45 translate-y-0.5"></div>
                    </div>

                    <AnimatePresence>
                        {expandedNo && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="w-full"
                            >
                                {noIsLeaf ? (
                                    <div className="bg-[#0f172a]/80 border border-gray-700 rounded-2xl px-5 py-4 text-center max-w-[280px] shadow-lg">
                                        <div className="flex items-center justify-center mb-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                                                <AlertCircle className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium text-gray-300 leading-relaxed">
                                            {(node.no as { action: string }).action}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="pl-1">
                                        <ApiTreeNode node={node.no as ApiDecisionTree} depth={depth + 1} />
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Flat-schema renderer (lib/types.ts DecisionNode array)
// ─────────────────────────────────────────────────────────────────────────────
function FlatTreeNode({ node, depth = 0 }: { node: DecisionNodeFlat; depth?: number }) {
    const [expandedYes, setExpandedYes] = useState(true);
    const [expandedNo, setExpandedNo] = useState(true);

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: depth * 0.08 }}
            className="flex flex-col items-center gap-0"
        >
            {/* Question */}
            <div className="w-full max-w-sm">
                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/5 border border-green-500/30 rounded-xl px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <HelpCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        <p className="text-xs font-bold text-gray-300 uppercase tracking-wide">Decision</p>
                    </div>
                    <p className="text-sm font-semibold text-white leading-snug">{node.question}</p>
                </div>
            </div>

            <div className="w-px h-5 bg-gray-700" />

            <div className="flex w-full gap-3 items-start">
                {/* YES */}
                <div className="flex-1 flex flex-col items-center gap-0">
                    <button
                        onClick={() => setExpandedYes((v) => !v)}
                        className="flex items-center gap-1.5 bg-green-600/20 border border-green-500/30 rounded-lg px-3 py-1.5 text-xs font-bold text-green-400 hover:bg-green-600/30 transition-colors"
                    >
                        <CheckCircle2 className="w-3 h-3" />
                        YES
                    </button>
                    <div className="w-px h-3 bg-green-500/40" />
                    <AnimatePresence>
                        {expandedYes && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="w-full"
                            >
                                <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2.5 text-center">
                                    <p className="text-xs text-green-300 leading-relaxed">{node.trueAction}</p>
                                </div>
                                {node.children && node.children.length > 0 && (
                                    <div className="mt-3 space-y-3">
                                        {node.children.map((child) => (
                                            <FlatTreeNode key={child.id} node={child} depth={depth + 1} />
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="w-px bg-gray-800 self-stretch mt-5 mx-1" />

                {/* NO */}
                <div className="flex-1 flex flex-col items-center gap-0">
                    <button
                        onClick={() => setExpandedNo((v) => !v)}
                        className="flex items-center gap-1.5 bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-400 hover:bg-gray-700 transition-colors"
                    >
                        <AlertCircle className="w-3 h-3" />
                        NO
                    </button>
                    <div className="w-px h-3 bg-gray-600" />
                    <AnimatePresence>
                        {expandedNo && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="w-full"
                            >
                                <div className="bg-gray-800/60 border border-gray-700 rounded-xl px-3 py-2.5 text-center">
                                    <p className="text-xs text-gray-400 leading-relaxed">{node.falseAction}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Public component — auto-detects schema
// ─────────────────────────────────────────────────────────────────────────────
export function VisualDecisionTree({ tree }: VisualDecisionTreeProps) {
    const [scale, setScale] = useState(1);

    const handleZoomIn = () => setScale(s => Math.min(s + 0.15, 1.6));
    const handleZoomOut = () => setScale(s => Math.max(s - 0.15, 0.4));
    const handleReset = () => setScale(1);

    if (!tree) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-800/60 border border-gray-700 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-gray-600" />
                </div>
                <p className="text-sm text-gray-500">No decision tree defined.</p>
            </div>
        );
    }

    // Wrap content with zoom controls and transform container
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <div className="relative w-full h-full min-h-[500px] overflow-hidden bg-[#0a1120] rounded-2xl border border-gray-800/60 flex items-center justify-center group">
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 z-50 flex items-center gap-1 bg-[#0f172a] border border-gray-700/60 rounded-xl p-1 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={handleZoomOut} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors" title="Zoom Out">
                    <ZoomOut className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-gray-700" />
                <button onClick={handleReset} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors" title="Reset Zoom">
                    <Maximize className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-gray-700" />
                <button onClick={handleZoomIn} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors" title="Zoom In">
                    <ZoomIn className="w-4 h-4" />
                </button>
            </div>

            {/* Canvas */}
            <div className="w-full h-full overflow-auto custom-scrollbar flex items-start justify-center p-8">
                <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center', transition: 'transform 0.2s ease-out' }}>
                    {children}
                </div>
            </div>
        </div>
    );

    // Array → flat schema
    if (Array.isArray(tree)) {
        if (tree.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <HelpCircle className="w-8 h-8 text-gray-600" />
                    <p className="text-sm text-gray-500">No decision tree defined.</p>
                </div>
            );
        }
        return (
            <Wrapper>
                <div className="space-y-12">
                    {tree.map((node) => (
                        <FlatTreeNode key={node.id} node={node} />
                    ))}
                </div>
            </Wrapper>
        );
    }

    // Object → API schema
    if (isApiTree(tree)) {
        return (
            <Wrapper>
                <ApiTreeNode node={tree} />
            </Wrapper>
        );
    }

    return (
        <p className="text-sm text-gray-500 text-center py-8">Unrecognised decision tree format.</p>
    );
}
