/**
 * js/views/dashboard.js
 * Renders Overview Stats and Upcoming Deadlines.
 */

import { store } from '../state.js';
import { updateCharts } from '../components/charts.js';

export function renderDashboard(state) {
    const { clients, tasks } = state;

    // 0. Update Handcrafted SVG and CSS Charts
    updateCharts(tasks);

    // 1. Calculate Stat Numbers
    const activeClientsCount = clients.filter(c => c.status === 'active').length;
    const totalClientsCount = clients.length;
    const openTasksCount = tasks.filter(t => t.status !== 'done').length;
    const completedTasksCount = tasks.filter(t => t.status === 'done').length;

    // Check overdue tasks (due date is in past and status !== 'done')
    const today = new Date().toISOString().split('T')[0];
    const overdueTasksCount = tasks.filter(t => t.due && t.due < today && t.status !== 'done').length;

    // 2. Update Stat Cards in DOM
    const elActive = document.getElementById('stat-active-clients');
    const elTotal = document.getElementById('stat-total-clients');
    const elOpen = document.getElementById('stat-open-tasks');
    const elCompleted = document.getElementById('stat-completed-tasks');
    const elOverdue = document.getElementById('stat-overdue-tasks');

    if (elActive) elActive.textContent = activeClientsCount;
    if (elTotal) elTotal.textContent = `${totalClientsCount} total`;
    if (elOpen) elOpen.textContent = openTasksCount;
    if (elCompleted) elCompleted.textContent = completedTasksCount;
    if (elOverdue) elOverdue.textContent = overdueTasksCount;

    // 3. Render Upcoming Deadlines List
    const deadlinesList = document.getElementById('upcoming-deadlines-list');
    if (deadlinesList) {
        // Collect items that have deadlines: tasks and clients
        const items = [];

        tasks.forEach(task => {
            if (task.due && task.status !== 'done') {
                const client = clients.find(c => c.id === task.clientId);
                items.push({
                    title: task.title,
                    subtitle: client ? client.name : 'General task',
                    date: task.due,
                    type: 'task'
                });
            }
        });

        clients.forEach(client => {
            if (client.deadline && client.status !== 'completed') {
                items.push({
                    title: `${client.name} — Target Delivery`,
                    subtitle: 'Client project deadline',
                    date: client.deadline,
                    type: 'client'
                });
            }
        });

        // Sort ascending by date
        items.sort((a, b) => a.date.localeCompare(b.date));

        const nearest = items.slice(0, 5);

        if (nearest.length === 0) {
            deadlinesList.innerHTML = `<li class="text-muted" style="padding: 12px 0;">No pending deadlines scheduled.</li>`;
        } else {
            deadlinesList.innerHTML = nearest.map(item => {
                const isOverdue = item.date < today;
                return `
                    <li class="deadline-item">
                        <div class="deadline-item-info">
                            <span class="deadline-title">${escapeHtml(item.title)}</span>
                            <span class="deadline-date">${escapeHtml(item.subtitle)}</span>
                        </div>
                        <span class="badge ${isOverdue ? 'badge-overdue' : 'badge-pending'}">
                            ${item.date}
                        </span>
                    </li>
                `;
            }).join('');
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
