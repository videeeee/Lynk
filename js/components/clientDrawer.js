/**
 * js/components/clientDrawer.js
 * Client 360° Detail Slide-over Inspector.
 * Shows all workspace metadata, linked deliverables, and documents for a selected client.
 */

import { store } from '../state.js';
import { icons } from './icons.js';
import { triggerTaskCelebration } from './confetti.js';

let activeClientId = null;

export function initClientDrawer() {
    const drawer = document.getElementById('client-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    const closeBtn = document.getElementById('client-drawer-close');
    const editBtn = document.getElementById('drawer-edit-client-btn');
    const deleteBtn = document.getElementById('drawer-delete-client-btn');
    const addTaskBtn = document.getElementById('drawer-add-task-btn');
    const addDocBtn = document.getElementById('drawer-add-doc-btn');

    const closeDrawer = () => {
        if (!drawer) return;
        drawer.classList.remove('is-open');
        backdrop?.classList.remove('is-open');
        drawer.setAttribute('aria-hidden', 'true');
        activeClientId = null;
    };

    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer?.classList.contains('is-open')) {
            closeDrawer();
        }
    });

    // Listen for custom event to open drawer
    window.addEventListener('view-client-details', (e) => {
        const { clientId } = e.detail;
        openClientDrawer(clientId);
    });

    // Drawer Actions: Edit
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            if (activeClientId) {
                closeDrawer();
                window.dispatchEvent(new CustomEvent('edit-client', { detail: { clientId: activeClientId } }));
            }
        });
    }

    // Drawer Actions: Delete
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (activeClientId && confirm('Delete this client and un-link their tasks?')) {
                store.deleteClient(activeClientId);
                closeDrawer();
            }
        });
    }

    // Drawer Actions: Quick Add Task
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => {
            const taskModal = document.getElementById('task-modal');
            const clientSelect = document.getElementById('task-client-select');
            if (taskModal && clientSelect && activeClientId) {
                clientSelect.value = activeClientId;
                taskModal.showModal();
            }
        });
    }

    // Drawer Actions: Quick Add Document
    if (addDocBtn) {
        addDocBtn.addEventListener('click', () => {
            const docModal = document.getElementById('doc-modal');
            const clientSelect = document.getElementById('doc-client-select');
            if (docModal && clientSelect && activeClientId) {
                clientSelect.value = activeClientId;
                docModal.showModal();
            }
        });
    }
}

