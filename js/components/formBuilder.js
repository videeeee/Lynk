/**
 * js/components/formBuilder.js
 * Schema Form Builder Editor in Settings.
 * Allows adding, renaming, retyping, and removing custom fields from any workspace persona.
 */

import { store } from '../state.js';
import { icons } from './icons.js';

export function initFormBuilder() {
    const addFieldBtn = document.getElementById('add-field-schema-btn');
    if (addFieldBtn) {
        addFieldBtn.addEventListener('click', handleAddNewField);
    }
}

export function renderFormBuilder(state) {
    const container = document.getElementById('schema-fields-container');
    if (!container) return;

    const currentWorkspaceKey = state.currentWorkspace;
    const workspace = state.workspaces[currentWorkspaceKey];
    const fields = workspace ? workspace.fields : [];

    if (fields.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 24px;">
                <p>No custom fields configured for <strong>${workspace ? workspace.label : 'this persona'}</strong>. Click "+ Add Field" above to create one.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = fields.map((field, index) => {
        return `
            <div class="schema-field-row" data-index="${index}">
                <div>
                    <label class="visually-hidden" for="field-label-${index}">Field Label</label>
                    <input type="text" id="field-label-${index}" class="schema-field-label" value="${escapeHtml(field.label)}" placeholder="Field Label (e.g. Budget)">
                </div>

                <div>
                    <label class="visually-hidden" for="field-type-${index}">Field Type</label>
                    <select id="field-type-${index}" class="schema-field-type">
                        <option value="text" ${field.type === 'text' ? 'selected' : ''}>Text</option>
                        <option value="number" ${field.type === 'number' ? 'selected' : ''}>Number</option>
                        <option value="date" ${field.type === 'date' ? 'selected' : ''}>Date</option>
                        <option value="email" ${field.type === 'email' ? 'selected' : ''}>Email</option>
                        <option value="url" ${field.type === 'url' ? 'selected' : ''}>URL Link</option>
                        <option value="textarea" ${field.type === 'textarea' ? 'selected' : ''}>Long Text</option>
                    </select>
                </div>

                <div>
                    <button type="button" class="btn btn-sm btn-ghost" data-action="remove-schema-field" data-index="${index}" title="Remove Field" style="gap:4px;">
                        ${icons.close} Remove
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Attach Change Listeners for Labels and Types
    container.querySelectorAll('.schema-field-row').forEach(row => {
        const index = parseInt(row.dataset.index, 10);
        const labelInput = row.querySelector('.schema-field-label');
        const typeSelect = row.querySelector('.schema-field-type');
        const removeBtn = row.querySelector('[data-action="remove-schema-field"]');

        labelInput.addEventListener('change', (e) => {
            const newLabel = e.target.value.trim() || 'Untitled Field';
            updateFieldAt(index, { label: newLabel });
        });

        typeSelect.addEventListener('change', (e) => {
            updateFieldAt(index, { type: e.target.value });
        });

        removeBtn.addEventListener('click', () => {
            removeFieldAt(index);
        });
    });
}

function handleAddNewField() {
    const state = store.getState();
    const currentWorkspaceKey = state.currentWorkspace;
    const currentFields = [...(state.workspaces[currentWorkspaceKey]?.fields || [])];

    const newKey = 'custom_' + Date.now().toString(36);
    currentFields.push({
        key: newKey,
        label: 'New Custom Field',
        type: 'text'
    });

    store.updateWorkspaceFields(currentWorkspaceKey, currentFields);
}

function updateFieldAt(index, updates) {
    const state = store.getState();
    const currentWorkspaceKey = state.currentWorkspace;
    const fields = [...state.workspaces[currentWorkspaceKey].fields];

    if (fields[index]) {
        fields[index] = { ...fields[index], ...updates };
        store.updateWorkspaceFields(currentWorkspaceKey, fields);
    }
}

function removeFieldAt(index) {
    const state = store.getState();
    const currentWorkspaceKey = state.currentWorkspace;
    const fields = state.workspaces[currentWorkspaceKey].fields.filter((_, i) => i !== index);

    store.updateWorkspaceFields(currentWorkspaceKey, fields);
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
