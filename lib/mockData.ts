import { Policy, WorkflowStep, DecisionNode, ChecklistItem, DashboardStats, UserProfile } from './types';

export const mockUserProfile: UserProfile = {
  id: 'user-1',
  name: 'Sarah Johnson',
  role: 'Field Officer',
  department: 'Urban Development',
  lastSync: new Date(),
};

export const mockDashboardStats: DashboardStats = {
  totalPolicies: 24,
  tasksCompleted: 18,
  pendingReviews: 3,
  syncStatus: 'synced',
};

export const mockWorkflowSteps: WorkflowStep[] = [
  {
    id: 'step-1',
    title: 'Initial Assessment',
    description: 'Review zoning applications',
    order: 1,
    completed: true,
  },
  {
    id: 'step-2',
    title: 'Stakeholder Consultation',
    description: 'Gather community feedback',
    order: 2,
    completed: true,
  },
  {
    id: 'step-3',
    title: 'Environmental Review',
    description: 'Complete environmental impact assessment',
    order: 3,
    completed: true,
  },
  {
    id: 'step-4',
    title: 'Legal Review',
    description: 'Verify compliance with local laws',
    order: 4,
    completed: false,
  },
  {
    id: 'step-5',
    title: 'Final Approval',
    description: 'Obtain government sign-off',
    order: 5,
    completed: false,
  },
];

export const mockDecisionTree: DecisionNode[] = [
  {
    id: 'dec-1',
    question: 'Is the property in a residential zone?',
    trueAction: 'Apply residential zoning regulations',
    falseAction: 'Check commercial zone status',
    children: [
      {
        id: 'dec-1-1',
        question: 'Is density > 50 units/acre?',
        trueAction: 'Require high-density approval',
        falseAction: 'Standard residential approval',
      },
    ],
  },
  {
    id: 'dec-2',
    question: 'Is the property in a commercial zone?',
    trueAction: 'Apply commercial zoning regulations',
    falseAction: 'Check mixed-use zone status',
  },
];

export const mockChecklist: ChecklistItem[] = [
  {
    id: 'check-1',
    title: 'Application received and verified',
    description: 'Confirm all required documents are present',
    completed: true,
    order: 1,
    status: 'completed',
    uuid: '550e8400-e29b-41d4-a716-446655440001',
  },
  {
    id: 'check-2',
    title: 'Zoning compliance check',
    description: 'Verify property meets local zoning requirements',
    completed: true,
    order: 2,
    status: 'completed',
    uuid: '550e8400-e29b-41d4-a716-446655440002',
  },
  {
    id: 'check-3',
    title: 'Environmental assessment',
    description: 'Complete environmental impact review',
    completed: true,
    order: 3,
    status: 'completed',
    uuid: '550e8400-e29b-41d4-a716-446655440003',
  },
  {
    id: 'check-4',
    title: 'Community notification',
    description: 'Post public notice for community review',
    completed: false,
    order: 4,
    status: 'pending',
    uuid: '550e8400-e29b-41d4-a716-446655440004',
  },
  {
    id: 'check-5',
    title: 'Hearing and appeals',
    description: 'Schedule public hearing if needed',
    completed: false,
    order: 5,
    status: 'pending',
    uuid: '550e8400-e29b-41d4-a716-446655440005',
  },
  {
    id: 'check-6',
    title: 'Final approval',
    description: 'Obtain all required signatures',
    completed: false,
    order: 6,
    status: 'flagged',
    uuid: '550e8400-e29b-41d4-a716-446655440006',
  },
];

export const mockPolicies: Policy[] = [
  {
    id: 'policy-1',
    title: 'Smart Zoning & Rent Transparency Policy',
    description: 'Comprehensive policy for urban zoning and rent control',
    status: 'active',
    progress: 65,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-20'),
    source: 'City Council Resolution 2024-01',
    workflowSteps: mockWorkflowSteps,
    decisionTree: mockDecisionTree,
    checklist: mockChecklist,
  },
  {
    id: 'policy-2',
    title: 'Environmental Protection Act',
    description: 'Guidelines for environmental compliance',
    status: 'active',
    progress: 45,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-18'),
  },
  {
    id: 'policy-3',
    title: 'Housing Development Standards',
    description: 'Standards for new residential development',
    status: 'draft',
    progress: 25,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-21'),
  },
  {
    id: 'policy-4',
    title: 'Commercial District Regulations',
    description: 'Regulations for commercial zones',
    status: 'active',
    progress: 80,
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2024-02-15'),
  },
  {
    id: 'policy-5',
    title: 'Public Transportation Accessibility',
    description: 'Accessibility standards for transit infrastructure',
    status: 'archived',
    progress: 100,
    createdAt: new Date('2023-10-15'),
    updatedAt: new Date('2024-01-20'),
  },
];

export const recentPolicies = mockPolicies.slice(0, 4);

export const dailyHint = {
  title: 'Zoning Tip of the Day',
  content: 'Remember to check both local and state zoning regulations when reviewing applications. Some properties may fall under special overlay districts with additional requirements.',
  icon: 'Lightbulb',
};
