/**
 * js/state.js
 * Central State Store & Persistence Layer.
 * Handles Clients, Tasks, Documents, and Workspace Schemas in localStorage.
 */

// Initial Seed Data (Loaded on first visit or reset)
export const DEFAULT_WORKSPACES = {
    freelancer: {
        type: 'freelancer',
        label: 'Freelancer',
        fields: [
            { key: 'project', label: 'Project Name', type: 'text' },
            { key: 'rate', label: 'Billing / Rate', type: 'text' },
            { key: 'deliverables', label: 'Deliverables', type: 'text' }
        ]
    },
    designer: {
        type: 'designer',
        label: 'Designer',
        fields: [
            { key: 'figmaUrl', label: 'Figma File URL', type: 'url' },
            { key: 'revisions', label: 'Revision Rounds', type: 'number' },
            { key: 'brandAssets', label: 'Brand Assets Link', type: 'url' }
        ]
    },
    developer: {
        type: 'developer',
        label: 'Developer',
        fields: [
            { key: 'repoUrl', label: 'Repository URL', type: 'url' },
            { key: 'techStack', label: 'Tech Stack', type: 'text' },
            { key: 'stagingUrl', label: 'Staging Environment', type: 'url' }
        ]
    },
    enterprise: {
        type: 'enterprise',
        label: 'Enterprise',
        fields: [
            { key: 'department', label: 'Department / Unit', type: 'text' },
            { key: 'contractValue', label: 'Contract Value', type: 'text' },
            { key: 'renewalDate', label: 'Renewal Date', type: 'date' }
        ]
    },
    custom: {
        type: 'custom',
        label: 'Custom',
        fields: [
            { key: 'contactEmail', label: 'Primary Contact Email', type: 'email' },
            { key: 'notes', label: 'Key Objectives', type: 'textarea' }
        ]
    }
};

const INITIAL_CLIENTS = [
    {
        id: 'client-1',
        name: 'Twyne Studio',
        status: 'active',
        deadline: '2026-10-24',
        extra: { project: 'Brand & Web Identity', rate: '$4,500 fixed', deliverables: 'Homepage + UI Kit' }
    },
    {
        id: 'client-2',
        name: 'Aumyaa Logistics',
        status: 'pending',
        deadline: '2026-11-05',
        extra: { project: 'Fleet Portal UI', rate: '$85/hr', deliverables: 'Dashboard wireframes' }
    },
    {
        id: 'client-3',
        name: 'Uduge Health',
        status: 'overdue',
        deadline: '2026-10-02',
        extra: { project: 'Telehealth Mobile App', rate: '$12,000', deliverables: 'iOS prototype' }
    },
    {
        id: 'client-4',
        name: 'Pashupati AI',
        status: 'completed',
        deadline: '2026-09-30',
        extra: { project: 'Landing Page Revamp', rate: '$3,200', deliverables: 'Responsive site' }
    }
];

const INITIAL_TASKS = [
    { id: 'task-1', title: 'Export brand color tokens & typography', clientId: 'client-1', status: 'done', due: '2026-10-18' },
    { id: 'task-2', title: 'Complete client feedback on wireframes', clientId: 'client-2', status: 'in-progress', due: '2026-10-22' },
    { id: 'task-3', title: 'Prepare final code handoff & documentation', clientId: 'client-3', status: 'todo', due: '2026-10-28' },
    { id: 'task-4', title: 'Submit invoice for design sign-off', clientId: 'client-4', status: 'done', due: '2026-10-01' },
    { id: 'task-5', title: 'Conduct responsive cross-browser QA', clientId: 'client-1', status: 'in-progress', due: '2026-10-23' }
];

const INITIAL_DOCUMENTS = [
    { id: 'doc-1', name: 'Brand Design Guidelines & Figma', clientId: 'client-1', url: 'https://figma.com/@twyne' },
    { id: 'doc-2', name: 'Master Services Agreement (MSA)', clientId: 'client-2', url: 'https://docs.google.com/sample' },
    { id: 'doc-3', name: 'Technical Handoff Repository', clientId: 'client-3', url: 'https://github.com/sample/uduge' }
];

const STORAGE_KEY = 'lynk_app_state_v1';

class StateStore {
    constructor() {
        this.listeners = [];
        this.load();
    }

