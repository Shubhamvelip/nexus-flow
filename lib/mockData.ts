import { Policy, WorkflowStep, DecisionNode, ChecklistItem, DashboardStats, UserProfile } from './types';

/**
 * Mock data — intentionally empty so the app starts fresh.
 * Real data will come from the generator or API.
 */

export const mockUserProfile: UserProfile = {
  id: 'user-1',
  name: 'Sarah Johnson',
  role: 'Field Officer',
  department: 'Urban Development',
  lastSync: new Date(),
};

export const mockDashboardStats: DashboardStats = {
  totalPolicies: 0,
  tasksCompleted: 0,
  pendingReviews: 0,
  syncStatus: 'synced',
};

export const mockWorkflowSteps: WorkflowStep[] = [];

export const mockDecisionTree: DecisionNode[] = [];

export const mockChecklist: ChecklistItem[] = [];

export const mockPolicies: Policy[] = [];

export const recentPolicies: Policy[] = [];

export const dailyHint = {
  title: 'Zoning Tip of the Day',
  content:
    'Remember to check both local and state zoning regulations when reviewing applications. Some properties may fall under special overlay districts with additional requirements.',
  icon: 'Lightbulb',
};
