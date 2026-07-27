export type PdfEditorElementType = "text" | "draw" | "highlight" | "rectangle" | "signature";

/** Coordinates are PDF points from the visual top-left of the page. */
export type PdfEditorElement = {
  id: string;
  pageIndex: number;
  type: PdfEditorElementType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  fontSize?: number;
  color?: string;
  opacity?: number;
  points?: number[];
  imageData?: string;
};

export type EditorHistory = {
  past: PdfEditorElement[][];
  present: PdfEditorElement[];
  future: PdfEditorElement[][];
};

export const createEditorHistory = (elements: PdfEditorElement[] = []): EditorHistory => ({ past: [], present: elements, future: [] });

export const commitEditorHistory = (history: EditorHistory, next: PdfEditorElement[]): EditorHistory => ({
  past: [...history.past, history.present],
  present: next,
  future: [],
});

export const undoEditorHistory = (history: EditorHistory): EditorHistory => {
  const previous = history.past.at(-1);
  if (!previous) return history;
  return { past: history.past.slice(0, -1), present: previous, future: [history.present, ...history.future] };
};

export const redoEditorHistory = (history: EditorHistory): EditorHistory => {
  const next = history.future[0];
  if (!next) return history;
  return { past: [...history.past, history.present], present: next, future: history.future.slice(1) };
};

export const viewportToPdfPoint = (x: number, y: number, zoom: number) => ({ x: x / zoom, y: y / zoom });
export const pdfToViewportPoint = (x: number, y: number, zoom: number) => ({ x: x * zoom, y: y * zoom });

/** Converts our top-left PDF point to pdf-lib's bottom-left coordinate. */
export const topLeftToPdfLibY = (pageHeight: number, top: number, elementHeight = 0) => pageHeight - top - elementHeight;
