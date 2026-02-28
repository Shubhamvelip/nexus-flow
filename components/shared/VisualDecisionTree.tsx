'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, CheckCircle2, AlertCircle, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import type { PolicyDecisionTree, DecisionTreeNode, DecisionTreeEdge } from '@/lib/firebase';

// Re-export the old API type alias so other imports don't break
export type { PolicyDecisionTree as ApiDecisionTree };

// ── Layout computation ─────────────────────────────────────────────────────────

interface LayoutNode {
    node: DecisionTreeNode;
    x: number;   // centre-x in px
    y: number;   // top-y in px  
    level: number;
}

const NODE_W = 200;
const NODE_H = 64;
const H_GAP = 32;   // horizontal gap between siblings
const V_GAP = 80;   // vertical gap between levels

function computeLayout(nodes: DecisionTreeNode[], edges: DecisionTreeEdge[], startId: string): LayoutNode[] {
    if (nodes.length === 0) return [];

    // BFS from start_node to assign levels
    const levelOf = new Map<string, number>();
    const queue: string[] = [startId];
    levelOf.set(startId, 0);
    const adjacency = new Map<string, string[]>();
    for (const e of edges) {
        if (!adjacency.has(e.from)) adjacency.set(e.from, []);
        adjacency.get(e.from)!.push(e.to);
    }

    while (queue.length > 0) {
        const cur = queue.shift()!;
        const curLevel = levelOf.get(cur)!;
        for (const next of (adjacency.get(cur) ?? [])) {
            if (!levelOf.has(next)) {
                levelOf.set(next, curLevel + 1);
                queue.push(next);
            }
        }
    }

    // Assign unreachable nodes to end
    const maxLevel = Math.max(...levelOf.values(), 0);
    for (const n of nodes) {
        if (!levelOf.has(n.id)) levelOf.set(n.id, maxLevel + 1);
    }

    // Group by level
    const byLevel = new Map<number, DecisionTreeNode[]>();
    for (const n of nodes) {
        const l = levelOf.get(n.id) ?? 0;
        if (!byLevel.has(l)) byLevel.set(l, []);
        byLevel.get(l)!.push(n);
    }

    // Position each level
    const layout: LayoutNode[] = [];
    const levels = Array.from(byLevel.keys()).sort((a, b) => a - b);
    for (const lvl of levels) {
        const row = byLevel.get(lvl)!;
        const totalW = row.length * NODE_W + (row.length - 1) * H_GAP;
        const startX = -totalW / 2 + NODE_W / 2;
        row.forEach((n, i) => {
            layout.push({
                node: n,
                x: startX + i * (NODE_W + H_GAP),
                y: lvl * (NODE_H + V_GAP),
                level: lvl,
            });
        });
    }
    return layout;
}

// ── Node card ─────────────────────────────────────────────────────────────────

function NodeCard({ ln, index }: { ln: LayoutNode; index: number }) {
    const isDecision = ln.node.type === 'decision';
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.04, duration: 0.2 }}
            style={{
                position: 'absolute',
                left: ln.x - NODE_W / 2,
                top: ln.y,
                width: NODE_W,
                height: NODE_H,
            }}
            className={`flex items-center justify-center rounded-xl border px-3 py-2 text-center select-none
                ${isDecision
                    ? 'bg-violet-500/10 border-violet-500/40 shadow-[0_0_18px_rgba(139,92,246,0.15)]'
                    : 'bg-slate-800/80 border-slate-600/50'
                }`}
        >
            <div className="flex items-start gap-1.5">
                {isDecision
                    ? <HelpCircle className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 mt-0.5" />
                    : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                }
                <p className="text-xs font-medium text-white leading-snug line-clamp-3">{ln.node.label}</p>
            </div>
        </motion.div>
    );
}

// ── Edge (SVG connector) ──────────────────────────────────────────────────────

interface EdgeProps {
    fromLn: LayoutNode;
    toLn: LayoutNode;
    condition?: 'yes' | 'no';
    offsetX: number; // canvas offset to make coords absolute
    offsetY: number;
}

