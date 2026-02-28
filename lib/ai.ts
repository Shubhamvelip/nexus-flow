import { GoogleGenerativeAI } from '@google/generative-ai';
import { PolicyWorkflowStep, PolicyDecisionTree } from './firebase';

// ── Gemini client ─────────────────────────────────────────────────────────────

function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    return new GoogleGenerativeAI(apiKey);
}

// ── Output structure ──────────────────────────────────────────────────────────

// ── Graph types ───────────────────────────────────────────────────────────────

export interface GraphNode {
    id: string;
    label: string;
    type: 'start' | 'process' | 'decision' | 'end';
}

export interface GraphEdge {
    source: string;
    target: string;
    label?: 'YES' | 'NO';
}

export interface PolicyGraph {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

// ── Flat decision tree types (matches firebase.ts) ────────────────────────────
import type { DecisionTreeNode, DecisionTreeEdge, PolicyRule } from './firebase';

export interface GeneratedPolicy {
    workflow: PolicyWorkflowStep[];
    decision_tree: PolicyDecisionTree;
    checklist: string[];
    graph: PolicyGraph;
    rules: PolicyRule[];
}

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert policy analyst AI. You receive raw government policy text and convert it into precise, deeply structured operational outputs for field officers.

STEP 1 — EXTRACT (do this silently before generating JSON):
• ENTITIES: every actor, department, role, document, or organization mentioned
• CONDITIONS: every IF/ELSE rule, eligibility check, threshold, deadline, or exception
• ACTIONS: every concrete procedure, task, validation step, or compliance requirement

STEP 2 — GENERATE the following JSON exactly. Return ONLY valid JSON. No markdown, no explanation, no preamble.

{
  "workflow": [
    { "step": "string", "description": "string" }
  ],
  "decision_tree": {
    "start_node": "n1",
    "nodes": [
      { "id": "n1", "type": "decision", "label": "Are all required documents submitted?" },
      { "id": "n2", "type": "decision", "label": "Do documents meet compliance standards?" },
      { "id": "n3", "type": "decision", "label": "Is safety clearance required?" },
      { "id": "n4", "type": "decision", "label": "Can compliance issues be corrected?" },
      { "id": "n5", "type": "decision", "label": "Can applicant provide missing documents?" },
      { "id": "n6", "type": "action",   "label": "Forward to Safety Department" },
      { "id": "n7", "type": "action",   "label": "Approve application" },
      { "id": "n8", "type": "action",   "label": "Issue 30-day correction notice" },
      { "id": "n9", "type": "action",   "label": "Reject – compliance failure" },
      { "id": "n10", "type": "action",  "label": "Resume review with complete file" },
      { "id": "n11", "type": "action",  "label": "Mark application abandoned" }
    ],
    "edges": [
      { "from": "n1",  "to": "n2",  "condition": "yes" },
      { "from": "n1",  "to": "n5",  "condition": "no" },
      { "from": "n2",  "to": "n3",  "condition": "yes" },
      { "from": "n2",  "to": "n4",  "condition": "no" },
      { "from": "n3",  "to": "n6",  "condition": "yes" },
      { "from": "n3",  "to": "n7",  "condition": "no" },
      { "from": "n4",  "to": "n8",  "condition": "yes" },
      { "from": "n4",  "to": "n9",  "condition": "no" },
      { "from": "n5",  "to": "n10", "condition": "yes" },
      { "from": "n5",  "to": "n11", "condition": "no" }
    ]
  },
  "checklist": [
    { "task": "string", "completed": false }
  ],
  "graph": {
    "nodes": [
      { "id": "start", "label": "Start", "type": "start" },
      { "id": "step1", "label": "Receive Application", "type": "process" },
      { "id": "dec1", "label": "Documents complete?", "type": "decision" },
      { "id": "end", "label": "End", "type": "end" }
    ],
    "edges": [
      { "source": "start", "target": "step1" },
      { "source": "step1", "target": "dec1" },
      { "source": "dec1", "target": "end", "label": "YES" },
      { "source": "dec1", "target": "step1", "label": "NO" }
    ]
  },
  "rules": [
    { "id": "rule_1", "field": "age",         "operator": ">=", "value": 18,   "description": "Applicant must be at least 18 years old" },
    { "id": "rule_2", "field": "income",      "operator": ">=", "value": 0,    "description": "Income must be non-negative" },
    { "id": "rule_3", "field": "citizen",     "operator": "==", "value": true, "description": "Applicant must be a citizen" }
  ]
}

The above JSON is ONLY a structural template. Replace ALL placeholder strings with content derived exclusively from the input policy.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Minimum 6–10 sequential steps; more for complex policies
• Every step must name the responsible department or actor
• "step" = short action verb phrase (e.g. "Verify identity documents")
• "description" = who does what, referencing policy-specific rules, deadlines, and entities
• NEVER generate generic steps ("Submit form", "Complete process", "Proceed")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DECISION TREE RULES (CRITICAL — read carefully):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• MINIMUM 3–5 levels of depth; scale with policy complexity
• EVERY question node MUST have both "yes" AND "no" branches
• Most branches must lead to ANOTHER question (not an immediate action)
• Only the deepest nodes produce a final { "action": "..." }
• Actions must be specific outcomes (not "proceed", "continue", "done")
• Model real-world validation chains: receive → verify → check → validate → decide → approve/reject/escalate
• Include negative paths: rejection reasons, correction notices, escalation routes, hold states
• Schema rule: every node is EITHER { question, yes, no } OR { action } — never both, never neither
• DO NOT copy the template example — generate from the policy content

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHECKLIST RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Minimum 8–12 items; each maps to a workflow step
• Each item = a concrete, verifiable action (a field officer can physically tick it off)
• Use document names, entities, thresholds from the policy
• NEVER generic items ("Check documents", "Verify info")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GRAPH RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Keep graph SIMPLE and clear — maximum 10–15 nodes
• Exactly ONE start node (type: "start") and ONE end node (type: "end")
• Process nodes (type: "process") = sequential workflow steps
• Decision nodes (type: "decision") = key branching points only
• All node IDs must be unique strings; no spaces
• Edge from a decision node MUST have label "YES" or "NO"
• Sequential edges (no decision) must NOT have a label
• Graph must be fully connected — no orphan nodes
• Do NOT add position — the frontend handles layout
• No extra fields on any node or edge

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULES RULES (NEW FIELD):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Extract EVERY specific threshold, eligibility condition, numeric limit, or boolean requirement stated in the policy
• Each rule must be atomic (one condition per rule)
• field = the data field to check (e.g. "age", "income", "citizen", "documents_submitted")
• operator = one of: >, <, >=, <=, ==, !=
• value = the threshold or required value (number, boolean, or string)
• description = plain-English explanation of the condition
• If no specific conditions can be extracted → return empty array []
• NEVER invent rules not supported by the policy text

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GLOBAL RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Output ONLY valid JSON — absolutely no text outside the JSON object
• All five sections must be fully populated — never skip any
• Different policy inputs must always produce different outputs
• NEVER copy, paraphrase, or recycle the template example above`;


// ── JSON extraction ───────────────────────────────────────────────────────────


function extractJson(raw: string): string {
    // Strip markdown code fences
    const fenced = raw.match(/```(?: json) ?\s * ([\s\S] *?)```/);
    if (fenced) return fenced[1].trim();
    // Extract first complete {...} block
    const braceStart = raw.indexOf('{');
    const braceEnd = raw.lastIndexOf('}');
    if (braceStart !== -1 && braceEnd !== -1) {
        return raw.slice(braceStart, braceEnd + 1);
    }
    return raw.trim();
}


/**
 * Validates the full GeneratedPolicy shape.
 */
function validateShape(obj: unknown): obj is { workflow: unknown[]; decision_tree: unknown; checklist: unknown[] } {
    if (!obj || typeof obj !== 'object') return false;
    const o = obj as Record<string, unknown>;
    return (
        Array.isArray(o.workflow) &&
        typeof o.decision_tree === 'object' &&
        o.decision_tree !== null &&
        Array.isArray(o.checklist)
    );
}

// ── Graph sanitizer ────────────────────────────────────────────────────────────

function sanitizeGraph(raw: unknown, _policyTitle: string): PolicyGraph {
    const fallback: PolicyGraph = {
        nodes: [
            { id: 'start', label: 'Start', type: 'start' },
            { id: 'end', label: 'End', type: 'end' },
        ],
        edges: [{ source: 'start', target: 'end' }],
    };

    if (!raw || typeof raw !== 'object') return fallback;
    const g = raw as Record<string, unknown>;
    if (!Array.isArray(g.nodes) || !Array.isArray(g.edges)) return fallback;

    // 1. Deduplicate node IDs & normalise shapes
    const seenIds = new Set<string>();
    const validTypes = ['start', 'process', 'decision', 'end'];
    const nodes: GraphNode[] = (g.nodes as unknown[])
        .filter((n): n is Record<string, unknown> => !!n && typeof n === 'object')
        .map((n, i) => {
            const id = String(n.id ?? `node_${i} `).trim() || `node_${i} `;
            const label = String(n.label ?? 'Step').trim().split(' ').slice(0, 6).join(' ') || 'Step';
            const rawType = String(n.type ?? 'process');
            const type = validTypes.includes(rawType)
                ? rawType as GraphNode['type']
                : rawType === 'step' ? 'process' : 'process';
            return { id, label, type };
        })
        .filter(n => {
            if (seenIds.has(n.id)) return false;
            seenIds.add(n.id);
            return true;
        });

    if (nodes.length === 0) return fallback;

    // 2. Enforce at least 1 start and 1 end
    const starts = nodes.filter(n => n.type === 'start');
    const ends = nodes.filter(n => n.type === 'end');
    if (starts.length === 0) nodes[0].type = 'start';
    else if (starts.length > 1) starts.slice(1).forEach(n => { n.type = 'process'; });
    if (ends.length === 0) nodes[nodes.length - 1].type = 'end';
    else if (ends.length > 1) ends.slice(0, -1).forEach(n => { n.type = 'process'; });

    // 3. Sanitise edges — accept both source/target and from/to for compatibility
    const rawEdges: GraphEdge[] = (g.edges as unknown[])
        .filter((e): e is Record<string, unknown> => !!e && typeof e === 'object')
        .map(e => {
            const source = String(e.source ?? e.from ?? '').trim();
            const target = String(e.target ?? e.to ?? '').trim();
            const rawLabel = String(e.label ?? e.condition ?? '').trim().toUpperCase();
            const label: 'YES' | 'NO' | undefined =
                rawLabel === 'YES' ? 'YES' : rawLabel === 'NO' ? 'NO' : undefined;
            return { source, target, ...(label ? { label } : {}) };
        })
        .filter(e => seenIds.has(e.source) && seenIds.has(e.target) && e.source !== e.target);

    // 4. Remove orphan nodes
    let edges = rawEdges;
    const forcedStart = nodes.find(n => n.type === 'start')!;
    const forcedEnd = nodes.find(n => n.type === 'end')!;
    const referenced = new Set<string>(edges.flatMap(e => [e.source, e.target]));
    referenced.add(forcedStart.id);
    referenced.add(forcedEnd.id);
    const connectedNodes = nodes.filter(n => referenced.has(n.id));
    if (connectedNodes.length < nodes.length) {
        const cIds = new Set(connectedNodes.map(n => n.id));
        edges = edges.filter(e => cIds.has(e.source) && cIds.has(e.target));
    }

    // 5. Ensure at least 1 edge — stitch chain if needed
    if (edges.length === 0) {
        const chain = connectedNodes.length > 0 ? connectedNodes : nodes;
        edges = chain.slice(0, -1).map((n, i) => ({ source: n.id, target: chain[i + 1].id }));
        if (edges.length === 0) return fallback;
    }

    return { nodes: connectedNodes.length > 0 ? connectedNodes : nodes, edges };
}


/**
 * Returns a minimal valid flat decision tree used when Gemini output is unusable.
 */
function fallbackFlatDecisionTree(policyTitle: string): PolicyDecisionTree {
    return {
        start_node: 'n1',
        nodes: [
            { id: 'n1', type: 'decision', label: `Do documents exist for "${policyTitle}"?` },
            { id: 'n2', type: 'decision', label: 'Have compliance checks been completed?' },
            { id: 'n3', type: 'action', label: 'Approve and proceed to next stage' },
            { id: 'n4', type: 'action', label: 'Complete remaining compliance checks' },
            { id: 'n5', type: 'action', label: 'Collect missing documents first' },
        ],
        edges: [
            { from: 'n1', to: 'n2', condition: 'yes' },
            { from: 'n1', to: 'n5', condition: 'no' },
            { from: 'n2', to: 'n3', condition: 'yes' },
            { from: 'n2', to: 'n4', condition: 'no' },
        ],
    };
}

// ── Main export ───────────────────────────────────────────────────────────────

export interface PolicyInput {
    title: string;
    description?: string;
    notes?: string;
    policyText?: string;
    pdfBase64?: string;
}

/**
 * Send structured policy input to Gemini and return a validated
 * workflow / decision_tree / checklist object.
 */
export async function generatePolicy(input: PolicyInput): Promise<GeneratedPolicy> {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `${SYSTEM_PROMPT}

Policy Input:
TITLE: ${input.title}
DESCRIPTION: ${input.description || '(not provided)'}
NOTES: ${input.notes || '(none)'}
FULL TEXT: ${input.policyText || '(see attached PDF)'} `;

    let raw: string;
    try {
        let result;
        if (input.pdfBase64) {
            result = await model.generateContent([
                {
                    inlineData: {
                        mimeType: "application/pdf",
                        data: input.pdfBase64,
                    },
                },
                { text: prompt },
            ]);
        } else {
            result = await model.generateContent(prompt);
        }
        raw = result.response.text();
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Gemini API error: ${message} `);
    }

    // ── Log raw AI response ──────────────────────────────────────────────────
    console.log('[Gemini] Raw response:', raw);

    // ── Parse JSON with one retry ────────────────────────────────────────────
    async function attemptParse(responseText: string): Promise<unknown> {
        try {
            return JSON.parse(extractJson(responseText));
        } catch {
            return null;
        }
    }

    let parsed = await attemptParse(raw);

    if (parsed === null) {
        // Retry once with an explicit nudge
        console.warn('[Gemini] First parse failed — retrying with a stricter prompt');
        const retryPrompt = `${prompt} \n\nIMPORTANT: Your previous response could not be parsed as JSON.Return ONLY raw JSON — no markdown, no text, no code fences.`;
        try {
            const retryResult = await model.generateContent(retryPrompt);
            const retryRaw = retryResult.response.text();
            console.log('[Gemini] Retry raw response:', retryRaw);
            parsed = await attemptParse(retryRaw);
        } catch (retryErr) {
            console.error('[Gemini] Retry API call failed:', retryErr);
        }
    }

    // ── Graceful fallback if parse still failed ──────────────────────────────
    if (parsed === null || typeof parsed !== 'object') {
        console.error('[Gemini] Could not parse JSON after retry. Using empty fallback.');
        parsed = { workflow: [], decision_tree: null, checklist: [] };
    }

    // Cast to loose record for field access
    const parsedObj = parsed as Record<string, unknown>;

    // ── Sanitize workflow ────────────────────────────────────────────────────
    const rawWorkflow = Array.isArray(parsedObj.workflow) ? parsedObj.workflow as unknown[] : [];
    const workflow: PolicyWorkflowStep[] = rawWorkflow
        .filter((s): s is Record<string, unknown> => !!s && typeof s === 'object')
        .map((s) => ({
            step: String(s.step ?? s.title ?? 'Step').replace(/^\d+$/, (n) => `Step ${n} `).trim(),
            description: String(s.description ?? '').trim(),
        }))
        .filter((s) => s.step.length > 0);

    if (workflow.length === 0) {
        workflow.push(
            { step: 'Review Policy', description: 'Read and understand the policy document thoroughly.' },
            { step: 'Implement Steps', description: 'Execute each required action as outlined in the policy.' }
        );
    }

    // ── Sanitize decision tree (flat graph format) ───────────────────────────
    const rawTree = parsedObj.decision_tree ?? parsedObj.decisionTree;
    let decision_tree: PolicyDecisionTree;
    try {
        const rt = rawTree as Record<string, unknown>;
        const rawNodes = Array.isArray(rt?.nodes) ? rt.nodes as Record<string, unknown>[] : [];
        const rawEdges = Array.isArray(rt?.edges) ? rt.edges as Record<string, unknown>[] : [];
        const startNode = typeof rt?.start_node === 'string' ? rt.start_node : (rawNodes[0]?.id as string ?? 'n1');

        const nodes: DecisionTreeNode[] = rawNodes
            .filter(n => typeof n.id === 'string' && typeof n.label === 'string')
            .map(n => ({
                id: String(n.id),
                type: n.type === 'action' ? 'action' : 'decision',
                label: String(n.label),
            }));

        const edges: DecisionTreeEdge[] = rawEdges
            .filter(e => typeof e.from === 'string' && typeof e.to === 'string')
            .map(e => ({
                from: String(e.from),
                to: String(e.to),
                condition: e.condition === 'yes' ? 'yes' : e.condition === 'no' ? 'no' : undefined,
            }));

        if (nodes.length >= 2 && edges.length >= 1) {
            decision_tree = { nodes, edges, start_node: startNode };
        } else {
            decision_tree = fallbackFlatDecisionTree(workflow[0]?.step ?? 'this policy');
        }
    } catch {
        decision_tree = fallbackFlatDecisionTree(workflow[0]?.step ?? 'this policy');
    }

    // ── Sanitize checklist ───────────────────────────────────────────────────
    // Accepts: string[], [{task, description}], [{task, completed}], mixed
    const rawChecklist = Array.isArray(parsedObj.checklist) ? parsedObj.checklist as unknown[] : [];
    const checklist: string[] = rawChecklist
        .map((item) => {
            if (typeof item === 'string') return item.trim();
            if (item && typeof item === 'object') {
                const o = item as Record<string, unknown>;
                return String(o.task ?? o.description ?? o.title ?? '').trim();
            }
            return String(item).trim();
        })
        .filter((item) => item.length > 0);

    if (checklist.length === 0) {
        checklist.push('Review policy document', 'Verify all required documents', 'Confirm compliance');
    }

    // ── Sanitize graph ────────────────────────────────────────────────────────────
    const graph = sanitizeGraph(parsedObj.graph, input.title);

    // ── Sanitize rules ───────────────────────────────────────────────────────────
    const validOperators = ['>', '<', '>=', '<=', '==', '!='];
    const rawRules = Array.isArray(parsedObj.rules) ? parsedObj.rules as unknown[] : [];
    const rules: PolicyRule[] = rawRules
        .filter((r): r is Record<string, unknown> => !!r && typeof r === 'object')
        .filter(r => typeof r.id === 'string' && typeof r.field === 'string' && validOperators.includes(String(r.operator)))
        .map((r, i) => ({
            id: String(r.id ?? `rule_${i + 1}`),
            field: String(r.field),
            operator: String(r.operator) as PolicyRule['operator'],
            value: typeof r.value === 'number' ? r.value : typeof r.value === 'boolean' ? r.value : String(r.value ?? ''),
            description: String(r.description ?? r.field),
        }));

    return { workflow, decision_tree, checklist, graph, rules };
}
