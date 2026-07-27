import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { findGeneratedOutput } from "../lib/conversion-output";

test("findGeneratedOutput returns the actual generated DOCX instead of assuming a source filename", async () => {
  const workDir = await mkdtemp(path.join(tmpdir(), "knightwisdom-test-"));
  const source = path.join(workDir, "source.pdf");
  try {
    await writeFile(source, "source");
    await writeFile(path.join(workDir, "Academic Record.docx"), "converted");
    assert.equal(await findGeneratedOutput(workDir, "docx", source), path.join(workDir, "Academic Record.docx"));
  } finally { await rm(workDir, { recursive: true, force: true }); }
});

test("findGeneratedOutput returns undefined when LibreOffice produced no matching file", async () => {
  const workDir = await mkdtemp(path.join(tmpdir(), "knightwisdom-test-"));
  const source = path.join(workDir, "source.pdf");
  try {
    await writeFile(source, "source");
    assert.equal(await findGeneratedOutput(workDir, "docx", source), undefined);
  } finally { await rm(workDir, { recursive: true, force: true }); }
});
