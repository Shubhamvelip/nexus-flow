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

const SYSTEM_PROMPT = `You are an AI that converts government policy documents into structured execution outputs for field officers.

Analyze the given policy text and generate STRICT JSON with exactly three top-level keys:
- "workflow": array of step objects
- "decision_tree": a nested decision tree object (see rules below)
- "checklist": array of strings

━━━━━━━━━━━━━━━━━━━━━━━━━━━
DECISION TREE RULES (CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Every node in decision_tree is EITHER:

A) An INTERNAL node (has a question to ask):
{
  "question": "Is the application complete?",
  "yes": <node>,
  "no": <node>
}

B) A LEAF node (has a final action, no branches):
{
  "action": "Approve the application and notify the officer."
}

Rules:
- Maximum depth: 3 levels (root = level 1, children = level 2, grandchildren = level 3)
- Level 3 nodes MUST always be leaf nodes (action only, no further branching)
- NEVER use "action" and "question" together in the same node
- NEVER use null, undefined, or empty strings
- Every internal node MUST have both "yes" and "no" keys

━━━━━
EXAMPLE OUTPUT (follow this structure exactly):
━━━━━
{
  "workflow": [
    { "step": "Receive Application", "description": "Collect and log the incoming application for review." },
    { "step": "Verify Documents", "description": "Check all submitted documents for completeness and validity." }
  ],
  "decision_tree": {
    "question": "Is the application complete?",
    "yes": {
      "question": "Are all submitted documents valid?",
      "yes": {
        "action": "Approve the application and issue confirmation."
      },
      "no": {
        "action": "Reject the application and request corrected documents."
      }
    },
    "no": {
      "question": "Is the applicant reachable?",
      "yes": {
        "action": "Contact the applicant and request missing information."
      },
      "no": {
        "action": "Mark the application as abandoned after 30 days."
      }
    }
  },
  "checklist": [
    "Verify application reference number",
    "Check all required documents are attached",
    "Confirm applicant identity",
    "Record decision and notify applicant"
  ]
}

━━━━━
IMPORTANT:
- Return ONLY raw JSON — no markdown, no code fences, no explanation
- The decision_tree root MUST be an internal node (must have "question", "yes", "no")
- Keep the tree relevant to the actual policy content provided`;

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

/**
 * Send policy text to Gemini and return a structured, validated
 * workflow / decision_tree / checklist object.
 */
export async function generatePolicy(inputText: string): Promise<GeneratedPolicy> {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `${SYSTEM_PROMPT}\n\n━━━━━\nPOLICY TEXT:\n${inputText}`;

    let raw: string;
    try {
        const result = await model.generateContent(prompt);
        raw = result.response.text();
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Gemini API error: ${message}`);
    }

    // ── Parse JSON ───────────────────────────────────────────────────────────
    let parsed: unknown;
    try {
        parsed = JSON.parse(extractJson(raw));
    } catch {
        throw new Error(`Gemini returned invalid JSON. Raw: ${raw.slice(0, 400)}`);
    }

    if (!validateShape(parsed)) {
        throw new Error('Gemini response is missing required fields (workflow / decision_tree / checklist)');
    }

    // ── Sanitize workflow ────────────────────────────────────────────────────
    const workflow: PolicyWorkflowStep[] = (parsed.workflow as unknown[])
        .filter((s): s is Record<string, string> => !!s && typeof s === 'object')
        .map((s) => ({
            step: (s.step ?? s.title ?? 'Step').trim(),
            description: (s.description ?? '').trim(),
        }))
        .filter((s) => s.step.length > 0);

    if (workflow.length === 0) {
        workflow.push(
            { step: 'Review Policy', description: 'Read and understand the policy document thoroughly.' },
            { step: 'Implement Steps', description: 'Execute each required action as outlined in the policy.' }
        );
    }

    // ── Sanitize decision tree (recursive, max 3 levels) ────────────────────
    let decision_tree: DecisionNode;
    try {
        const sanitized = sanitizeDecisionNode(parsed.decision_tree, 1, 3);
        // Root MUST be internal — if sanitization produced a leaf, wrap it
        if ('action' in sanitized) {
            decision_tree = fallbackDecisionTree(workflow[0]?.step ?? 'this policy');
        } else {
            decision_tree = sanitized;
        }
    } catch {
        decision_tree = fallbackDecisionTree(workflow[0]?.step ?? 'this policy');
    }

    // ── Sanitize checklist ───────────────────────────────────────────────────
    const checklist: string[] = (parsed.checklist as unknown[])
        .map((item) => (typeof item === 'string' ? item.trim() : String(item).trim()))
        .filter((item) => item.length > 0);

    if (checklist.length === 0) {
        checklist.push('Review policy document', 'Verify all required documents', 'Confirm compliance');
    }

    return { workflow, decision_tree: decision_tree as PolicyDecisionTree, checklist };
}
