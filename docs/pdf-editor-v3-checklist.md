# Knight Wisdom PDF Editor V3 — Feature Checklist

This document records a clean-room behavior checklist based on the publicly visible workflow of a mainstream online PDF editor: upload a file, enter a dedicated editing workspace, add and arrange content, then explicitly finish and download. It is a product checklist only; no third-party code, assets, copy, or visual design is reused.

## Delivery sequence

| Module | Scope | Current status | Priority |
| --- | --- | --- | --- |
| V3.0 | This checklist, acceptance criteria, test matrix | Complete | P0 |
| V3.1 | Editor shell, normalized state store, local file lifecycle, keyboard command model | Partial — existing editor needs a formal command store | P0 |
| V3.2 | Select/text workflow: immediate editable text box, selection handles, resize/rotate, property commits | Partial | P0 |
| V3.3 | Image/signature workflow: upload, WebP normalization, crop, transform, layer order | Partial — crop and transform controls remain | P0 |
| V3.4 | Drawing, highlighter palettes, shapes and annotation popovers | Partial — annotation metadata/palette remain | P1 |
| V3.5 | Page operations: virtualized thumbnails, rotate/delete/duplicate/reorder, history | Partial — history must cover page changes | P0 |
| V3.6 | PDF export parity: page mapping, rotated coordinates, embedded CJK font, image/drawing verification | Partial | P0 |
| V3.7 | Performance/accessibility pass and browser regression checks | Pending | P1 |

## Product behavior checklist

| Feature | Required behavior | V2 status | V3 acceptance |
| --- | --- | --- | --- |
| Upload | Click and drag/drop PDF, local-only processing, size/encryption errors | Complete | No server upload; clear recovery actions |
| Workspace | Near-full-screen editor: toolbar, thumbnails, canvas overlay, inspector, status controls, finish action | Partial | Responsive desktop/mobile workspace without route changes |
| Select | Click select, blank canvas clears, drag, resize, rotate, delete, duplicate | Partial | Handles and keyboard behavior affect only overlay objects |
| Text | Click page creates focused text box; click blank commits; double-click edits | Partial | Direct editing, wrapping, format controls, correct export |
| Fonts | English and Chinese render/export reliably | Partial | Embed licensed bundled CJK fallback; custom TTF/OTF override |
| Image | PNG/JPG/JPEG/WebP, drag, proportional/free resize, rotate, crop, opacity, layers | Partial | All transforms match export |
| Signature | Image signature now; pointer/touch signing later | Partial | Separate signature entry and export |
| Draw | Colour, width, opacity, erase/delete stroke | Partial | Pointer capture; no accidental scroll/selection |
| Highlight | Colour presets + custom colour, opacity, range adjustment | Partial | Highlight is separate from normal shapes |
| Shapes | Rectangle, circle, line, arrow; fill/stroke/dash/opacity/rotation | Partial | Preview and export match |
| Notes | Visible marker, edit/delete popover, creation time | Partial | Export readable note representation |
| Element stack | List, select, visible/locked, delete, drag/reorder, front/back/top/bottom | Partial | Current-page stack persists through history |
| Thumbnails | All page thumbnails, active state, lazy rendering, collapsible pane | Partial | Current/nearby pages render first |
| Page actions | Rotate, delete (never last page), duplicate, reorder drag/drop | Partial | Page actions are undoable and preserve export order |
| Keyboard | Delete, Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z, Cmd/Ctrl+C/V, arrows, Shift+arrows, Esc | Partial | Commands work only when text input is not active |
| Zoom | 50/75/100/125/150/200, fit width, fit page, status display | Partial | Zoom does not change stored document coordinates |
| History | Add/delete/move/resize/rotate/format/page operations | Partial | One atomic history item per finished interaction |
| Export | Explicit finish; no automatic download; result filename/size/pages; resume/restart | Partial | Re-opened output PDF remains valid |
| Coordinates | DOM ↔ viewport ↔ source page ↔ PDF; 0/90/180/270 rotation | Partial | Visual position agrees with output at all zoom levels |
| Performance | On-demand main page render, lazy thumbnails, no PDF reparsing on move, release resources | Partial | Large files remain responsive |
| Accessibility | Native buttons/labels, tooltips, focus/keyboard behavior, error messages | Partial | Every command has a keyboard-reachable control |

## Required V3 tests

- Compatibility ID creation without `crypto.randomUUID`.
- Command history: add, move, resize, rotate, delete, copy, format, page operations.
- Layer order and visibility/lock state.
- Page rotation and coordinate round trips at 50–200% for 0/90/180/270 degrees.
- Page delete guard, duplicate, and reordering.
- Chinese text, image, drawing, shapes, and notes written to a reloadable PDF.
- Output page count/order and source file integrity.
- Cleanup of object URLs and PDF.js documents.
