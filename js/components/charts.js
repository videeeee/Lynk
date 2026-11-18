/**
 * js/components/charts.js
 * Futuristic Multi-Segment Neon Donut Chart & Glowing Status Bars.
 * Inspired by high-end liquid crystal HUDs (VisionOS / Sci-Fi Glass UI).
 * Pure SVG vector math, dynamic glowing drop-shadows, and interactive slice inspection.
 */

import { sound } from './sound.js';

export function updateCharts(tasks) {
    renderMultiSegmentDonut(tasks);
    renderStatusBars(tasks);
}

/**
 * Renders a multi-colored glowing SVG Donut chart with interactive slice inspection.
 */
function renderMultiSegmentDonut(tasks) {
    const container = document.getElementById('donut-chart-container');
    const percentLabel = document.getElementById('donut-center-percent');
    const badge = document.getElementById('completion-rate-badge');
    if (!container) return;

    const total = tasks.length;
    const doneTasks = tasks.filter(t => t.status === 'done');
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
    const todoTasks = tasks.filter(t => t.status === 'todo');

    const doneCount = doneTasks.length;
    const inProgressCount = inProgressTasks.length;
    const todoCount = todoTasks.length;

    const overallPct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

    // Update center label & badge
    if (percentLabel) percentLabel.textContent = `${overallPct}%`;
    if (badge) badge.textContent = `${overallPct}% Delivered`;

    // SVG Geometry
    const size = 170;
    const strokeWidth = 18;
    const radius = (size - strokeWidth) / 2; // 76px
    const circumference = 2 * Math.PI * radius; // ~477.52px

    // Segment definitions matching reference image
    const segments = [
        { key: 'done', label: 'Delivered', count: doneCount, color: '#00f0ff', glow: 'rgba(0, 240, 255, 0.65)' },
        { key: 'in-progress', label: 'In Progress', count: inProgressCount, color: '#ff007f', glow: 'rgba(255, 0, 127, 0.65)' },
        { key: 'todo', label: 'To Do', count: todoCount, color: '#0077ff', glow: 'rgba(0, 119, 255, 0.65)' }
    ];

    let currentOffset = 0;
    const renderedArcs = segments.map(seg => {
        const segPct = total === 0 ? 0 : seg.count / total;
        const arcLength = segPct * circumference;
        const gap = total > 1 && seg.count > 0 ? 4 : 0; // Small crystal gap between segments
        const adjustedLength = Math.max(0, arcLength - gap);
        const dashArray = `${adjustedLength} ${circumference - adjustedLength}`;
        const dashOffset = -currentOffset;
        currentOffset += arcLength;

        return `
            <circle
                class="donut-segment"
                data-key="${seg.key}"
                data-label="${seg.label}"
                data-count="${seg.count}"
                data-pct="${Math.round(segPct * 100)}"
                data-color="${seg.color}"
                cx="${size / 2}"
                cy="${size / 2}"
                r="${radius}"
                fill="none"
                stroke="${seg.color}"
                stroke-width="${strokeWidth}"
                stroke-dasharray="${dashArray}"
                stroke-dashoffset="${dashOffset}"
                style="filter: drop-shadow(0 0 6px ${seg.glow}); transition: stroke-width 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.25s ease, filter 0.25s ease; cursor: pointer;"
            />
        `;
    }).join('');

    container.innerHTML = `
        <svg viewBox="0 0 ${size} ${size}" width="100%" height="100%" style="transform: rotate(-90deg); display: block;">
            <defs>
                <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            <!-- Background Crystal Groove Track -->
            <circle
                cx="${size / 2}"
                cy="${size / 2}"
                r="${radius}"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                stroke-width="${strokeWidth}"
            />
            <!-- Glowing Colored Arcs -->
            ${renderedArcs}
        </svg>
    `;

    // Interactive Hover State on Donut Segments
    const segmentEls = container.querySelectorAll('.donut-segment');
    segmentEls.forEach(seg => {
        seg.addEventListener('mouseenter', () => {
            sound.playHover();
            const label = seg.getAttribute('data-label');
            const pct = seg.getAttribute('data-pct');
            const color = seg.getAttribute('data-color');

            seg.style.strokeWidth = `${strokeWidth + 6}px`;

            if (percentLabel) {
                percentLabel.textContent = `${pct}%`;
                percentLabel.style.color = color;
                percentLabel.style.textShadow = `0 0 16px ${color}`;
            }

            const centerSub = document.querySelector('.donut-label');
            if (centerSub) {
                centerSub.textContent = label;
                centerSub.style.color = color;
            }
        });

        seg.addEventListener('mouseleave', () => {
            seg.style.strokeWidth = `${strokeWidth}px`;

            if (percentLabel) {
                percentLabel.textContent = `${overallPct}%`;
                percentLabel.style.color = '';
                percentLabel.style.textShadow = '';
            }

            const centerSub = document.querySelector('.donut-label');
            if (centerSub) {
                centerSub.textContent = 'Completed';
                centerSub.style.color = '';
            }
        });
    });
}

/**
 * Updates the Tasks-by-Status Progress Bars and numerical counters.
 */
function renderStatusBars(tasks) {
    const total = tasks.length;

    const todoCount = tasks.filter(t => t.status === 'todo').length;
    const inprogressCount = tasks.filter(t => t.status === 'in-progress').length;
    const doneCount = tasks.filter(t => t.status === 'done').length;

    const todoPct = total === 0 ? 0 : Math.round((todoCount / total) * 100);
    const inprogressPct = total === 0 ? 0 : Math.round((inprogressCount / total) * 100);
    const donePct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

    const elTodoCount = document.getElementById('bar-todo-count');
    const elInprogressCount = document.getElementById('bar-inprogress-count');
    const elDoneCount = document.getElementById('bar-done-count');

    if (elTodoCount) elTodoCount.textContent = `${todoCount} (${todoPct}%)`;
    if (elInprogressCount) elInprogressCount.textContent = `${inprogressCount} (${inprogressPct}%)`;
    if (elDoneCount) elDoneCount.textContent = `${doneCount} (${donePct}%)`;

    const fillTodo = document.getElementById('bar-todo-fill');
    const fillInprogress = document.getElementById('bar-inprogress-fill');
    const fillDone = document.getElementById('bar-done-fill');

    if (fillTodo) fillTodo.style.width = `${todoPct}%`;
    if (fillInprogress) fillInprogress.style.width = `${inprogressPct}%`;
    if (fillDone) fillDone.style.width = `${donePct}%`;
}
