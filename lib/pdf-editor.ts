export type PdfEditorElementType = "text" | "image" | "signature" | "draw" | "highlight" | "rectangle" | "ellipse" | "line" | "arrow" | "comment";
export type PageRotation = 0 | 90 | 180 | 270;

/** All element positions use unscaled PDF-page points with the source page's top-left as 0,0. */
export type PdfEditorElement = {
  id: string;
  pageIndex: number;
  type: PdfEditorElementType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  text?: string;
  label?: string;
  fontSize?: number;
  fontFamily?: "sans" | "serif" | "mono";
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: "left" | "center" | "right";
  lineHeight?: number;
  color?: string;
  fillColor?: string;
  opacity?: number;
  strokeWidth?: number;
  dashed?: boolean;
  points?: number[];
  imageData?: string;
  visible?: boolean;
  locked?: boolean;
};

export type EditorPage = { sourceIndex: number; rotation: PageRotation };
export type EditorHistory = { past: PdfEditorElement[][]; present: PdfEditorElement[]; future: PdfEditorElement[][] };

export const createEditorHistory = (elements: PdfEditorElement[] = []): EditorHistory => ({ past: [], present: elements, future: [] });
export const commitEditorHistory = (history: EditorHistory, next: PdfEditorElement[]): EditorHistory => ({ past: [...history.past, history.present], present: next, future: [] });
export const undoEditorHistory = (history: EditorHistory): EditorHistory => { const previous = history.past.at(-1); return previous ? { past: history.past.slice(0, -1), present: previous, future: [history.present, ...history.future] } : history; };
export const redoEditorHistory = (history: EditorHistory): EditorHistory => { const next = history.future[0]; return next ? { past: [...history.past, history.present], present: next, future: history.future.slice(1) } : history; };

/** Works in HTTP / older browser contexts where crypto.randomUUID is unavailable. */
export function createEditorId(prefix = "el"): string {
  const randomUuid = globalThis.crypto?.randomUUID;
  if (typeof randomUuid === "function") return `${prefix}-${randomUuid.call(globalThis.crypto)}`;
  const random = globalThis.crypto?.getRandomValues ? Array.from(globalThis.crypto.getRandomValues(new Uint32Array(2))).map((value) => value.toString(36)).join("") : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

export const viewportToPdfPoint = (x: number, y: number, zoom: number) => ({ x: x / zoom, y: y / zoom });
export const pdfToViewportPoint = (x: number, y: number, zoom: number) => ({ x: x * zoom, y: y * zoom });
export const topLeftToPdfLibY = (pageHeight: number, top: number, elementHeight = 0) => pageHeight - top - elementHeight;

/** Maps an unscaled point from a rotated visual page back to the unrotated source PDF page. */
export function rotatedViewportToPagePoint(x: number, y: number, pageWidth: number, pageHeight: number, rotation: PageRotation) {
  if (rotation === 90) return { x: y, y: pageHeight - x };
  if (rotation === 180) return { x: pageWidth - x, y: pageHeight - y };
  if (rotation === 270) return { x: pageWidth - y, y: x };
  return { x, y };
}

export function pagePointToRotatedViewport(x: number, y: number, pageWidth: number, pageHeight: number, rotation: PageRotation) {
  if (rotation === 90) return { x: pageHeight - y, y: x };
  if (rotation === 180) return { x: pageWidth - x, y: pageHeight - y };
  if (rotation === 270) return { x: y, y: pageWidth - x };
  return { x, y };
}

export const moveElement = (element: PdfEditorElement, dx: number, dy: number) => ({ ...element, x: Math.max(0, element.x + dx), y: Math.max(0, element.y + dy) });
export const resizeElement = (element: PdfEditorElement, width: number, height: number) => ({ ...element, width: Math.max(8, width), height: Math.max(8, height) });
export const removeElement = (elements: PdfEditorElement[], id: string) => elements.filter((element) => element.id !== id);
export const copyElement = (elements: PdfEditorElement[], id: string) => { const original = elements.find((element) => element.id === id); return original ? [...elements, { ...original, id: createEditorId("copy"), x: original.x + 14, y: original.y + 14, label: `${original.label ?? original.type} copy` }] : elements; };
export function reorderElement(elements: PdfEditorElement[], id: string, direction: "forward" | "backward" | "top" | "bottom") {
  const index = elements.findIndex((element) => element.id === id); if (index < 0) return elements;
  const next = [...elements]; const [item] = next.splice(index, 1);
  const target = direction === "top" ? next.length : direction === "bottom" ? 0 : direction === "forward" ? Math.min(next.length, index + 1) : Math.max(0, index - 1);
  next.splice(target, 0, item); return next;
}
export function rotateEditorPage(pages: EditorPage[], sourceIndex: number): EditorPage[] { return pages.map((page) => page.sourceIndex === sourceIndex ? { ...page, rotation: ((page.rotation + 90) % 360) as PageRotation } : page); }
export const removeEditorPage = (pages: EditorPage[], sourceIndex: number) => pages.length <= 1 ? pages : pages.filter((page) => page.sourceIndex !== sourceIndex);
export function reorderEditorPage(pages: EditorPage[], sourceIndex: number, destination: number) { const current = pages.findIndex((page) => page.sourceIndex === sourceIndex); if (current < 0) return pages; const next = [...pages]; const [item] = next.splice(current, 1); next.splice(Math.max(0, Math.min(destination, next.length)), 0, item); return next; }
