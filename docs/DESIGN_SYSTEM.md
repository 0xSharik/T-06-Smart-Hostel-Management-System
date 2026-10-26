# Interface Design Notes

## Direction

Use the supplied campus-access screenshots as visual direction: clear campus identity, restrained crimson and navy, explicit role context, readable light and dark modes, and compact utility navigation. The hostel product keeps its own language and workflows rather than copying the reference product's labels or content. The public homepage now leads with a visitor-pass lifecycle, then explains the room, maintenance, mess, holiday, and role-specific workspaces. It avoids invented occupancy figures, fake testimonials, and placeholder policy links.

Claymorphism is used as a material cue: softly raised cards, a light inset edge, quiet pressed states, and touch-friendly controls. It stays subtle on data tables and high-density dashboard views so shadows do not compete with information. Role colors communicate meaning (for example, teal for warden navigation); they do not create separate product brands.

## Ten common “vibe-coded” warning signs and our design choices

These are subjective review heuristics, not proof that a site was generated. Recent design critiques commonly call out interchangeable gradients, ornamental glow, repeated cards, generic copy, fabricated trust signals, and poor interaction/accessibility follow-through. [InterfaceKit](https://blog.interfacekit.io/what-makes-a-website-look-ai-generated) also cautions that any one pattern alone is not reliable evidence.

| Warning sign | Choice in this project |
| --- | --- |
| 1. Interchangeable purple/blue gradient identity | Campus crimson and navy form the shared product palette. |
| 2. Glowing blobs and gradient-filled headlines | The hero uses a restrained warm tint and solid text color. |
| 3. Frosted glass used on every surface | Opaque surfaces preserve contrast and keep data stable. |
| 4. Identical cards repeated for every kind of content | Landing feature cards are limited; dashboards retain tables, queues, maps, and status views. |
| 5. Decorative icon tiles that add no meaning | Icons label familiar hostel tasks and are paired with text. |
| 6. Made-up testimonials, metrics, or customer logos | The landing page does not claim user outcomes or adoption without evidence. |
| 7. Generic buzzwords in place of real tasks | Copy names rooms, visitor passes, maintenance, mess, and leave workflows. |
| 8. Hover motion and animation for decoration | Motion is restrained, supports feedback, and honors reduced-motion preferences. |
| 9. Desktop-first spacing and tiny touch targets | Layouts collapse at phone widths; actions and navigation remain touch friendly. |
| 10. Visual polish without keyboard, contrast, or state feedback | Focus indicators, explicit labels, and clear active states remain part of the system. |

## Theme tokens

- Primary background: cool near-white; secondary surface: pale blue-gray.
- Main text: navy-charcoal; secondary text: slate.
- Brand action: crimson. Warden accent: teal. Status colors remain semantic.
- Clay surfaces: low-contrast paired shadows and subtle inset highlights; avoid deep bevels and large glow shadows.
- Dark mode: navy surfaces with contrast-checked text and the same role semantics.

## Responsive checkpoints

- 900 px: feature columns reduce and hero compresses.
- 640 px: landing hero stacks, feature cards become one column, role choices become horizontal rows.
- 768 px: application navigation becomes an off-canvas menu, page headers wrap, tables scroll inside their own frame, and dialogs fit the viewport.
- 420 px: header controls and pagination tighten without shrinking body text.

Before public release, review each authenticated role on a narrow phone viewport and verify real loading, empty, success, and error states with live API data.