function EdgeLine({ fromLn, toLn, condition }: EdgeProps) {
    const x1 = fromLn.x;
    const y1 = fromLn.y + NODE_H;
    const x2 = toLn.x;
    const y2 = toLn.y;

    // Bezier handle height
    const cy1 = y1 + (y2 - y1) * 0.4;
    const cy2 = y2 - (y2 - y1) * 0.4;

    const isYes = condition === 'yes';
    const isNo = condition === 'no';
    const color = isYes ? '#4ade80' : isNo ? '#f87171' : '#64748b';
    const labelText = isYes ? 'YES' : isNo ? 'NO' : '';
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    return (
        <g>
            <path
                d={`M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeOpacity={0.7}
                markerEnd="url(#arrowhead)"
            />
            {labelText && (
                <>
                    <rect
                        x={midX - 14} y={midY - 9}
                        width={28} height={16}
                        rx={4} fill="#0f172a" fillOpacity={0.85}
                    />
                    <text
                        x={midX} y={midY + 3}
                        textAnchor="middle"
                        fontSize={9}
                        fontWeight="bold"
                        fill={color}
                        fontFamily="system-ui, sans-serif"
                    >
                        {labelText}
                    </text>
                </>
            )}
        </g>
    );
}

// ── Public component ──────────────────────────────────────────────────────────

interface Props {
    tree: PolicyDecisionTree | null | undefined;
}

export function VisualDecisionTree({ tree }: Props) {
    const [scale, setScale] = useState(1);

    if (!tree || !Array.isArray(tree.nodes) || tree.nodes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-800/60 border border-gray-700 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-gray-600" />
                </div>
                <p className="text-sm text-gray-500">No decision tree available.</p>
            </div>
        );
    }

    const layout = useMemo(
        () => computeLayout(tree.nodes, tree.edges ?? [], tree.start_node ?? tree.nodes[0]?.id),
        [tree]
    );

    if (layout.length === 0) return null;

    // Compute bounding box
    const minX = Math.min(...layout.map(l => l.x - NODE_W / 2)) - 24;
    const maxX = Math.max(...layout.map(l => l.x + NODE_W / 2)) + 24;
    const minY = -24;
    const maxY = Math.max(...layout.map(l => l.y + NODE_H)) + 40;
    const svgW = maxX - minX;
    const svgH = maxY - minY;
    const ox = -minX; // offset to shift coords into positive space
    const oy = -minY;

    // Build lookup
    const posMap = new Map<string, LayoutNode>(layout.map(l => [l.node.id, l]));

    return (
        <div className="relative w-full rounded-2xl border border-gray-800/60 bg-[#080e1a] group overflow-hidden">
            {/* Zoom controls */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-[#0f172a] border border-gray-700/60 rounded-xl p-1 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setScale(s => Math.max(s - 0.15, 0.35))} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors" title="Zoom Out">
                    <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-3.5 bg-gray-700" />
                <button onClick={() => setScale(1)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors" title="Reset">
                    <Maximize className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-3.5 bg-gray-700" />
                <button onClick={() => setScale(s => Math.min(s + 0.15, 1.8))} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors" title="Zoom In">
                    <ZoomIn className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Scrollable canvas */}
            <div className="w-full overflow-auto max-h-[640px] p-4 pr-14">
                <div
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        transition: 'transform 0.2s ease',
                        width: svgW,
                        height: svgH,
                        position: 'relative',
                        margin: '0 auto',
                    }}
                >
                    {/* SVG edges layer */}
                    <svg
                        width={svgW}
                        height={svgH}
                        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}
                    >
                        <defs>
                            <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                                <path d="M0,0 L0,6 L6,3 z" fill="#64748b" />
                            </marker>
                        </defs>
                        {(tree.edges ?? []).map((e, i) => {
                            const from = posMap.get(e.from);
                            const to = posMap.get(e.to);
                            if (!from || !to) return null;
                            // Shift by offset
                            const shifted: { fromLn: LayoutNode; toLn: LayoutNode } = {
                                fromLn: { ...from, x: from.x + ox, y: from.y + oy },
                                toLn: { ...to, x: to.x + ox, y: to.y + oy },
                            };
                            return (
                                <EdgeLine
                                    key={i}
                                    fromLn={shifted.fromLn}
                                    toLn={shifted.toLn}
                                    condition={e.condition}
                                    offsetX={ox}
                                    offsetY={oy}
                                />
                            );
                        })}
                    </svg>

                    {/* Node cards layer */}
                    {layout.map((ln, i) => (
                        <NodeCard
                            key={ln.node.id}
                            ln={{ ...ln, x: ln.x + ox, y: ln.y + oy }}
                            index={i}
                        />
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 px-5 py-2.5 border-t border-gray-800/60 text-[10px] text-gray-500">
                <span className="flex items-center gap-1.5"><HelpCircle className="w-3 h-3 text-violet-400" /> Decision</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Action</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-5 h-0.5 bg-green-400/70" /> YES</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-5 h-0.5 bg-red-400/70" /> NO</span>
            </div>
        </div>
    );
}

// Legacy export alias for any components that import ApiDecisionTree directly
export type { DecisionTreeNode, DecisionTreeEdge };
