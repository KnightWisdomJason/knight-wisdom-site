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
const officeCandidates = [
  process.env.LIBREOFFICE_BIN,
  "/usr/bin/soffice",
  "/usr/bin/libreoffice",
  "soffice",
  "libreoffice",
].filter((candidate): candidate is string => Boolean(candidate));

async function runLibreOffice(args: string[], options: Parameters<typeof run>[2]) {
  let lastError: unknown;
  for (const candidate of officeCandidates) {
    if (candidate.startsWith("/") && !existsSync(candidate)) continue;
    try { return await run(candidate, args, options); } catch (error) {
      lastError = error;
      if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") throw error;
    }
  }
  throw lastError ?? new Error("LibreOffice executable was not found.");
}

function diagnosticOutput(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 2000) : "";
}

function conversionError(message: string, details: string, status = 422) {
  return Response.json({ error: message, details }, { status });
}

export async function POST(request: Request) {
  const data = await request.formData();
  const file = data.get("file");
  const kind = data.get("kind");
  if (!(file instanceof File) || (kind !== "pdf-to-word" && kind !== "word-to-pdf")) return Response.json({ error: "Invalid conversion request." }, { status: 400 });
  if (file.size === 0 || file.size > MAX_FILE_SIZE) return Response.json({ error: "Files must be between 1 byte and 20 MB." }, { status: 400 });

  const extension = path.extname(file.name).toLowerCase();
  const allowed = kind === "pdf-to-word" ? [".pdf"] : [".doc", ".docx"];
  if (!allowed.includes(extension)) return Response.json({ error: "Unsupported file type." }, { status: 400 });

  const workDir = await mkdtemp(path.join(tmpdir(), "knightwisdom-"));
  const inputName = `source${extension}`;
  const outputType = kind === "pdf-to-word" ? "docx" : "pdf";
  try {
    const inputPath = path.join(workDir, inputName);
    await writeFile(inputPath, Buffer.from(await file.arrayBuffer()));
    const convertFilter = kind === "pdf-to-word" ? "docx:Office Open XML Text" : "pdf:writer_pdf_Export";
    const profileUrl = pathToFileURL(path.join(workDir, "libreoffice-profile")).href;
    const importFilter = kind === "pdf-to-word" ? ["--infilter=writer_pdf_import"] : [];
    const result = await runLibreOffice([`-env:UserInstallation=${profileUrl}`, "--headless", ...importFilter, "--convert-to", convertFilter, "--outdir", workDir, inputPath], { timeout: 120000, windowsHide: true, env: { ...process.env, HOME: workDir, TMPDIR: workDir } });
    const generatedPath = await findGeneratedOutput(workDir, outputType, inputPath);
    const outputDetails = [diagnosticOutput(result.stdout), diagnosticOutput(result.stderr)].filter(Boolean).join("\n");
    if (!generatedPath) {
      const message = kind === "pdf-to-word"
        ? "LibreOffice did not create a DOCX file for this PDF. PDF to DOCX is not reliable for every PDF with LibreOffice; a dedicated conversion engine may be required."
        : "LibreOffice did not create a PDF file for this Word document.";
      return conversionError(message, outputDetails || "LibreOffice exited without creating a matching output file.");
    }
    const output = await readFile(generatedPath);
    const downloadName = `${path.basename(file.name, extension)}.${outputType}`;
    return new Response(output, { headers: { "Content-Type": outputType === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "Content-Disposition": `attachment; filename="${downloadName}"`, "X-Output-Filename": downloadName } });
  } catch (error) {
    console.error("Knight Wisdom conversion failed", error);
    const message = error instanceof Error && "code" in error && error.code === "ENOENT"
      ? "LibreOffice is not available to the website service."
      : "The converter could not process this file. Please check the server logs and try again.";
    const details = error && typeof error === "object" ? [diagnosticOutput("stdout" in error ? error.stdout : ""), diagnosticOutput("stderr" in error ? error.stderr : "")].filter(Boolean).join("\n") : "";
    return conversionError(message, details || (error instanceof Error ? error.message : "Unknown conversion error."), 503);
  } finally { await rm(workDir, { recursive: true, force: true }); }
}
