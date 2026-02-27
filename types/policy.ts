/**
 * Strict TypeScript interfaces for the Knowledge-to-Workflow Engine
 * All UI components must consume data strictly through these types
 */

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  order: number;
}

export interface DecisionNode {
  id: string;
  label: string;
  description?: string;
  type: 'root' | 'decision' | 'outcome' | 'action';
  x: number;
  y: number;
  nextNodeIds?: string[];
}

export interface DecisionEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  condition?: string;
}

export interface DecisionTree {
  nodes: DecisionNode[];
  edges: DecisionEdge[];
  rootNodeId: string;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  order: number;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  subtasks?: string[];
}

export interface Policy {
  id: string;
  title: string;
  description?: string;
  category: string;
  status: 'draft' | 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  steps: WorkflowStep[];
  checklist_items: ChecklistItem[];
  decisionTree: DecisionTree;
  completionPercentage: number;
}

export interface ChecklistState {
  policyId: string;
  items: Record<string, boolean>;
  lastUpdated: Date;
}

export interface PolicyDetailPayload {
  policy: Policy;
  checklistState: ChecklistState;
}
