# Lynk: Product Requirements Document (draft v1)

> Drafted from product decisions made so far. If you already have your own PRD, treat this as a cross-check and reconcile differences before building.

## 1. Overview
**Lynk: Connected Client Experiences** is a web app for managing clients, the tasks owed to them, and the documents shared with them, in one place. It is built to work for any kind of professional, not one niche.

## 2. Problem
People who work for clients (freelancers, designers, developers, enterprise teams) juggle clients, deadlines and files across chats, spreadsheets and folders. Existing tools are either too generic or too heavy, and force one structure on everyone.

## 3. Goals
1. One calm place to see every client, what is done and what is left.
2. Adapt to the user: the client record should fit how *they* work.
3. Look and feel modern and light (liquid-glass visual direction).
4. (Project goal) Serve as a portfolio-quality frontend built to learn HTML, CSS, JavaScript and later React.

**Non-goals (v1):** multi-user accounts, real-time collaboration, billing/invoicing, file uploads, a backend.

## 4. Users
| User | Typical need |
|---|---|
| Freelancer | Track a handful of clients, projects, budgets, deadlines |
| Designer | Track deliverables, brand links, review rounds |
| Developer | Track tech stack, repos, milestones |
| Enterprise team member | Track accounts by department, contacts, contract value |

## 5. Core features (MVP)
### 5.1 Dashboard
- Stat cards: clients, open tasks, completed tasks, overdue.
- Completion donut chart (done vs left).
- Tasks-by-status bar chart (to do, in progress, done).
- "Coming up" list of the nearest deadlines.
- All figures update live when data changes.

### 5.2 Clients
- List with name, status badge, deadline, custom details.
- Add, edit, delete; click a badge to change status (active, pending, overdue, completed).
- Search by name or any detail.

### 5.3 Dynamic client form (key differentiator)
- On first use the user chooses a workspace type: freelancer, designer, developer, enterprise or custom.
- The type loads a preset set of fields (e.g. Email, Project, Budget).
- In Settings the same person can rename, change the type of, add and remove fields at any time.
- The New client form is generated from that schema.
- Existing client data must survive schema changes.
- Name, status and deadline are always present.

### 5.4 Tasks
- Each task belongs to a client (optional), has a due date and a status (to do, in progress, done).
- Add, delete, cycle status.

### 5.5 Documents
- Name, client, optional link. Add and delete.

### 5.6 Settings
- Workspace type, form builder, reset demo data.

## 6. Information architecture
```
Lynk
├── Dashboard   (stats, donut, status bars, upcoming)
├── Clients     (list + search, new client form)
├── Tasks       (list, new task)
├── Documents   (list, add document)
└── Settings    (workspace type, form builder, data)
```
Global: sidebar navigation, top bar with search and "+ New client".

## 7. Key user flows
1. **First run:** open Lynk, choose workspace type, see preset client form, add first client, see dashboard update.
2. **Daily check:** open Dashboard, see what is overdue and coming up, open Tasks, mark progress.
3. **Adapt the form:** Settings, add field "Invoice number", return to Clients, form now includes it.

## 8. Data model (v1, localStorage)
- **Workspace:** type, fields[]
- **Field:** key, label, type (text, number, date, email, url, textarea)
- **Client:** id, name, status, deadline, extra{fieldKey: value}
- **Task:** id, title, clientId, status, due
- **Document:** id, name, clientId, url
Designed so storage can later be replaced by an API.

## 9. Non-functional requirements
- Semantic HTML, labelled inputs, visible focus states, keyboard usable.
- Responsive from 375px phone to desktop.
- Readable: glass effects must not reduce text contrast (tables and inputs stay mostly opaque).
- No console errors; data persists after refresh.

## 10. Success criteria
- All five views are reachable and working.
- Changing the form builder changes the New client form.
- Charts reflect real data.
- Layout works at 375px width.

## 11. Roadmap
1. HTML structure, 2. CSS layout and glass styling, 3. JavaScript data and rendering, 4. Forms and form builder, 5. Charts, 6. Polish and deploy.
Later: React rewrite, real API/backend, auth, client detail pages, file uploads.

## 12. Open questions
- Should "client" be renamable (e.g. Account, Customer) per workspace type?
- Do tasks need subtasks or priorities in v1?
- Export (CSV/PDF) needed in v1?
