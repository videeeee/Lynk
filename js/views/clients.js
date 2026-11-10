/**
 * js/views/clients.js
 * Renders Clients Table, Filter Pills, Status Cycle, and Search.
 */

import { store } from '../state.js';
import { icons } from '../components/icons.js';

let activeFilter = 'all';
let searchQuery = '';

export function initClientsView() {
    // 1. Setup Status Filter Pills
    const filterPills = document.querySelectorAll('.pill-filter');
    filterPills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            filterPills.forEach(p => p.classList.remove('active'));
            e.currentTarget.classList.add('active');
            activeFilter = e.currentTarget.dataset.status;
            renderClients(store.getState());
        });
    });

    // 2. Setup Clients Search Bar
    const searchInput = document.getElementById('clients-table-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderClients(store.getState());
        });
    }

    // 3. Global Search in Topbar sync
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
        globalSearch.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            if (searchInput) searchInput.value = e.target.value;
            renderClients(store.getState());
        });
    }
}

export function renderClients(state) {
    const tableBody = document.getElementById('clients-table-body');
    const emptyState = document.getElementById('clients-empty-state');
    const table = document.getElementById('clients-table');
    if (!tableBody) return;

    let filtered = state.clients.filter(client => {
        // Status filter
        if (activeFilter !== 'all' && client.status !== activeFilter) {
            return false;
        }

        // Search query filter (search across name, deadline, and all extra custom fields)
        if (searchQuery) {
            const nameMatch = client.name.toLowerCase().includes(searchQuery);
            const deadlineMatch = (client.deadline || '').toLowerCase().includes(searchQuery);
            const extrasMatch = Object.values(client.extra || {}).some(val => 
                String(val).toLowerCase().includes(searchQuery)
            );
            return nameMatch || deadlineMatch || extrasMatch;
        }

        return true;
    });

    if (filtered.length === 0) {
        tableBody.innerHTML = '';
        if (table) table.hidden = true;
        if (emptyState) emptyState.hidden = false;
        return;
    }

    if (table) table.hidden = false;
    if (emptyState) emptyState.hidden = true;

    tableBody.innerHTML = filtered.map(client => {
        // Extra custom fields badges
        const extrasHtml = Object.entries(client.extra || {})
            .filter(([_, val]) => val && String(val).trim() !== '')
            .map(([key, val]) => `<span class="extra-tag"><strong>${escapeHtml(key)}:</strong> ${escapeHtml(String(val))}</span>`)
            .join(' ');

        return `
            <tr data-client-id="${client.id}">
                <td class="client-name-cell">
                    <button type="button" class="btn btn-sm btn-ghost" data-action="view-client" data-id="${client.id}" style="font-weight: 700; color: var(--color-ink); padding: 4px 8px; margin-left: -8px; gap: 6px;">
                        ${escapeHtml(client.name)} <span style="display:inline-flex; color: var(--color-violet);">${icons.externalLink}</span>
                    </button>
                </td>
                <td>
                    <button type="button" class="badge badge-${client.status} badge-clickable" title="Click to cycle status" data-action="cycle-status" data-id="${client.id}">
                        ${client.status}
                    </button>
                </td>
                <td>${client.deadline || '<span class="text-muted">None</span>'}</td>
                <td>
                    <div class="client-extras-list">${extrasHtml || '<span class="text-muted">—</span>'}</div>
                </td>
                <td class="text-right">
                    <div class="action-buttons-group">
                        <button type="button" class="btn btn-sm btn-secondary" data-action="edit-client" data-id="${client.id}">Edit</button>
                        <button type="button" class="btn btn-sm btn-danger" data-action="delete-client" data-id="${client.id}">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Attach Event Delegation for Table Actions
    tableBody.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', handleTableAction);
    });
}

function handleTableAction(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const clientId = btn.dataset.id;

    if (action === 'view-client') {
        window.dispatchEvent(new CustomEvent('view-client-details', { detail: { clientId } }));
    } else if (action === 'cycle-status') {
        store.cycleClientStatus(clientId);
    } else if (action === 'delete-client') {
        if (confirm('Are you sure you want to delete this client?')) {
            store.deleteClient(clientId);
        }
    } else if (action === 'edit-client') {
        // Triggers the edit client modal (handled in Milestone D)
        window.dispatchEvent(new CustomEvent('edit-client', { detail: { clientId } }));
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
