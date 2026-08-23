# SprintDesk — Sprint Management Dashboard

A production-quality sprint management dashboard built for software development teams. Features include secure authentication, a Kanban board with drag-and-drop, analytics dashboards, a notification system, and a custom design system — all built from scratch.

## Tech Stack

| Area | Choice |
|---|---|
| Framework | React 19 + TypeScript (strict mode) |
| Build Tool | Vite 8 |
| State (Client) | Zustand 5 (persisted to localStorage) |
| Data Fetching | TanStack Query v5 + custom service layer |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| Charts | Recharts |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Testing | Vitest + React Testing Library |
| APIs | DummyJSON (auth), JSONPlaceholder (notifications), mock-data.json (tasks) |

## Architecture

```
src/
├── __tests__/         # Unit tests (board store, toast, auth interceptor)
├── components/
│   ├── analytics/     # Recharts chart components
│   ├── board/         # Kanban column, task cards, drawer, create modal
│   ├── layout/        # Sidebar, mobile nav, navbar, protected route
│   ├── notifications/ # (handled inline in Navbar)
│   └── ui/            # Design system: Button, Input, Select, Modal, Toast, DataTable, Skeleton
├── hooks/             # useToast (event emitter pattern)
├── pages/             # LoginPage, DashboardPage, BoardPage, AnalyticsPage
├── services/          # API layer: taskService, authService, notificationService, sprintService
├── store/             # Zustand stores: board, auth, theme, notifications
├── types/             # TypeScript type definitions
└── utils/             # cn(), formatDate(), getPriorityColor(), computeAnalytics()
```

### Data Flow

```
UI Components
      ↓
Hooks / Query Layer (TanStack Query / Zustand)
      ↓
API / Service Layer (services/api.ts)
      ↓
Data Sources: mock-data.json / DummyJSON / JSONPlaceholder
```

The service layer abstracts all data sources behind a consistent interface. Replacing `mock-data.json` with a real backend requires zero changes to UI components.

## Features

### Task 01 — Authentication
- Login via DummyJSON API (`emilys` / `emilyspass`)
- Bearer token attached automatically to API calls
- Token refresh simulation (silent refresh on session validation)
- Protected routes — unauthenticated users redirected to `/login`
- Authenticated users redirected away from `/login`
- Session persisted across page refreshes via refresh token in localStorage
- Logout clears all auth state

### Task 02 — Kanban Sprint Board
- Four columns: Backlog, In Progress, Review, Done
- Drag and drop within and between columns using @dnd-kit
- Task cards show priority, assignee, and due date
- Side drawer for task details with edit, comments
- Create new tasks with title, priority, assignee, due date
- Delete tasks with confirmation modal
- Column counts update dynamically
- Undo last drag-and-drop action
- Board state persisted to localStorage via Zustand

### Task 03 — Analytics & Data Visualisation
- Sprint Velocity: completed tasks per sprint (bar chart)
- Task Status: distribution across columns (pie chart)
- Priority Breakdown: stacked bar chart across columns
- Completion Trend: tasks completed over time (line chart)
- All charts derived from real board data (not hardcoded)
- Charts update when board data changes
- Responsive down to 375px viewport
- Chart animations (Recharts built-in)

### Task 04 — Design System & Component Library
Custom components built from scratch with Tailwind CSS:
- **Button** — primary, secondary, ghost, danger variants; sm/md/lg sizes; loading state
- **Input** — with label, error state, focus ring, dark mode
- **Select/Dropdown** — with label, error state
- **Modal** — accessible dialog with Escape key, backdrop click
- **Toast** — success/error/info types, auto-dismiss, stacked
- **DataTable** — sortable columns, row click, empty state
- **Skeleton** — card, table, board loading states

All components are accessible (ARIA labels, focus management, keyboard navigation), responsive, and support dark mode.

### Task 05 — Real-Time Notification System
- Polls JSONPlaceholder every 15 seconds for new posts
- Treats new post IDs as new notifications
- Notification bell with unread count badge
- Panel shows latest 20 notifications with read/unread state
- Mark individual or all notifications as read
- Persisted via Zustand + localStorage
- Pauses polling when browser tab is hidden (visibilitychange)
- Shows toast when new notifications arrive while panel is closed

### Task 06 — Performance, Accessibility & Testing
- **Code Splitting**: React.lazy + Suspense for all route-level pages
- **Lazy Loading**: AnalyticsPage, BoardPage, DashboardPage, LoginPage all lazy-loaded
- **React.memo / useMemo / useCallback** applied throughout
- **Accessibility**: ARIA labels, keyboard navigation, semantic HTML, focus management
- **Testing**: 13 tests across 3 suites (all passing)

## Routes

| Path | Access | Description |
|---|---|---|
| `/login` | Public | Login page |
| `/dashboard` | Protected | Dashboard with metrics and charts |
| `/board` | Protected | Kanban sprint board |
| `/analytics` | Protected | Analytics charts page |

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Run

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

### Run Tests

```bash
npm run test
```

### Login Credentials

| Field | Value |
|---|---|
| Username | `emilys` |
| Password | `emilyspass` |

## API Endpoints

### DummyJSON (Authentication)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `https://dummyjson.com/auth/login` | Login with username/password |
| POST | `https://dummyjson.com/auth/refresh` | Refresh access token |
| GET | `https://dummyjson.com/auth/me` | Get current user |

### JSONPlaceholder (Notifications)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `https://jsonplaceholder.typicode.com/posts?_limit=5` | Fetch latest notifications |

### Local Mock Data

| Method | Source | Purpose |
|---|---|---|
| GET | `/mock-data.json` | Tasks, comments, sprint data |

## Known Limitations & Trade-offs

- **Token refresh is simulated**: The app calls the real DummyJSON refresh endpoint, but no actual 401 interceptor is implemented in the service layer. The refresh flow runs on initial session validation.
- **Notifications are polled**: A real production app would use WebSockets or Server-Sent Events. Polling was chosen for simplicity and works within the assignment constraints.
- **Mock data is in-memory**: Changes to tasks (add, delete, update) modify the in-memory array but are not persisted to disk. Persisting to localStorage via Zustand covers page refreshes.
- **Analytics data is synchronous**: Computed from the Zustand store rather than fetched from a separate analytics API.

## What Would Be Improved With More Time

- Full 401 interceptor with automatic retry queue for all failed requests
- WebSocket-based real-time collaboration on the board
- Storybook for component documentation
- axe-core accessibility testing in CI
- E2E tests with Playwright
- Performance budgets and Lighthouse CI
- Proper error boundaries with fallback UI
- Pagination/filtering on the board view
- Keyboard-accessible drag-and-drop (basic support via KeyboardSensor)
- Dark mode smooth transitions

## Submission Notes

- Repository: public GitHub
- Live deployment: (not deployed — run locally)
- Screen recording: (to be recorded)

## License

MIT