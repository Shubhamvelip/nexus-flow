import { Policy, ChecklistState, PolicyDetailPayload } from '@/types/policy';
import { mockPolicies, mockChecklistStates } from '@/constants/mockData';

/**
 * Data Access Layer - Currently using mock data with Promise delays
 * Replace internal logic with fetch() or prisma calls without changing component code
 */

const NETWORK_DELAY = 500; // Simulate network latency in ms

/**
 * Fetch all policies for the landing page
 */
export async function fetchAllPolicies(): Promise<Policy[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('[v0] Fetching all policies from data service');
      resolve(mockPolicies);
    }, NETWORK_DELAY);
  });
}

/**
 * Fetch a specific policy by ID with its checklist state
 */
export async function fetchPolicyById(
  id: string
): Promise<PolicyDetailPayload | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[v0] Fetching policy ${id} from data service`);
      const policy = mockPolicies.find((p) => p.id === id);
      const checklistState = mockChecklistStates[id];

      if (!policy || !checklistState) {
        resolve(null);
        return;
      }

      resolve({
        policy,
        checklistState,
      });
    }, NETWORK_DELAY);
  });
}

/**
 * Fetch recent policies (limited set) for the dashboard
 */
export async function fetchRecentPolicies(limit: number = 3): Promise<Policy[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[v0] Fetching ${limit} recent policies from data service`);
      resolve(mockPolicies.slice(0, limit));
    }, NETWORK_DELAY);
  });
}

/**
 * Save checklist state after user interaction
 * This function is optimistic - UI updates immediately, then confirms with backend
 */
export async function saveChecklistState(
  policyId: string,
  itemId: string,
  completed: boolean
): Promise<ChecklistState> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(
        `[v0] Saving checklist state - Policy: ${policyId}, Item: ${itemId}, Completed: ${completed}`
      );

      const state = mockChecklistStates[policyId];
      if (state) {
        state.items[itemId] = completed;
        state.lastUpdated = new Date();
      }

      resolve(state || { policyId, items: {}, lastUpdated: new Date() });
    }, NETWORK_DELAY);
  });
}

/**
 * Update entire checklist state
 */
export async function updateChecklistState(
  policyId: string,
  items: Record<string, boolean>
): Promise<ChecklistState> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(
        `[v0] Updating entire checklist state for policy ${policyId}`
      );

      const state = mockChecklistStates[policyId] || {
        policyId,
        items: {},
        lastUpdated: new Date(),
      };

      state.items = items;
      state.lastUpdated = new Date();
      mockChecklistStates[policyId] = state;

      resolve(state);
    }, NETWORK_DELAY);
  });
}

/**
 * Upload and process PDF file
 * Simulates Gemini API processing
 */
export async function processPDFFile(
  file: File,
  policyTitle: string
): Promise<{ success: boolean; data?: Policy; error?: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[v0] Processing PDF file: ${file.name} for policy: ${policyTitle}`);

      // Simulate creating a new policy from PDF
      const newPolicy: Policy = {
        id: `policy-${Date.now()}`,
        title: policyTitle || file.name.replace('.pdf', ''),
        description: 'Generated from PDF upload',
        category: 'Auto-Generated',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        steps: [],
        checklist_items: [],
        decisionTree: {
          rootNodeId: 'root',
          nodes: [],
          edges: [],
        },
        completionPercentage: 0,
      };

      console.log('[v0] PDF processing complete, new policy created:', newPolicy.id);
      resolve({ success: true, data: newPolicy });
    }, NETWORK_DELAY * 2); // Longer delay for file processing
  });
}

/**
 * Get completion statistics for dashboard
 */
export async function getCompletionStats(): Promise<{
  totalPolicies: number;
  activePolicies: number;
  avgCompletion: number;
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('[v0] Fetching completion statistics');
      const activePolicies = mockPolicies.filter(p => p.status === 'active');
      const avgCompletion = mockPolicies.reduce((sum, p) => sum + p.completionPercentage, 0) / mockPolicies.length;

      resolve({
        totalPolicies: mockPolicies.length,
        activePolicies: activePolicies.length,
        avgCompletion: Math.round(avgCompletion),
      });
    }, NETWORK_DELAY);
  });
}