    load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                this.state = {
                    currentWorkspace: parsed.currentWorkspace || 'freelancer',
                    workspaces: parsed.workspaces || DEFAULT_WORKSPACES,
                    clients: parsed.clients || INITIAL_CLIENTS,
                    tasks: parsed.tasks || INITIAL_TASKS,
                    documents: parsed.documents || INITIAL_DOCUMENTS
                };
                return;
            }
        } catch (e) {
            console.warn('Could not read state from localStorage, falling back to defaults.', e);
        }

        // Default initial state
        this.state = {
            currentWorkspace: 'freelancer',
            workspaces: JSON.parse(JSON.stringify(DEFAULT_WORKSPACES)),
            clients: JSON.parse(JSON.stringify(INITIAL_CLIENTS)),
            tasks: JSON.parse(JSON.stringify(INITIAL_TASKS)),
            documents: JSON.parse(JSON.stringify(INITIAL_DOCUMENTS))
        };
        this.save();
    }

    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.error('Failed to save state to localStorage', e);
        }
    }

    // Subscribe to state changes (Pub/Sub pattern)
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    notify() {
        this.save();
        this.listeners.forEach(cb => cb(this.state));
    }

    getState() {
        return this.state;
    }

    // --- Actions: Clients ---
    addClient(clientData) {
        const newClient = {
            id: 'client-' + Date.now(),
            name: clientData.name,
            status: clientData.status || 'active',
            deadline: clientData.deadline || '',
            extra: clientData.extra || {}
        };
        this.state.clients.unshift(newClient);
        this.notify();
        return newClient;
    }

    updateClient(id, updatedData) {
        const index = this.state.clients.findIndex(c => c.id === id);
        if (index !== -1) {
            this.state.clients[index] = {
                ...this.state.clients[index],
                ...updatedData,
                extra: { ...this.state.clients[index].extra, ...(updatedData.extra || {}) }
            };
            this.notify();
        }
    }

    cycleClientStatus(id) {
        const sequence = ['active', 'pending', 'overdue', 'completed'];
        const client = this.state.clients.find(c => c.id === id);
        if (client) {
            const currentIndex = sequence.indexOf(client.status);
            client.status = sequence[(currentIndex + 1) % sequence.length];
            this.notify();
        }
    }

    deleteClient(id) {
        this.state.clients = this.state.clients.filter(c => c.id !== id);
        // Clean up linked tasks client reference
        this.state.tasks = this.state.tasks.map(t => t.clientId === id ? { ...t, clientId: '' } : t);
        this.notify();
    }

    // --- Actions: Tasks ---
    addTask(taskData) {
        const newTask = {
            id: 'task-' + Date.now(),
            title: taskData.title,
            clientId: taskData.clientId || '',
            status: taskData.status || 'todo',
            due: taskData.due || ''
        };
        this.state.tasks.unshift(newTask);
        this.notify();
        return newTask;
    }

    cycleTaskStatus(id) {
        const sequence = ['todo', 'in-progress', 'done'];
        const task = this.state.tasks.find(t => t.id === id);
        if (task) {
            const nextIdx = (sequence.indexOf(task.status) + 1) % sequence.length;
            task.status = sequence[nextIdx];
            this.notify();
        }
    }

    deleteTask(id) {
        this.state.tasks = this.state.tasks.filter(t => t.id !== id);
        this.notify();
    }

    // --- Actions: Documents ---
    addDocument(docData) {
        const newDoc = {
            id: 'doc-' + Date.now(),
            name: docData.name,
            clientId: docData.clientId || '',
            url: docData.url || ''
        };
        this.state.documents.unshift(newDoc);
        this.notify();
        return newDoc;
    }

    deleteDocument(id) {
        this.state.documents = this.state.documents.filter(d => d.id !== id);
        this.notify();
    }

    // --- Actions: Workspaces & Schema ---
    setWorkspace(workspaceKey) {
        if (this.state.workspaces[workspaceKey]) {
            this.state.currentWorkspace = workspaceKey;
            this.notify();
        }
    }

    updateWorkspaceFields(workspaceKey, fields) {
        if (this.state.workspaces[workspaceKey]) {
            this.state.workspaces[workspaceKey].fields = fields;
            this.notify();
        }
    }

    restoreState(importedState) {
        if (!importedState || typeof importedState !== 'object') {
            throw new Error('Invalid backup file: not a JSON object.');
        }

        // Validate basic keys
        this.state = {
            currentWorkspace: importedState.currentWorkspace || 'freelancer',
            workspaces: importedState.workspaces || DEFAULT_WORKSPACES,
            clients: Array.isArray(importedState.clients) ? importedState.clients : [],
            tasks: Array.isArray(importedState.tasks) ? importedState.tasks : [],
            documents: Array.isArray(importedState.documents) ? importedState.documents : []
        };
        this.notify();
    }

    resetDemoData() {
        this.state = {
            currentWorkspace: 'freelancer',
            workspaces: JSON.parse(JSON.stringify(DEFAULT_WORKSPACES)),
            clients: JSON.parse(JSON.stringify(INITIAL_CLIENTS)),
            tasks: JSON.parse(JSON.stringify(INITIAL_TASKS)),
            documents: JSON.parse(JSON.stringify(INITIAL_DOCUMENTS))
        };
        this.notify();
    }

    clearAllData() {
        this.state = {
            currentWorkspace: 'freelancer',
            workspaces: JSON.parse(JSON.stringify(DEFAULT_WORKSPACES)),
            clients: [],
            tasks: [],
            documents: []
        };
        this.notify();
    }
}

export const store = new StateStore();
