/**
 * js/app.js
 * Application Entry Point & Client-side View Router.
 * Connects State Store to all Views and manages view navigation.
 */

import { store } from './state.js';
import { renderDashboard } from './views/dashboard.js';
import { initClientsView, renderClients } from './views/clients.js';
import { initTasksView, renderTasks } from './views/tasks.js';
import { initDocumentsView, renderDocuments } from './views/documents.js';
import { initSettingsView, renderSettings } from './views/settings.js';
import { initClientFormModal } from './components/clientForm.js';
import { initClientDrawer, updateDrawerIfOpen } from './components/clientDrawer.js';
import { initTheme } from './components/theme.js';
import { initLiquidGlassEffects } from './components/glassTilt.js';

// Active View State
let currentView = 'dashboard';

function initRouter() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetView = e.currentTarget.dataset.view;
            if (targetView) {
                switchView(targetView);
            }
        });
    });

    // Handle initial hash in URL if present (e.g. #clients)
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && ['dashboard', 'clients', 'tasks', 'documents', 'settings'].includes(initialHash)) {
        switchView(initialHash);
    }
}

export function switchView(viewName) {
    currentView = viewName;

    // 1. Update Navigation Pill active state
    document.querySelectorAll('.nav-item').forEach(btn => {
        const isActive = btn.dataset.view === viewName;
        btn.classList.toggle('active', isActive);
        if (isActive) {
            btn.setAttribute('aria-current', 'page');
        } else {
            btn.removeAttribute('aria-current');
        }
    });

    // 2. Hide all view sections and show the target view
    document.querySelectorAll('.view').forEach(section => {
        if (section.id === `view-${viewName}`) {
            section.hidden = false;
            section.classList.add('active-view');
        } else {
            section.hidden = true;
            section.classList.remove('active-view');
        }
    });

    // 3. Update URL hash cleanly without reload
    window.history.replaceState(null, '', `#${viewName}`);
}

// Master Render Function: called whenever state updates in store
function renderApp(state) {
    renderDashboard(state);
    renderClients(state);
    renderTasks(state);
    renderDocuments(state);
    renderSettings(state);
    updateDrawerIfOpen(state);
    initLiquidGlassEffects();
}

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize view listeners
    initRouter();
    initClientsView();
    initTasksView();
    initDocumentsView();
    initSettingsView();
    initClientFormModal();
    initClientDrawer();
    initTheme();
    initLiquidGlassEffects();

    // 2. Subscribe render loop to central state store
    store.subscribe((newState) => {
        renderApp(newState);
    });

    // 3. First initial render
    renderApp(store.getState());

    console.log('[Lynk] Application initialized successfully.');
});
