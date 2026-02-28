'use client'

import { useCallback, useMemo } from 'react'
import ReactFlow, {
    Background,
    BackgroundVariant,
    Controls,
    Handle,
    Position,
    MarkerType,
    ReactFlowProvider,
    useNodesState,
    useEdgesState,
    type NodeTypes,
    type Node,
    type Edge,
} from 'reactflow'
import 'reactflow/dist/style.css'

// ─── ReactFlow dark-theme overrides ──────────────────────────────────────────
// Injected once at module level; overrides the white defaults from the dist CSS.
const DARK_OVERRIDES = `
.react-flow__renderer { background: transparent !important; }
.react-flow__pane    { cursor: grab !important; }
.react-flow__pane.dragging { cursor: grabbing !important; }
.react-flow__node    { background: transparent !important; border: none !important;
                       box-shadow: none !important; padding: 0 !important; }
.react-flow__edge-path { pointer-events: none; }
.react-flow__controls {
  background: #0f172a !important;
  border: 1px solid #1e293b !important;
  border-radius: 10px !important;
  box-shadow: 0 4px 24px rgba(0,0,0,0.5) !important;
  overflow: hidden !important;
  gap: 0 !important;
}
.react-flow__controls-button {
  background: #0f172a !important;
  border: none !important;
  border-bottom: 1px solid #1e293b !important;
  color: #94a3b8 !important;
  width: 32px !important;
  height: 32px !important;
  fill: #94a3b8 !important;
  transition: background 0.15s, color 0.15s !important;
}
.react-flow__controls-button:last-child { border-bottom: none !important; }
.react-flow__controls-button:hover {
  background: #1e293b !important;
  color: #e2e8f0 !important;
  fill: #e2e8f0 !important;
}
.react-flow__controls-button svg { width: 14px; height: 14px; }
.react-flow__attribution { display: none !important; }
.react-flow__handle {
  border: none !important;
  width: 8px !important;
  height: 8px !important;
}
`

// ─── Data types from backend ──────────────────────────────────────────────────

interface RawNode {
    id: string
    label: string
    type: 'start' | 'process' | 'decision' | 'end'
}

interface RawEdge {
    source: string
    target: string
    label?: 'YES' | 'NO'
}

export interface PolicyGraph {
    nodes: RawNode[]
    edges: RawEdge[]
}

// ─── Auto layout: BFS top-down ────────────────────────────────────────────────

const W = 180     // node width
const H = 60      // node height (for non-decision)
const DW = 120    // decision diamond width
const XG = 240    // horizontal gap between nodes in same row
const YG = 130    // vertical gap between rows

function computeLayout(rawNodes: RawNode[], rawEdges: RawEdge[]): Map<string, { x: number; y: number }> {
    const positions = new Map<string, { x: number; y: number }>()
    const adj = new Map<string, string[]>()
    rawNodes.forEach(n => adj.set(n.id, []))
    rawEdges.forEach(e => adj.get(e.source)?.push(e.target))

    const startNode = rawNodes.find(n => n.type === 'start') ?? rawNodes[0]
    if (!startNode) return positions

    // BFS level assignment
    const levels = new Map<string, number>([[startNode.id, 0]])
    const queue = [startNode.id]
    while (queue.length > 0) {
        const curr = queue.shift()!
        const lvl = levels.get(curr) ?? 0
        for (const next of (adj.get(curr) ?? [])) {
            if (!levels.has(next)) {
                levels.set(next, lvl + 1)
                queue.push(next)
            }
        }
    }
    const maxLvl = Math.max(...Array.from(levels.values()), 0)
    rawNodes.forEach(n => { if (!levels.has(n.id)) levels.set(n.id, maxLvl + 1) })

    // Group by level & assign centered x, stacked y
    const byLevel = new Map<number, string[]>()
    levels.forEach((lvl, id) => {
        if (!byLevel.has(lvl)) byLevel.set(lvl, [])
        byLevel.get(lvl)!.push(id)
    })

    byLevel.forEach((ids, lvl) => {
        const totalWidth = (ids.length - 1) * XG
        ids.forEach((id, i) => {
            positions.set(id, {
                x: -totalWidth / 2 + i * XG - W / 2,
                y: lvl * (H + YG),
            })
        })
    })
    return positions
}

// ─── Custom node components ───────────────────────────────────────────────────

function StartNode({ data }: { data: { label: string } }) {
    return (
        <div style={{ width: W, height: H }}
            className="flex items-center justify-center rounded-full border-2 bg-green-500/15 border-green-400/70 text-green-300 text-xs font-bold uppercase tracking-widest select-none shadow-[0_0_16px_rgba(34,197,94,0.25)]">
            <Handle type="source" position={Position.Bottom} style={{ background: '#4ade80', width: 8, height: 8, border: 'none', bottom: -4 }} />
            {data.label}
        </div>
    )
}

function EndNode({ data }: { data: { label: string } }) {
    return (
        <div style={{ width: W, height: H }}
            className="flex items-center justify-center rounded-full border-2 bg-red-500/15 border-red-400/70 text-red-300 text-xs font-bold uppercase tracking-widest select-none shadow-[0_0_16px_rgba(239,68,68,0.25)]">
            <Handle type="target" position={Position.Top} style={{ background: '#f87171', width: 8, height: 8, border: 'none', top: -4 }} />
            {data.label}
        </div>
    )
}

