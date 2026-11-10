/**
 * js/views/documents.js
 * Renders Documents Grid, External Links, Add & Delete.
 */

import { store } from '../state.js';
import { icons } from '../components/icons.js';

export function initDocumentsView() {
    const modal = document.getElementById('doc-modal');
    const openBtn = document.getElementById('open-new-doc-btn');
    const closeBtn = document.getElementById('doc-modal-close');
    const cancelBtn = document.getElementById('doc-form-cancel');
    const docForm = document.getElementById('doc-form');

    if (openBtn && modal) {
        openBtn.addEventListener('click', () => {
            populateDocClientsDropdown();
            docForm.reset();
            modal.showModal();
        });
    }

    if (closeBtn && modal) closeBtn.addEventListener('click', () => modal.close());
    if (cancelBtn && modal) cancelBtn.addEventListener('click', () => modal.close());

    if (docForm) {
        docForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(docForm);
            const name = (formData.get('name') || '').trim();
            const clientId = formData.get('clientId') || '';
            const url = (formData.get('url') || '').trim();

            if (!name) {
                const err = document.getElementById('error-doc-name');
                if (err) err.textContent = 'Please enter a document name.';
                return;
            }

            store.addDocument({ name, clientId, url });
            modal.close();
            docForm.reset();
        });
    }
}

export function renderDocuments(state) {
    const container = document.getElementById('documents-grid-container');
    const emptyState = document.getElementById('documents-empty-state');
    if (!container) return;

    if (state.documents.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.hidden = false;
        return;
    }

    if (emptyState) emptyState.hidden = true;

    container.innerHTML = state.documents.map(doc => {
        const client = state.clients.find(c => c.id === doc.clientId);
        const clientName = client ? client.name : 'General Document';

        return `
            <div class="doc-card" data-doc-id="${doc.id}">
                <div class="doc-header">
                    <span class="doc-icon" aria-hidden="true" style="display:inline-flex; align-items:center; color: var(--color-violet);">${icons.documents}</span>
                    <div>
                        <h4 class="doc-title">${escapeHtml(doc.name)}</h4>
                        <span class="doc-client" style="display:inline-flex; align-items:center; gap:4px; margin-top:2px;">${icons.user} ${escapeHtml(clientName)}</span>
                    </div>
                </div>

                <div class="flex-between">
                    ${doc.url ? `
                        <a href="${escapeHtml(doc.url)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-secondary" style="gap:6px;">
                            Open Link ${icons.externalLink}
                        </a>
                    ` : '<span class="text-muted" style="font-size:0.8rem">No link attached</span>'}

                    <button type="button" class="btn btn-sm btn-ghost" data-action="delete-doc" data-id="${doc.id}" title="Delete document" aria-label="Delete document">
                        ${icons.close}
                    </button>
                </div>
            </div>
        `;
    }).join('');

    container.querySelectorAll('[data-action="delete-doc"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const docId = e.currentTarget.dataset.id;
            store.deleteDocument(docId);
        });
    });
}

function populateDocClientsDropdown() {
    const select = document.getElementById('doc-client-select');
    if (!select) return;
    const { clients } = store.getState();
    select.innerHTML = '<option value="">(None)</option>' +
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
