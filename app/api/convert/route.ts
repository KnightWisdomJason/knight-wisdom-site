import { execFile } from "child_process";
import { existsSync } from "fs";
import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { pathToFileURL } from "url";
import { promisify } from "util";
import { findGeneratedOutput } from "@/lib/conversion-output";

export const runtime = "nodejs";

const run = promisify(execFile);
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const officeCandidates = [process.env.LIBREOFFICE_BIN, "/usr/bin/soffice", "/usr/bin/libreoffice", "soffice", "libreoffice"].filter((candidate): candidate is string => Boolean(candidate));
const pythonCandidates = [process.env.PYTHON_BIN, path.join(process.cwd(), ".venv", "bin", "python"), "python3"].filter((candidate): candidate is string => Boolean(candidate));

function diagnosticOutput(value: unknown) { return typeof value === "string" ? value.trim().slice(0, 4000) : ""; }
function conversionError(message: string, details: string, status = 422) { return Response.json({ error: message, details }, { status }); }

async function runCandidates(candidates: string[], args: string[], options: Parameters<typeof run>[2]) {
  let lastError: unknown;
  for (const candidate of candidates) {
    if (candidate.startsWith("/") && !existsSync(candidate)) continue;
    try { return await run(candidate, args, options); } catch (error) {
      lastError = error;
      if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") throw error;
    }
  }
  throw lastError ?? new Error("Required conversion executable was not found.");
}

export async function POST(request: Request) {
  const data = await request.formData();
  const file = data.get("file");
  const kind = data.get("kind");
  if (!(file instanceof File) || (kind !== "pdf-to-word" && kind !== "word-to-pdf")) return conversionError("Invalid conversion request.", "Expected a file and supported conversion kind.", 400);
  if (file.size === 0 || file.size > MAX_FILE_SIZE) return conversionError("Files must be between 1 byte and 20 MB.", "", 400);

  const extension = path.extname(file.name).toLowerCase();
  const allowed = kind === "pdf-to-word" ? [".pdf"] : [".doc", ".docx"];
  if (!allowed.includes(extension)) return conversionError("Unsupported file type.", "", 400);

  const workDir = await mkdtemp(path.join(tmpdir(), "knightwisdom-"));
  const inputPath = path.join(workDir, `source${extension}`);
  const outputType = kind === "pdf-to-word" ? "docx" : "pdf";
  try {
    await writeFile(inputPath, Buffer.from(await file.arrayBuffer()));
    const options = { timeout: 120000, windowsHide: true, env: { ...process.env, HOME: workDir, TMPDIR: workDir } };
    let result: { stdout: string; stderr: string };
    let debug: unknown = undefined;

    if (kind === "pdf-to-word") {
      const outputPath = path.join(workDir, "converted.docx");
      result = await runCandidates(pythonCandidates, [path.join(process.cwd(), "scripts", "pdf_to_docx.py"), inputPath, outputPath], options) as { stdout: string; stderr: string };
      const generated = await findGeneratedOutput(workDir, "docx", inputPath);
      if (!generated) return conversionError("The PDF-to-DOCX engine did not create a Word file.", [diagnosticOutput(result.stdout), diagnosticOutput(result.stderr)].filter(Boolean).join("\n") || "pdf2docx completed without writing a DOCX output file.");
      try { debug = JSON.parse(result.stdout); } catch { debug = { raw_output: diagnosticOutput(result.stdout) }; }
      const output = await readFile(generated);
      console.info("Knight Wisdom PDF-to-DOCX debug", JSON.stringify(debug));
      const downloadName = `${path.basename(file.name, extension)}.docx`;
      return new Response(output, { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "Content-Disposition": `attachment; filename="${downloadName}"`, "X-Output-Filename": downloadName, "X-Conversion-Engine": "pdf2docx" } });
    }

    const profileUrl = pathToFileURL(path.join(workDir, "libreoffice-profile")).href;
    result = await runCandidates(officeCandidates, [`-env:UserInstallation=${profileUrl}`, "--headless", "--convert-to", "pdf:writer_pdf_Export", "--outdir", workDir, inputPath], options) as { stdout: string; stderr: string };
    const generated = await findGeneratedOutput(workDir, "pdf", inputPath);
    if (!generated) return conversionError("LibreOffice did not create a PDF file for this Word document.", [diagnosticOutput(result.stdout), diagnosticOutput(result.stderr)].filter(Boolean).join("\n") || "LibreOffice exited without creating a PDF output file.");
    const output = await readFile(generated);
    const downloadName = `${path.basename(file.name, extension)}.pdf`;
    return new Response(output, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${downloadName}"`, "X-Output-Filename": downloadName, "X-Conversion-Engine": "LibreOffice" } });
  } catch (error) {
    console.error("Knight Wisdom conversion failed", error);
    const code = error instanceof Error && "code" in error ? error.code : undefined;
    const details = error && typeof error === "object" ? [diagnosticOutput("stdout" in error ? error.stdout : ""), diagnosticOutput("stderr" in error ? error.stderr : "")].filter(Boolean).join("\n") : "";
    const message = code === "ENOENT" && kind === "pdf-to-word"
      ? "The PDF-to-DOCX engine is not installed for the website service. Install requirements.txt into the project virtual environment."
      : code === "ENOENT"
        ? "LibreOffice is not available to the website service."
        : "The converter could not process this file.";
    return conversionError(message, details || (error instanceof Error ? error.message : "Unknown conversion error."), 503);
  } finally { await rm(workDir, { recursive: true, force: true }); }
}