function ProcessNode({ data }: { data: { label: string } }) {
    return (
        <div style={{ width: W, minHeight: H }}
            className="flex items-center justify-center px-3 py-2.5 rounded-xl border border-blue-500/30 bg-[#0c1e3a] text-blue-100 text-xs font-medium text-center select-none shadow-[0_2px_12px_rgba(59,130,246,0.15)]">
            <Handle type="target" position={Position.Top} style={{ background: '#60a5fa', width: 8, height: 8, border: 'none', top: -4 }} />
            {data.label}
            <Handle type="source" position={Position.Bottom} style={{ background: '#60a5fa', width: 8, height: 8, border: 'none', bottom: -4 }} />
        </div>
    )
}

function DecisionNode({ data }: { data: { label: string } }) {
    return (
        <div style={{ width: DW, height: DW }} className="relative flex items-center justify-center select-none">
            {/* rotated square to form diamond */}
            <div style={{ width: DW * 0.8, height: DW * 0.8, transform: 'rotate(45deg)' }}
                className="absolute rounded-sm bg-violet-500/15 border-2 border-violet-400/70 shadow-[0_0_16px_rgba(139,92,246,0.25)]" />
            <span className="relative z-10 text-violet-200 text-[10px] font-semibold text-center leading-snug px-3">
                {data.label}
            </span>
            <Handle type="target" position={Position.Top} style={{ background: '#a78bfa', width: 8, height: 8, border: 'none', top: 0 }} />
            <Handle id="yes" type="source" position={Position.Right} style={{ background: '#4ade80', width: 8, height: 8, border: 'none', right: 0 }} />
            <Handle id="no" type="source" position={Position.Left} style={{ background: '#f87171', width: 8, height: 8, border: 'none', left: 0 }} />
            <Handle id="default" type="source" position={Position.Bottom} style={{ background: '#a78bfa', width: 8, height: 8, border: 'none', bottom: 0 }} />
        </div>
    )
}

const nodeTypes: NodeTypes = { start: StartNode, end: EndNode, process: ProcessNode, decision: DecisionNode }

// ─── Graph props ──────────────────────────────────────────────────────────────

interface WorkflowGraphProps {
    graph: PolicyGraph | null | undefined
}

// ─── Main exported component ──────────────────────────────────────────────────

export function WorkflowGraph({ graph }: WorkflowGraphProps) {
    if (!graph) return <Placeholder message="No workflow graph available" />
    if (!Array.isArray(graph.nodes) || graph.nodes.length === 0) return <Placeholder message="Invalid workflow data" />
    return (
        <ReactFlowProvider>
            <style>{DARK_OVERRIDES}</style>
            <GraphCanvas graph={graph} />
        </ReactFlowProvider>
    )
}

// ─── Canvas ───────────────────────────────────────────────────────────────────

function GraphCanvas({ graph }: { graph: PolicyGraph }) {
    const positions = useMemo(() => computeLayout(graph.nodes, graph.edges), [graph])

    const initialNodes: Node[] = useMemo(() =>
        graph.nodes.map(n => ({
            id: n.id,
            type: n.type,
            position: positions.get(n.id) ?? { x: 0, y: 0 },
            data: { label: n.label },
            draggable: true,
        })),
        [graph.nodes, positions],
    )

    const initialEdges: Edge[] = useMemo(() =>
        graph.edges.map((e, i) => {
            const isYes = e.label === 'YES'
            const isNo = e.label === 'NO'
            return {
                id: `e${i}-${e.source}-${e.target}`,
                source: e.source,
                target: e.target,
                sourceHandle: isYes ? 'yes' : isNo ? 'no' : undefined,
                type: 'smoothstep',
                animated: false,
                label: e.label ?? undefined,
                labelStyle: {
                    fill: isYes ? '#4ade80' : isNo ? '#f87171' : '#94a3b8',
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: 'inherit',
                },
                labelBgStyle: { fill: '#0f172a', fillOpacity: 0.95 },
                labelBgPadding: [5, 7] as [number, number],
                labelBgBorderRadius: 4,
                style: { stroke: '#334155', strokeWidth: 1.5 },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: '#475569',
                    width: 14,
                    height: 14,
                },
            }
        }),
        [graph.edges],
    )

    const [nodes, , onNodesChange] = useNodesState(initialNodes)
    const [edges, , onEdgesChange] = useEdgesState(initialEdges)

    const onInit = useCallback((rf: { fitView: () => void }) => {
        setTimeout(() => rf.fitView(), 80)
    }, [])

    return (
        <div className="w-full rounded-xl overflow-hidden border border-gray-800" style={{ height: 520, background: '#020617' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onInit={onInit}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                minZoom={0.2}
                maxZoom={2.5}
                snapToGrid={false}
                nodesDraggable
                panOnDrag
                zoomOnScroll
                zoomOnPinch
                panOnScroll={false}
                proOptions={{ hideAttribution: true }}
                style={{ background: '#020617' }}
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    color="#1e293b"
                    gap={20}
                    size={1.5}
                />
                <Controls
                    showInteractive={false}
                    showZoom
                    showFitView
                    position="bottom-right"
                />
            </ReactFlow>
        </div>
    )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function Placeholder({ message }: { message: string }) {
    return (
        <div style={{ height: 520, background: '#020617' }}
            className="w-full rounded-xl border border-gray-800 flex items-center justify-center">
            <p className="text-sm text-gray-500">{message}</p>
        </div>
    )
}
