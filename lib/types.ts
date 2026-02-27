export interface Policy {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'archived';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  source?: string;
  workflowSteps: WorkflowStep[];
  decisionTree: DecisionNode[];
  checklist: ChecklistItem[];
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  order: number;
  completed: boolean;
}

export interface DecisionNode {
  id: string;
  question: string;
  trueAction: string;
  falseAction: string;
  children?: DecisionNode[];
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  order: number;
  status?: 'pending' | 'completed' | 'flagged';
  uuid?: string;
}

export interface PolicyGeneratorState {
  fileName: string;
  title: string;
  content: string;
  processingStep: 'upload' | 'processing' | 'preview' | 'complete';
  workflowSteps: WorkflowStep[];
  decisionTree: DecisionNode[];
  checklist: ChecklistItem[];
  error?: string;
}

export interface DashboardStats {
  totalPolicies: number;
  tasksCompleted: number;
  pendingReviews: number;
  syncStatus: 'synced' | 'syncing' | 'offline';
}

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  department: string;
  lastSync: Date;
}

export interface GeminiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface GeminiResponse {
  success: boolean;
  message: GeminiMessage;
  error?: string;
}

export interface ChatMessage {
  id: string;
  policyId: string;
  userQuery: string;
  aiResponse: string;
  timestamp: Date;
  savedToNotes?: boolean;
}
