# Knowledge-to-Workflow Engine - Architecture Documentation

## Overview

This is a professional Next.js frontend for a "Knowledge-to-Workflow Engine" that transforms PDF documents into intelligent, executable workflows with decision trees and checklists.

## Key Principles

1. **Strict Data Contracts**: All UI components consume data through strict TypeScript interfaces
2. **Data Access Layer**: Centralized data fetching with mock data (easily replaceable with real APIs)
3. **Server & Client Separation**: React Server Components for data fetching, Client Components for interactivity
4. **Optimistic Updates**: Real-time UI feedback with `useOptimistic` hook
5. **Data-Driven UI**: Decision trees and workflows update automatically based on data changes

## Project Structure

```
app/
├── page.tsx                 # Landing page with redirect to dashboard
├── dashboard/
│   └── page.tsx            # Dashboard RSC (Server Component)
├── policy/[id]/
│   └── page.tsx            # Policy detail RSC (Server Component)
└── generator/
    └── page.tsx            # Policy generator page

types/
└── policy.ts               # Strict TypeScript interfaces for all data

constants/
└── mockData.ts             # Mock data matching the Policy interface

lib/
├── data-service.ts         # Data access layer (currently mock, easily replaceable)
└── useGeminiChat.ts        # Hook for Gemini API integration

components/
├── DashboardClient.tsx      # Dashboard interactive component
├── PolicyDetailClient.tsx   # Policy detail interactive component
├── OptimisticChecklist.tsx  # Checklist with useOptimistic hook
├── DecisionTree.tsx         # Interactive decision tree visualization
├── ProgressCircle.tsx       # Circular progress indicator
├── FileUploadPanel.tsx      # PDF upload with drag-drop
├── GeneratorPageContent.tsx # 45/55 split generator page
└── GeminiAssistant.tsx      # Floating AI assistant with drawer
```

## Core Types (types/policy.ts)

```typescript
interface Policy {
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

interface DecisionTree {
  nodes: DecisionNode[];
  edges: DecisionEdge[];
  rootNodeId: string;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  order: number;
}
```

## Data Access Layer (lib/data-service.ts)

The data service provides async functions that simulate network latency:

- `fetchAllPolicies()` - Get all policies
- `fetchPolicyById(id)` - Get specific policy with checklist state
- `fetchRecentPolicies(limit)` - Get limited policy set for dashboard
- `saveChecklistState(policyId, itemId, completed)` - Save checklist changes
- `processPDFFile(file, title)` - Process PDF for policy generation
- `getCompletionStats()` - Get dashboard statistics

**To integrate with a real backend:**
1. Replace mock data retrieval with `fetch()` calls
2. All component code remains unchanged
3. No breaking changes to existing interfaces

## Page Architecture

### Dashboard (Server Component)
- Fetches data in `app/dashboard/page.tsx` using `fetchRecentPolicies()` and `getCompletionStats()`
- Renders `<DashboardClient>` with fetched data
- Shows policy cards with progress circles and quick stats

### Policy Detail (Server Component)
- Fetches policy data in `app/policy/[id]/page.tsx`
- Renders `<PolicyDetailClient>` with policy and checklist state
- Interactive tabs for Checklist, Decision Tree, and Workflow

### Generator Page (Client Component)
- 45/55 horizontal split layout using `react-resizable-panels`
- Left: File upload with drag-drop
- Right: Tabbed preview (Workflow, Decision Tree, Checklist)

## Interactive Features

### OptimisticChecklist Component
Uses React's `useOptimistic` hook for instant UI feedback:

```typescript
const [optimisticState, addOptimisticState] = useOptimistic(
  initialState,
  (state, { itemId, completed }) => ({
    ...state,
    items: { ...state.items, [itemId]: completed },
  })
);
```

- User clicks checkbox → UI updates immediately
- Backend call processes in background
- If error occurs, state reverts (not implemented in mock)

### Interactive Decision Tree
- Data-driven: Updates automatically when tree data changes
- Click nodes to view details
- Shows branching paths with edge labels
- Supports visual highlighting of selected path

### Circular Progress
- Animated SVG circle showing percentage
- Real-time updates as checklist changes
- Customizable sizes (sm, md, lg)

## Gemini Assistant Integration

The `GeminiAssistant` component:
- Floating button in bottom-right corner
- Opens drawer with conversation history
- Currently logs queries to console: `console.log('[v0] Gemini query:', inputValue)`
- Ready for Gemini API integration in `lib/useGeminiChat.ts`

## Mock Data Strategy

`constants/mockData.ts` contains:
- 3 sample policies with different statuses
- Workflow steps with progress states
- Checklist items with completion tracking
- Complex decision tree with branching
- Checklist state snapshots

**Network Delay**: 500ms default (simulates real latency)

## Development Workflow

1. **Add new data type**: Update `types/policy.ts`
2. **Add mock data**: Update `constants/mockData.ts`
3. **Add data function**: Create async function in `lib/data-service.ts`
4. **Use in RSC**: Call data function in page.tsx
5. **Render in Client**: Pass data to client component

## Replacement Checklist (When Integrating with Backend)

- [ ] Replace `mockData.ts` imports with API calls in `data-service.ts`
- [ ] Update `fetchPolicyById()` to use actual database
- [ ] Connect `saveChecklistState()` to backend API
- [ ] Replace `processPDFFile()` with Gemini API integration
- [ ] Update `getCompletionStats()` to aggregate from database
- [ ] No changes needed in components or pages

## Styling

- Uses Tailwind CSS with dark government tech theme
- Design tokens in `app/globals.css`
- Primary color: Emerald (accent)
- Background: Deep slate/charcoal
- Smooth animations with Framer Motion

## Performance Optimizations

- Server-side data fetching reduces waterfall requests
- Suspense boundaries for loading states
- Optimistic updates for instant feedback
- Memoized calculations in decision tree
- Lazy component loading with dynamic imports

## Security Considerations

- All data flows through typed interfaces (compile-time safety)
- No sensitive data in mock constants
- Ready for auth token injection in real implementation
- Row-level security patterns supported in architecture

## Next Steps for Production

1. Connect to real database (PostgreSQL, MongoDB, etc.)
2. Implement Gemini API integration
3. Add authentication layer
4. Implement websocket for real-time updates
5. Add file upload to cloud storage
6. Set up error boundary and monitoring
7. Add E2E tests with Playwright
