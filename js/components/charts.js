/**
 * js/components/charts.js
 * Handcrafted SVG Donut Chart and CSS Tasks-by-Status Progress Bars.
 * Zero external libraries: pure vector mathematics and standard CSS transitions.
 */

/**
 * Updates both the SVG Donut chart and the status bars using current tasks data.
 * @param {Array} tasks - Array of task objects from state.
 */
export function updateCharts(tasks) {
    renderCompletionDonut(tasks);
    renderStatusBars(tasks);
}

/**
 * Renders an SVG Donut Chart showing Completed vs Incomplete deliverables.
 */
function renderCompletionDonut(tasks) {
    const container = document.getElementById('donut-chart-container');
    const percentLabel = document.getElementById('donut-center-percent');
    const badge = document.getElementById('completion-rate-badge');
    if (!container) return;

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    // Update center label & badge
    if (percentLabel) percentLabel.textContent = `${percentage}%`;
    if (badge) badge.textContent = `${percentage}% Done`;

    // SVG Circle Geometry Parameters
    const size = 160;
    const strokeWidth = 16;
    const radius = (size - strokeWidth) / 2; // 72px
    const circumference = 2 * Math.PI * radius; // ~452.389px

    // Calculate how much stroke to offset based on percentage
    const strokeDashoffset = circumference - (circumference * percentage) / 100;

    // Build the SVG element with a background track circle and animated progress circle
    container.innerHTML = `
        <svg viewBox="0 0 ${size} ${size}" width="100%" height="100%" style="transform: rotate(-90deg); display: block;">
            <!-- Background Track Circle -->
            <circle
                cx="${size / 2}"
                cy="${size / 2}"
                r="${radius}"
                fill="none"
                stroke="rgba(160, 150, 180, 0.18)"
                stroke-width="${strokeWidth}"
            />
            <!-- Active Teal Completion Progress Arc -->
            <circle
                cx="${size / 2}"
                cy="${size / 2}"
                r="${radius}"
                fill="none"
                stroke="var(--color-teal)"
                stroke-width="${strokeWidth}"
                stroke-linecap="round"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${strokeDashoffset}"
                style="transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);"
            />
        </svg>
    `;
}

/**
 * Updates the Tasks-by-Status Progress Bars and numerical counters.
 */
function renderStatusBars(tasks) {
    const total = tasks.length;

    const todoCount = tasks.filter(t => t.status === 'todo').length;
    const inprogressCount = tasks.filter(t => t.status === 'in-progress').length;
    const doneCount = tasks.filter(t => t.status === 'done').length;

    // Calculate percentages (relative to total tasks)
    const todoPct = total === 0 ? 0 : Math.round((todoCount / total) * 100);
    const inprogressPct = total === 0 ? 0 : Math.round((inprogressCount / total) * 100);
    const donePct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

    // Update Numerical Counts
    const elTodoCount = document.getElementById('bar-todo-count');
    const elInprogressCount = document.getElementById('bar-inprogress-count');
    const elDoneCount = document.getElementById('bar-done-count');

    if (elTodoCount) elTodoCount.textContent = `${todoCount} (${todoPct}%)`;
    if (elInprogressCount) elInprogressCount.textContent = `${inprogressCount} (${inprogressPct}%)`;
    if (elDoneCount) elDoneCount.textContent = `${doneCount} (${donePct}%)`;

    // Update Progress Bar Fill Widths
    const fillTodo = document.getElementById('bar-todo-fill');
    const fillInprogress = document.getElementById('bar-inprogress-fill');
    const fillDone = document.getElementById('bar-done-fill');

    if (fillTodo) fillTodo.style.width = `${todoPct}%`;
    if (fillInprogress) fillInprogress.style.width = `${inprogressPct}%`;
    if (fillDone) fillDone.style.width = `${donePct}%`;
}