export function openClientDrawer(clientId) {
    const drawer = document.getElementById('client-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    if (!drawer) return;

    activeClientId = clientId;
    renderDrawerContent();

    drawer.classList.add('is-open');
    backdrop?.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
}

export function updateDrawerIfOpen(state) {
    const drawer = document.getElementById('client-drawer');
    if (drawer && drawer.classList.contains('is-open') && activeClientId) {
        const clientExists = state.clients.some(c => c.id === activeClientId);
        if (!clientExists) {
            drawer.classList.remove('is-open');
            document.getElementById('drawer-backdrop')?.classList.remove('is-open');
            activeClientId = null;
        } else {
            renderDrawerContent();
        }
    }
}

function renderDrawerContent() {
    const state = store.getState();
    const client = state.clients.find(c => c.id === activeClientId);
    if (!client) return;

    // Header info
    const elName = document.getElementById('drawer-client-name');
    const elStatus = document.getElementById('drawer-client-status');
    const elDeadline = document.getElementById('drawer-client-deadline');

    if (elName) elName.textContent = client.name;
    if (elStatus) {
        elStatus.className = `badge badge-${client.status}`;
        elStatus.textContent = client.status;
    }
    if (elDeadline) {
        elDeadline.textContent = client.deadline ? `Target Delivery: ${client.deadline}` : 'No deadline scheduled';
    }

    // 1. Dynamic Custom Fields
    const fieldsContainer = document.getElementById('drawer-custom-fields');
    if (fieldsContainer) {
        const entries = Object.entries(client.extra || {});
        if (entries.length === 0) {
            fieldsContainer.innerHTML = '<span class="text-muted" style="font-size:0.85rem">No custom workspace details saved.</span>';
        } else {
            fieldsContainer.innerHTML = entries.map(([key, val]) => `
                <div class="drawer-field-card">
                    <span class="drawer-field-label">${escapeHtml(key)}</span>
                    <span class="drawer-field-value">${escapeHtml(String(val || '—'))}</span>
                </div>
            `).join('');
        }
    }

    // 2. Linked Tasks
    const tasksContainer = document.getElementById('drawer-tasks-list');
    if (tasksContainer) {
        const clientTasks = state.tasks.filter(t => t.clientId === activeClientId);
        if (clientTasks.length === 0) {
            tasksContainer.innerHTML = '<li class="text-muted" style="font-size:0.85rem; padding: 6px 0;">No tasks assigned to this client yet.</li>';
        } else {
            tasksContainer.innerHTML = clientTasks.map(task => {
                let statusClass = '';
                let checkIcon = '';
                if (task.status === 'done') {
                    statusClass = 'is-done';
                    checkIcon = icons.check;
                } else if (task.status === 'in-progress') {
                    statusClass = 'is-inprogress';
                    checkIcon = icons.dots;
                }

                return `
                    <li class="task-item" style="padding: 10px 14px;">
                        <div class="task-item-left">
                            <button type="button" class="task-cycle-btn ${statusClass}" title="Cycle status" data-drawer-task="${task.id}">
                                ${checkIcon}
                            </button>
                            <div>
                                <span style="font-size: 0.9rem; font-weight: 600; ${task.status === 'done' ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
                                    ${escapeHtml(task.title)}
                                </span>
                                ${task.due ? `<div style="font-size:0.75rem; color:var(--color-muted); display:inline-flex; align-items:center; gap:4px; margin-top:2px;">${icons.calendar} ${task.due}</div>` : ''}
                            </div>
                        </div>
                        <span class="badge badge-${task.status === 'done' ? 'completed' : (task.status === 'in-progress' ? 'active' : 'pending')}">
                            ${task.status}
                        </span>
                    </li>
                `;
            }).join('');

            // Attach task cycle listeners inside drawer
            tasksContainer.querySelectorAll('[data-drawer-task]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const taskId = e.currentTarget.dataset.drawerTask;
                    const task = store.getState().tasks.find(t => t.id === taskId);
                    const willBeDone = task && task.status === 'in-progress';

                    if (willBeDone) {
                        const rect = btn.getBoundingClientRect();
                        triggerTaskCelebration(rect.left + rect.width / 2, rect.top + rect.height / 2);
                        const item = btn.closest('.task-item');
                        if (item) item.classList.add('task-celebrate');
                    }

                    store.cycleTaskStatus(taskId);
                });
            });
        }
    }

    // 3. Linked Documents
    const docsContainer = document.getElementById('drawer-docs-list');
    if (docsContainer) {
        const clientDocs = state.documents.filter(d => d.clientId === activeClientId);
        if (clientDocs.length === 0) {
            docsContainer.innerHTML = '<span class="text-muted" style="font-size:0.85rem">No documents attached to this client.</span>';
        } else {
            docsContainer.innerHTML = clientDocs.map(doc => `
                <div class="drawer-doc-item">
                    <span style="font-weight: 600; font-size: 0.88rem; display:inline-flex; align-items:center; gap:6px;">
                        <span style="color:var(--color-violet); display:inline-flex;">${icons.documents}</span>
                        ${escapeHtml(doc.name)}
                    </span>
                    ${doc.url ? `
                        <a href="${escapeHtml(doc.url)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-secondary" style="gap:6px;">
                            Open ${icons.externalLink}
                        </a>
                    ` : ''}
                </div>
            `).join('');
        }
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
