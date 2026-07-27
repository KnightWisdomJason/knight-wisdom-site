import assert from "node:assert/strict";
import test from "node:test";
import { PDFDocument, rgb } from "pdf-lib";
import { commitEditorHistory, copyElement, createEditorHistory, createEditorId, moveElement, pagePointToRotatedViewport, PdfEditorElement, redoEditorHistory, removeEditorPage, removeElement, reorderEditorPage, reorderElement, resizeElement, rotateEditorPage, rotatedViewportToPagePoint, topLeftToPdfLibY, undoEditorHistory, viewportToPdfPoint } from "../lib/pdf-editor";
import { groupsForEveryN, parsePageRangeGroups, parsePageRanges, splitPdfBytes } from "../lib/pdf-split";
import { writeElement } from "../components/pdf-editor-page";

test("page range parsing de-duplicates overlapping pages", () => {
  assert.deepEqual(parsePageRanges("1-3, 2, 5, 7-8", 8), { pages: [1, 2, 3, 5, 7, 8] });
});

test("page range parsing reports invalid page numbers clearly", () => {
  const result = parsePageRanges("1-3, 12", 8);
  assert.ok("error" in result);
  assert.match(result.error, /12.*8/);
  assert.match(parsePageRanges("4-2", 8).error ?? "", /start page 4/i);
});

test("range splitting keeps each requested range as a separate PDF", () => {
  assert.deepEqual(parsePageRangeGroups("1-3, 5, 8-10", 10), { groups: [[1, 2, 3], [5], [8, 9, 10]] });
});

test("splitting preserves vector PDF pages and creates non-empty files", async () => {
  const original = await PDFDocument.create();
  original.addPage([595, 842]); original.addPage([595, 842]); original.addPage([842, 595]);
  const outputs = await splitPdfBytes(await original.save(), groupsForEveryN(3, 2));
  assert.equal(outputs.length, 2);
  assert.ok(outputs.every((output) => output.byteLength > 100));
  assert.equal((await PDFDocument.load(outputs[0])).getPageCount(), 2);
  assert.equal((await PDFDocument.load(outputs[1])).getPageCount(), 1);
});

test("editor coordinate conversion is scale-aware and uses PDF top-left storage", () => {
  assert.deepEqual(viewportToPdfPoint(240, 120, 2), { x: 120, y: 60 });
  assert.equal(topLeftToPdfLibY(842, 60, 16), 766);
});

test("compatible IDs are generated without relying on direct randomUUID calls", () => {
  const first = createEditorId(); const second = createEditorId();
  assert.match(first, /^el-/); assert.notEqual(first, second);
});

test("elements can be moved, resized, copied, deleted, and reordered", () => {
  const first: PdfEditorElement = { id: "first", pageIndex: 0, type: "rectangle", x: 20, y: 30, width: 40, height: 50 };
  const second: PdfEditorElement = { id: "second", pageIndex: 0, type: "text", x: 10, y: 10, text: "note" };
  assert.deepEqual(moveElement(first, -99, 3), { ...first, x: 0, y: 33 });
  assert.deepEqual(resizeElement(first, 2, 3), { ...first, width: 8, height: 8 });
  const copied = copyElement([first, second], first.id); assert.equal(copied.length, 3); assert.notEqual(copied[2].id, first.id);
  assert.deepEqual(reorderElement([first, second], first.id, "top").map((item) => item.id), ["second", "first"]);
  assert.deepEqual(removeElement([first, second], second.id).map((item) => item.id), ["first"]);
});

test("page rotation, deletion guard, and reordering preserve valid page state", () => {
  const pages = [{ sourceIndex: 0, rotation: 0 as const }, { sourceIndex: 1, rotation: 90 as const }, { sourceIndex: 2, rotation: 180 as const }];
  assert.equal(rotateEditorPage(pages, 1)[1].rotation, 180);
  assert.equal(removeEditorPage([{ sourceIndex: 0, rotation: 0 as const }], 0).length, 1);
  assert.deepEqual(removeEditorPage(pages, 1).map((page) => page.sourceIndex), [0, 2]);
  assert.deepEqual(reorderEditorPage(pages, 2, 0).map((page) => page.sourceIndex), [2, 0, 1]);
});

test("90, 180, and 270 degree coordinates round-trip to their source PDF positions", () => {
  for (const rotation of [0, 90, 180, 270] as const) {
    const source = { x: 80, y: 150 }; const viewed = pagePointToRotatedViewport(source.x, source.y, 595, 842, rotation);
    assert.deepEqual(rotatedViewportToPagePoint(viewed.x, viewed.y, 595, 842, rotation), source);
  }
});

test("editor undo and redo restore independent element snapshots", () => {
  const item: PdfEditorElement = { id: "one", pageIndex: 0, type: "text", x: 20, y: 30, text: "Hello" };
  let history = createEditorHistory(); history = commitEditorHistory(history, [item]); history = commitEditorHistory(history, [{ ...item, x: 44 }]);
  history = undoEditorHistory(history); assert.equal(history.present[0].x, 20);
  history = redoEditorHistory(history); assert.equal(history.present[0].x, 44);
});

test("an edited export stays non-empty and preserves original page count", async () => {
  const source = await PDFDocument.create(); source.addPage([595, 842]); source.addPage([842, 595]);
  const originalBytes = await source.save(); const edited = await PDFDocument.load(originalBytes); const page = edited.getPage(0); page.drawRectangle({ x: 20, y: 20, width: 50, height: 30, color: rgb(1, 0, .5) });
  const output = await edited.save(); assert.ok(output.byteLength > 100); assert.equal((await PDFDocument.load(output)).getPageCount(), 2);
});

test("text, image, and drawing edits export into a reloadable PDF", async () => {
  const document = await PDFDocument.create(); const page = document.addPage([300, 200]);
  await writeElement(document, page, { id: "text", pageIndex: 0, type: "text", x: 10, y: 12, width: 150, height: 24, text: "Hello", color: "#FF4FA3", fontSize: 14 }, 300, 200, null);
  await writeElement(document, page, { id: "draw", pageIndex: 0, type: "draw", x: 5, y: 5, points: [5, 5, 80, 40], color: "#FF4FA3", strokeWidth: 2 }, 300, 200, null);
  const image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLkjwAAAABJRU5ErkJggg==";
  await writeElement(document, page, { id: "image", pageIndex: 0, type: "image", x: 120, y: 30, width: 20, height: 20, imageData: image }, 300, 200, null);
  const output = await document.save(); assert.ok(output.byteLength > 300); assert.equal((await PDFDocument.load(output)).getPageCount(), 1);
});
