/**
 * js/components/clientForm.js
 * Dynamic Client Form Generator & Modal Controller.
 * Reads the active workspace schema and renders the form fields dynamically.
 */

import { store } from '../state.js';

let isEditing = false;
let editingClientId = null;

export function initClientFormModal() {
    const modal = document.getElementById('client-modal');
    const openBtn = document.getElementById('open-new-client-btn');
    const secondaryAddBtn = document.getElementById('clients-view-add-btn');
    const emptyAddBtn = document.getElementById('empty-add-client-btn');
    const closeBtn = document.getElementById('client-modal-close');
    const cancelBtn = document.getElementById('client-form-cancel');
    const form = document.getElementById('dynamic-client-form');

    // Open modal for NEW client
    const openForNew = () => {
        isEditing = false;
        editingClientId = null;
        document.getElementById('client-modal-title').textContent = 'New Client';
        document.getElementById('client-form-submit').textContent = 'Save Client';
        form.reset();
        document.getElementById('client-id-field').value = '';
        clearErrors();
        renderDynamicFields();
        modal.showModal();
    };

    if (openBtn) openBtn.addEventListener('click', openForNew);
    if (secondaryAddBtn) secondaryAddBtn.addEventListener('click', openForNew);
    if (emptyAddBtn) emptyAddBtn.addEventListener('click', openForNew);

    if (closeBtn) closeBtn.addEventListener('click', () => modal.close());
    if (cancelBtn) cancelBtn.addEventListener('click', () => modal.close());

    // Listen for EDIT event triggered from clients table
    window.addEventListener('edit-client', (e) => {
        const clientId = e.detail.clientId;
        openForEdit(clientId);
    });

    // Form submission
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFormSubmit(form, modal);
        });
    }
}

export function openForEdit(clientId) {
    const modal = document.getElementById('client-modal');
    const form = document.getElementById('dynamic-client-form');
    const state = store.getState();
    const client = state.clients.find(c => c.id === clientId);

    if (!client) return;

    isEditing = true;
    editingClientId = clientId;
    document.getElementById('client-modal-title').textContent = `Edit ${client.name}`;
    document.getElementById('client-form-submit').textContent = 'Update Client';
    clearErrors();

    // Fill Core Fields
    document.getElementById('client-id-field').value = client.id;
    document.getElementById('core-client-name').value = client.name;
    document.getElementById('core-client-status').value = client.status;
    document.getElementById('core-client-deadline').value = client.deadline || '';

    // Render Dynamic Fields with prefilled values
    renderDynamicFields(client.extra || {});

    modal.showModal();
}

/**
 * Dynamically builds form HTML inputs based on the current workspace schema.
 */
export function renderDynamicFields(prefillValues = {}) {
    const container = document.getElementById('dynamic-form-fields-container');
    if (!container) return;

    const state = store.getState();
    const activeWorkspace = state.workspaces[state.currentWorkspace];
    const fields = activeWorkspace ? activeWorkspace.fields : [];

    if (fields.length === 0) {
        container.innerHTML = `
            <div class="full-width text-muted" style="font-size: 0.85rem; padding: 8px 0;">
                No custom fields defined for this workspace persona. Add fields in Settings.
            </div>
        `;
        return;
    }

    container.innerHTML = fields.map(field => {
        const val = prefillValues[field.key] !== undefined ? prefillValues[field.key] : '';
        const isFull = field.type === 'textarea';

        return `
            <div class="field-group ${isFull ? 'full-width' : ''}">
                <label for="dyn-field-${field.key}">${escapeHtml(field.label)}</label>
                ${renderInputByType(field, val)}
            </div>
        `;
    }).join('');
}

function renderInputByType(field, value) {
    const safeVal = escapeHtml(String(value));
    const id = `dyn-field-${field.key}`;
    const name = `extra_${field.key}`;

    switch (field.type) {
        case 'textarea':
            return `<textarea id="${id}" name="${name}" rows="3" placeholder="Enter ${escapeHtml(field.label)}...">${safeVal}</textarea>`;
        case 'number':
            return `<input type="number" id="${id}" name="${name}" value="${safeVal}" placeholder="0">`;
        case 'date':
            return `<input type="date" id="${id}" name="${name}" value="${safeVal}">`;
        case 'email':
            return `<input type="email" id="${id}" name="${name}" value="${safeVal}" placeholder="name@domain.com">`;
        case 'url':
            return `<input type="url" id="${id}" name="${name}" value="${safeVal}" placeholder="https://...">`;
        case 'text':
        default:
            return `<input type="text" id="${id}" name="${name}" value="${safeVal}" placeholder="Enter ${escapeHtml(field.label)}...">`;
    }
}

function handleFormSubmit(form, modal) {
    const formData = new FormData(form);
    const name = (formData.get('name') || '').trim();
    const status = formData.get('status') || 'active';
    const deadline = formData.get('deadline') || '';

    // Validation
    const nameError = document.getElementById('error-client-name');
    if (!name) {
        if (nameError) nameError.textContent = 'Please enter a client name.';
        document.getElementById('core-client-name').focus();
        return;
    }

    // Collect extra custom fields
    const extra = {};
    for (const [key, val] of formData.entries()) {
        if (key.startsWith('extra_')) {
            const fieldKey = key.replace('extra_', '');
            extra[fieldKey] = val.trim();
        }
    }

    if (isEditing && editingClientId) {
        store.updateClient(editingClientId, { name, status, deadline, extra });
    } else {
        store.addClient({ name, status, deadline, extra });
    }

    modal.close();
    form.reset();
}

function clearErrors() {
    const nameError = document.getElementById('error-client-name');
    if (nameError) nameError.textContent = '';
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
