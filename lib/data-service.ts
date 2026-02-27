/**
 * Data Access Layer — real data via /api/policies
 * Server-side only: uses absolute URL via env var or defaults to localhost.
 */

// ── Firestore policy shape (from /api/policies) ───────────────────────────────

interface FirestorePolicy {
  id: string;
  title: string;
  input_text?: string;
  workflow: Array<{ step: string; description: string }>;
  decision_tree: Record<string, unknown>;
  checklist: string[];
  created_at: { seconds?: number; _seconds?: number } | null;
}

// ── Normalised Policy shape (for UI) ─────────────────────────────────────────

export interface DashboardPolicy {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'draft' | 'archived';
  completionPercentage: number;
  checklistTotal: number;
  workflowSteps: number;
  createdAt: string;
}

export interface DashboardStats {
  totalPolicies: number;
  completedTasks: number;
  pendingTasks: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getBaseUrl(): string {
  // Works in both server (absolute) and edge runtimes
  return process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
}

function normalisePolicy(raw: FirestorePolicy): DashboardPolicy {
  const checklistTotal = raw.checklist?.length ?? 0;
  const workflowSteps = raw.workflow?.length ?? 0;

  const seconds =
    raw.created_at?.seconds ??
    (raw.created_at as unknown as { _seconds?: number })?._seconds;
  const createdAt = seconds
    ? new Date(seconds * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    : 'Unknown date';

  // Derive a status: policies from Gemini start as "active"
  const status: DashboardPolicy['status'] = 'active';

  // Use truncated input_text as description, or a generic fallback
  const description = raw.input_text
    ? raw.input_text.slice(0, 120).replace(/\n/g, ' ')
    : 'AI-generated policy document';

  return {
    id: raw.id,
    title: raw.title,
    description,
    status,
    completionPercentage: 0, // tracked client-side via checklist
    checklistTotal,
    workflowSteps,
    createdAt,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch all policies ordered newest-first.
 */
export async function fetchAllPolicies(): Promise<DashboardPolicy[]> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/policies`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return ((data.policies ?? []) as FirestorePolicy[]).map(normalisePolicy);
  } catch {
    return [];
  }
}

/**
 * Fetch recent N policies for the dashboard (newest first).
 */
export async function fetchRecentPolicies(limit = 5): Promise<DashboardPolicy[]> {
  const all = await fetchAllPolicies();
  return all.slice(0, limit);
}

/**
 * Compute dashboard stats from the full policy list.
 */
export async function getCompletionStats(): Promise<DashboardStats> {
  const all = await fetchAllPolicies();

  // Count total checklist items across all policies
  const totalTasks = all.reduce((sum, p) => sum + p.checklistTotal, 0);

  return {
    totalPolicies: all.length,
    completedTasks: 0,           // tracked client-side; 0 until persisted
    pendingTasks: totalTasks,    // all checklist items start pending
  };
}

/**
 * Fetch a single policy by ID.
 */
export async function fetchPolicyById(id: string): Promise<DashboardPolicy | null> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/policies/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.policy ? normalisePolicy(data.policy as FirestorePolicy) : null;
  } catch {
    return null;
  }
}
