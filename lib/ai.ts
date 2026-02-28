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

export interface GeneratedPolicy {
    workflow: PolicyWorkflowStep[];
    decision_tree: PolicyDecisionTree;
    checklist: string[];
}

// ── Decision tree node types ──────────────────────────────────────────────────

/** A leaf node — always has "action", never "question". */
interface LeafNode {
    action: string;
}

/** An internal node — always has "question", "yes", and "no". */
interface InternalNode {
    question: string;
    yes: DecisionNode;
    no: DecisionNode;
}

type DecisionNode = InternalNode | LeafNode;

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an AI system that converts government policy text into structured, executable outputs for field officers.

Analyze the following policy carefully and generate outputs based ONLY on its content.

Do NOT generate generic workflows. The output MUST reflect the specific rules, entities, and conditions mentioned in the policy.

Before generating output, extract the following from the policy text:
- ENTITIES: Departments, actors, roles, or organizations mentioned
- CONDITIONS: If/else rules, eligibility checks, thresholds, or decision points
- ACTIONS: Concrete steps, procedures, or tasks described

Use those extracted elements to populate the JSON below. Every workflow step, decision branch, and checklist item must trace back to something in the policy text.

Return ONLY valid JSON in this exact format — no extra text, no explanation, no markdown, no code blocks:

{
  "workflow": [
    { "step": "string", "description": "string" }
  ],
  "decision_tree": {
    "question": "string",
    "yes": { "action": "string" },
    "no": { "action": "string" }
  },
  "checklist": [
    { "task": "string", "completed": false }
  ]
}

Strict rules:
- Different policy inputs MUST produce different outputs
- Every step must directly reference a rule, entity, or action from the input
- Decision tree questions must come from real conditions in the policy text
- Checklist tasks must be actionable for the entity performing them
- If the policy mentions waste collection → output must be about waste collection
- If the policy mentions construction permits → output must be about permits
- ONLY JSON`;


// ── JSON extraction ───────────────────────────────────────────────────────────

function extractJson(raw: string): string {
    // Strip markdown code fences
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced) return fenced[1].trim();
    // Extract first complete {...} block
    const braceStart = raw.indexOf('{');
    const braceEnd = raw.lastIndexOf('}');
    if (braceStart !== -1 && braceEnd !== -1) {
        return raw.slice(braceStart, braceEnd + 1);
    }
    return raw.trim();
}

// ── Decision tree sanitizer ───────────────────────────────────────────────────

/**
 * Recursively validates and repairs a decision tree node.
 *
 * - If depth ≥ maxDepth → force into a leaf (action)
 * - If node has "question" → ensure it's an internal node with valid yes/no
 * - If node has "action" → ensure it's a leaf with a non-empty string
 * - Otherwise → generate a sensible fallback
 */
function sanitizeDecisionNode(
    node: unknown,
    depth: number = 1,
    maxDepth: number = 3
): DecisionNode {

    // At max depth → always a leaf
    if (depth >= maxDepth) {
        if (node && typeof node === 'object') {
            const n = node as Record<string, unknown>;
            if (typeof n.action === 'string' && n.action.trim()) {
                return { action: n.action.trim() };
            }
            if (typeof n.question === 'string' && n.question.trim()) {
                // Collapse to leaf: summarise the question as an action
                return { action: `Proceed with: ${n.question.trim()}` };
            }
        }
        return { action: 'Complete the required steps and proceed.' };
    }

    if (!node || typeof node !== 'object') {
        return { action: 'Complete the required steps and proceed.' };
    }

    const n = node as Record<string, unknown>;

    // ── Internal node ────────────────────────────────────────────────────────
    if (typeof n.question === 'string' && n.question.trim()) {
        const question = n.question.trim();

        const yes = sanitizeDecisionNode(n.yes, depth + 1, maxDepth);
        const no = sanitizeDecisionNode(n.no, depth + 1, maxDepth);

        return { question, yes, no };
    }

    // ── Leaf node ────────────────────────────────────────────────────────────
    if (typeof n.action === 'string' && n.action.trim()) {
        return { action: n.action.trim() };
    }

    // ── Unknown shape — try to recover ───────────────────────────────────────
    // Maybe it's a nested object with one key as the question text
    const keys = Object.keys(n);
    if (keys.length > 0) {
        const firstKey = keys[0];
        const firstVal = n[firstKey];
        if (typeof firstKey === 'string' && firstKey.length > 5) {
            // Use the key as a question if it looks sentence-like
            const innerYes = sanitizeDecisionNode(
                typeof firstVal === 'object' ? firstVal : null,
                depth + 1,
                maxDepth
            );
            return {
                question: firstKey,
                yes: innerYes,
                no: { action: 'Follow the standard process.' },
            };
        }
    }

    return { action: 'Complete the required steps and proceed.' };
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

/**
 * Returns a descriptive fallback decision tree when Gemini produces nothing useful.
 */
function fallbackDecisionTree(policyTitle: string): DecisionNode {
    return {
        question: `Does the officer have all required documents for "${policyTitle}"?`,
        yes: {
            question: 'Have all compliance checks been completed?',
            yes: { action: 'Approve and proceed to the next stage.' },
            no: { action: 'Complete the remaining compliance checks before proceeding.' },
        },
        no: {
            action: 'Collect missing documents before proceeding.',
        },
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
FULL TEXT: ${input.policyText || '(see attached PDF)'}`;

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
        throw new Error(`Gemini API error: ${message}`);
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
        const retryPrompt = `${prompt}\n\nIMPORTANT: Your previous response could not be parsed as JSON. Return ONLY raw JSON — no markdown, no text, no code fences.`;
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
            step: String(s.step ?? s.title ?? 'Step').replace(/^\d+$/, (n) => `Step ${n}`).trim(),
            description: String(s.description ?? '').trim(),
        }))
        .filter((s) => s.step.length > 0);

    if (workflow.length === 0) {
        workflow.push(
            { step: 'Review Policy', description: 'Read and understand the policy document thoroughly.' },
            { step: 'Implement Steps', description: 'Execute each required action as outlined in the policy.' }
        );
    }

    // ── Sanitize decision tree ───────────────────────────────────────────────
    // Accept decision_tree (object) or decisionTree (array).
    const rawTree = parsedObj.decision_tree ?? parsedObj.decisionTree;

    let decision_tree: DecisionNode;
    try {
        let treeInput: unknown = rawTree;
        if (Array.isArray(rawTree) && rawTree.length > 0) {
            const first = rawTree[0] as Record<string, unknown>;
            treeInput = {
                question: first.question ?? 'Does this policy apply?',
                yes: typeof first.yes === 'string' ? { action: first.yes } : first.yes ?? { action: 'Proceed.' },
                no: typeof first.no === 'string' ? { action: first.no } : first.no ?? { action: 'Do not proceed.' },
            };
        }
        const sanitized = sanitizeDecisionNode(treeInput, 1, 3);
        decision_tree = 'action' in sanitized
            ? fallbackDecisionTree(workflow[0]?.step ?? 'this policy')
            : sanitized;
    } catch {
        decision_tree = fallbackDecisionTree(workflow[0]?.step ?? 'this policy');
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

    return { workflow, decision_tree: decision_tree as PolicyDecisionTree, checklist };
}
