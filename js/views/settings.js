/**
 * js/views/settings.js
 * Handles Workspace Picker, Reset Demo Data, and delegates to Form Builder.
 */

import { store } from '../state.js';
import { initFormBuilder, renderFormBuilder } from '../components/formBuilder.js';

export function initSettingsView() {
    initFormBuilder();

    // 1. Workspace Preset Radio Change
    const picker = document.getElementById('workspace-picker-container');
    if (picker) {
        picker.addEventListener('change', (e) => {
            if (e.target.name === 'workspace-preset') {
                const selectedKey = e.target.value;
                store.setWorkspace(selectedKey);
            }
        });
    }

    // 2. Export Clients to CSV
    const exportCsvBtn = document.getElementById('export-csv-btn');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', handleExportCSV);
    }

    // 3. Export Full Backup to JSON
    const exportJsonBtn = document.getElementById('export-json-btn');
    if (exportJsonBtn) {
        exportJsonBtn.addEventListener('click', handleExportJSON);
    }

    // 4. Import / Restore from JSON
    const importInput = document.getElementById('import-json-input');
    if (importInput) {
        importInput.addEventListener('change', handleImportJSON);
    }

    // 5. Reset Demo Data
    const resetBtn = document.getElementById('reset-demo-data-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Reset Lynk back to sample demo data? Any custom clients will be restored to default.')) {
                store.resetDemoData();
            }
        });
    }

    // 6. Clear All Data
    const clearBtn = document.getElementById('clear-all-data-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete ALL clients, tasks, and documents? This cannot be undone.')) {
                store.clearAllData();
            }
        });
    }
}

/**
 * Exports clients data to CSV format and triggers a browser download.
 */
function handleExportCSV() {
    const { clients, workspaces, currentWorkspace } = store.getState();
    if (clients.length === 0) {
        alert('No clients available to export.');
        return;
    }

    // Collect all field columns: Core fields + Workspace custom fields
    const currentFields = workspaces[currentWorkspace]?.fields || [];
    const customKeys = currentFields.map(f => f.key);

    const headers = ['Client Name', 'Status', 'Target Deadline', ...currentFields.map(f => f.label)];

    const rows = clients.map(c => {
        const row = [
            c.name,
            c.status,
            c.deadline || '',
            ...customKeys.map(k => (c.extra && c.extra[k]) ? c.extra[k] : '')
        ];
        return row.map(escapeCsvValue).join(',');
    });

    const csvContent = [headers.map(escapeCsvValue).join(','), ...rows].join('\r\n');
    downloadBlob(csvContent, 'lynk-clients.csv', 'text/csv;charset=utf-8;');
}

/**
 * Exports complete store snapshot to a downloadable JSON file.
 */
function handleExportJSON() {
    const state = store.getState();
    const jsonStr = JSON.stringify(state, null, 2);
    downloadBlob(jsonStr, `lynk-backup-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
}

/**
 * Restores state from an uploaded JSON file.
 */
function handleImportJSON(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const parsed = JSON.parse(event.target.result);
            store.restoreState(parsed);
            alert('Workspace backup restored successfully!');
            e.target.value = ''; // Reset input
        } catch (err) {
            alert('Failed to parse backup file: ' + err.message);
        }
    };
    reader.readAsText(file);
}

/**
 * Triggers a client-side file download without a server.
 * Uses Blob ObjectURL with fallback for all browser environments.
 */
function downloadBlob(content, filename, mimeType) {
    try {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            if (document.body.contains(link)) {
                document.body.removeChild(link);
            }
            URL.revokeObjectURL(url);
        }, 1500);
    } catch (e) {
        // Fallback for strict browser sandboxes: Data URI
        const encodedUri = encodeURI(`data:${mimeType},${content}`);
        const link = document.createElement('a');
        link.href = encodedUri;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => document.body.removeChild(link), 500);
    }
}

function escapeCsvValue(val) {
    const str = String(val ?? '');
    // If the value contains comma, quotes, or newlines, wrap in quotes and escape internal quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

export function renderSettings(state) {
    // Sync active workspace radio button
    const currentWorkspace = state.currentWorkspace;
    const radio = document.querySelector(`input[name="workspace-preset"][value="${currentWorkspace}"]`);
    if (radio) {
        radio.checked = true;
    }

    // Sync sidebar badge
    const badge = document.getElementById('current-workspace-badge');
    if (badge && state.workspaces[currentWorkspace]) {
        badge.textContent = state.workspaces[currentWorkspace].label;
    }

    // Render Schema Fields in Form Builder
    renderFormBuilder(state);
}
