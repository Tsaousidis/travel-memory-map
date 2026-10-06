# Design system

The home route temporarily displays the component preview. It is a development
showcase, not a trips page. No preview action saves data or calls a service.

## Foundations

Tokens live in `src/app/globals.css`: warm paper background, white surfaces,
forest accent, dark ink, sage fills, muted text, borders, and danger color.
This first system is deliberately light-themed. Georgia headings and Arial body
text use system fonts with no font downloads. Heading sizes scale with viewport
width. Use the Tailwind spacing scale, usually 4, 8, 16, 24, 32, and 48 pixels.

Shared classes live in the components layer so Tailwind utilities can override
layout when necessary. Keep colors in tokens instead of duplicating hex values.

## Components

| Component | Contract |
| --- | --- |
| `Container` | Fluid gutters, centered content, maximum width of 76rem |
| `Card` | Neutral bordered surface; caller provides headings and semantics |
| `Button` | Primary, secondary, ghost, danger; native props; defaults to type button |
| `Input` | Required label, automatic stable ID, optional hint/error, native props |
| `Modal` | Controlled open/onClose, required title, optional description, children |
| `LoadingState` | Text status announcement with decorative spinner |
| `Skeleton` | Decorative placeholder hidden from assistive technology |
| `EmptyState` | Title, explanation, optional action slot; uses an h3 heading |

Import components directly from their module. Inputs and modals are client
components; basic presentation remains server-compatible. A loading button is
disabled and marks itself busy; supply meaningful child text such as `Saving…`.
Use links for navigation, buttons for actions. Form buttons must use type submit.

## Interaction and accessibility

Controls have visible keyboard focus and a minimum 44px height. Inputs connect
labels, hints, and errors through IDs. Error text supplements the red border.
The preview includes a skip link and responsive single/two-column sections.

The modal uses native `dialog.showModal()` for the browser's modal focus and
inert background behavior. Escape and the close button request `onClose`; the
parent must set `open` to false. Opening focuses the first control (Close).
Closing restores the trigger and body scroll. Backdrop clicks do not dismiss.
Only one modal should be open at a time. Keep it mounted and control visibility
with `open`; do not manipulate its DOM directly or use method=dialog forms.

Animations and transitions stop when reduced motion is requested. Loading states
retain text without relying on animation. Skeletons need a nearby status label.

Reference: [W3C native modal dialog technique](https://www.w3.org/WAI/WCAG22/Techniques/html/H102).
