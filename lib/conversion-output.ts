import { readdir } from "fs/promises";
import path from "path";

/** Finds the first LibreOffice output with the requested extension, excluding the source file. */
export async function findGeneratedOutput(workDir: string, extension: string, sourcePath: string) {
  const entries = await readdir(workDir, { withFileTypes: true });
  const normalizedExtension = `.${extension.toLowerCase()}`;
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(workDir, entry.name))
    .find((filePath) => filePath !== sourcePath && path.extname(filePath).toLowerCase() === normalizedExtension);
}
