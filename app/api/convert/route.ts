import { execFile } from "child_process";
import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { promisify } from "util";

export const runtime = "nodejs";

const run = promisify(execFile);
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const officeBinary = process.env.LIBREOFFICE_BIN || "soffice";

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
  const outputName = `source.${outputType}`;
  try {
    await writeFile(path.join(workDir, inputName), Buffer.from(await file.arrayBuffer()));
    const convertFilter = kind === "pdf-to-word" ? "docx:Office Open XML Text" : "pdf:writer_pdf_Export";
    await run(officeBinary, ["--headless", "--convert-to", convertFilter, "--outdir", workDir, path.join(workDir, inputName)], { timeout: 120000, windowsHide: true });
    const output = await readFile(path.join(workDir, outputName));
    const downloadName = `${path.basename(file.name, extension)}.${outputType}`;
    return new Response(output, { headers: { "Content-Type": outputType === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "Content-Disposition": `attachment; filename="${downloadName}"`, "X-Output-Filename": downloadName } });
  } catch {
    return Response.json({ error: "Conversion is unavailable." }, { status: 503 });
  } finally { await rm(workDir, { recursive: true, force: true }); }
}
