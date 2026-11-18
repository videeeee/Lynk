/**
 * js/views/tasks.js
 * Renders Tasks List, Status Cycling (to do -> in progress -> done), Add & Delete.
 * Integrated with celebratory chimes and neon crystal sparkle physics.
 */

import { store } from '../state.js';
import { icons } from '../components/icons.js';
import { triggerTaskCelebration } from '../components/confetti.js';
import { sound } from '../components/sound.js';

export function initTasksView() {
    const modal = document.getElementById('task-modal');
    const openBtn = document.getElementById('open-new-task-btn');
    const closeBtn = document.getElementById('task-modal-close');
    const cancelBtn = document.getElementById('task-form-cancel');
    const taskForm = document.getElementById('task-form');

    if (openBtn && modal) {
        openBtn.addEventListener('click', () => {
            // Populate client dropdown
            populateClientDropdown();
            taskForm.reset();
            modal.showModal();
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.close());
    }

    if (cancelBtn && modal) {
        cancelBtn.addEventListener('click', () => modal.close());
    }

    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(taskForm);
            const title = (formData.get('title') || '').trim();
            const clientId = formData.get('clientId') || '';
            const status = formData.get('status') || 'todo';
            const due = formData.get('due') || '';

            if (!title) {
                const err = document.getElementById('error-task-title');
                if (err) err.textContent = 'Please enter a task title.';
                return;
            }

            store.addTask({ title, clientId, status, due });
            modal.close();
            taskForm.reset();
        });
    }
}

export function renderTasks(state) {
    const container = document.getElementById('tasks-list-container');
    const emptyState = document.getElementById('tasks-empty-state');
    if (!container) return;

    if (state.tasks.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.hidden = false;
        return;
    }

    if (emptyState) emptyState.hidden = true;

    container.innerHTML = state.tasks.map(task => {
        const client = state.clients.find(c => c.id === task.clientId);
        const clientName = client ? client.name : 'General Task';
        
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
            <li class="task-item" data-task-id="${task.id}">
                <div class="task-item-left">
                    <button type="button" class="task-cycle-btn ${statusClass}" title="Click to cycle status (To Do -> In Progress -> Done)" data-action="cycle-task" data-id="${task.id}">
                        ${checkIcon}
                    </button>
                    <div>
                        <div class="deadline-title" style="${task.status === 'done' ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
                            ${escapeHtml(task.title)}
                        </div>
                        <div class="task-meta-row">
                            <span style="display:inline-flex; align-items:center; gap:4px;">${icons.user} ${escapeHtml(clientName)}</span>
                            ${task.due ? `<span style="display:inline-flex; align-items:center; gap:4px;">${icons.calendar} Due: ${task.due}</span>` : ''}
                            <span class="badge badge-${task.status === 'done' ? 'completed' : (task.status === 'in-progress' ? 'active' : 'pending')}">
                                ${task.status.replace('-', ' ')}
                            </span>
                        </div>
                    </div>
                </div>
                <div>
                    <button type="button" class="btn btn-sm btn-ghost" data-action="delete-task" data-id="${task.id}" title="Delete task" aria-label="Delete task">${icons.close}</button>
                </div>
            </li>
        `;
    }).join('');

    // Attach actions
    container.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.currentTarget.dataset.action;
            const taskId = e.currentTarget.dataset.id;
            if (action === 'cycle-task') {
                const task = store.getState().tasks.find(t => t.id === taskId);
                const willBeDone = task && task.status === 'in-progress'; // cycle: todo -> in-progress -> done

                if (willBeDone) {
                    const rect = btn.getBoundingClientRect();
                    const x = rect.left + rect.width / 2;
                    const y = rect.top + rect.height / 2;
                    triggerTaskCelebration(x, y);
                    sound.playCelebrationChime();
                    if (window.spawnNeonSparkles) {
                        window.spawnNeonSparkles(x, y, 28);
                    }
                    const taskItem = btn.closest('.task-item');
                    if (taskItem) {
                        taskItem.classList.add('task-celebrate');
                    }
                } else {
                    sound.playTap();
                }

                store.cycleTaskStatus(taskId);
            } else if (action === 'delete-task') {
                sound.playTap();
                store.deleteTask(taskId);
            }
        });
    });
}

function populateClientDropdown() {
    const select = document.getElementById('task-client-select');
    if (!select) return;
    const { clients } = store.getState();
    select.innerHTML = '<option value="">(No client / General)</option>' +
        clients.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
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
