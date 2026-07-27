import assert from "node:assert/strict";
import test from "node:test";
import { PDFDocument, rgb } from "pdf-lib";
import { commitEditorHistory, createEditorHistory, PdfEditorElement, redoEditorHistory, topLeftToPdfLibY, undoEditorHistory, viewportToPdfPoint } from "../lib/pdf-editor";
import { groupsForEveryN, parsePageRangeGroups, parsePageRanges, splitPdfBytes } from "../lib/pdf-split";

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
