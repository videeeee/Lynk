# Lynk: Moodboard and Visual Direction

**Direction:** Liquid glass / glassmorphism. Light, airy, soft, tactile.

## Reference images (in /moodboard)
1. `01-liquid-glass-kit.png`: a UI kit of translucent buttons, search pills, toggles, checkbox, tabs and a gradient invite card.
2. `02-glass-login-typography.png`: frosted login card and calendar card over a warm landscape, with a dark "References" card as contrast.
3. `03-glass-cards-modern-interface.png`: same layout idea; large soft circle, minimal type, dark accent card.
4. `04-component-set-dashboard.png`: component set: info card, primary action button, switch, segmented control, text field, secondary button, checkbox, compact icon tabs.
5. `05-pill-navigation.png`: pill-shaped navigation bars in light and dark variants with icon + label.

## What to take from it
- **Frosted surfaces:** translucent white, background blur, thin light border, soft shadow.
- **Shapes:** very large radii, pill-shaped buttons, inputs, tabs and nav items.
- **Colour:** pastel gradients behind glass (violet, teal, peach/pink); one strong accent (violet) for primary actions.
- **Contrast accent:** occasional dark cards or nav for emphasis.
- **Type:** minimal, clean sans-serif; big numbers, small muted labels.
- **Space:** generous padding and whitespace; few elements per card.
- **Motion:** subtle lifts on hover, soft transitions.

## Design tokens (match styles.css)
| Token | Value |
|---|---|
| Ink | #1f1d2e |
| Muted | #6b6880 |
| Violet (primary) | #7c6cf0 |
| Teal | #5fd3c4 |
| Peach | #ffc9b5 |
| Glass | rgba(255,255,255,0.45) + blur(18px) |
| Solid panel | rgba(255,255,255,0.82) |
| Radius | 24px cards, 999px pills |
| Shadow | 0 8px 30px rgba(80,60,140,0.12) |

## Components to build
Sidebar (glass), top bar with pill search, stat cards, donut + bar charts, status badges, pill buttons (primary and ghost), table panel, form panel, segmented control / tabs, toggle, checkbox, empty states.

## Rules
- Use glass for navigation, cards and buttons.
- Keep tables, forms and long text on near-opaque panels for readability.
- Never put body text on a busy or low-contrast background.
- Always provide visible focus and hover states.
- Avoid copying branded elements (e.g. the Pinterest logo) from the references; take the shape language only.
