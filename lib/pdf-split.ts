import { PDFDocument } from "pdf-lib";

export type RangeParseResult = { pages: number[]; error?: never } | { pages?: never; error: string };

export function parsePageRanges(value: string, totalPages: number): RangeParseResult {
  const input = value.trim();
  if (!input) return { error: "Enter at least one page number or range." };
  const pages: number[] = [];
  const seen = new Set<number>();
  for (const rawPart of input.split(",")) {
    const part = rawPart.trim();
    if (!part) return { error: "Remove empty page ranges." };
    const match = /^(\d+)(?:\s*-\s*(\d+))?$/.exec(part);
    if (!match) return { error: `“${part}” is not a valid page number or range.` };
    const start = Number(match[1]);
    const end = Number(match[2] ?? match[1]);
    if (start < 1 || end < 1) return { error: "Page numbers must start at 1." };
    if (start > end) return { error: `The start page ${start} is after the end page ${end}.` };
    if (end > totalPages) return { error: `Page ${end} is outside this PDF, which has ${totalPages} pages.` };
    for (let page = start; page <= end; page += 1) if (!seen.has(page)) { seen.add(page); pages.push(page); }
  }
  return { pages };
}

/** Each comma-separated range becomes one output document; duplicate pages are retained only once. */
export function parsePageRangeGroups(value: string, totalPages: number): { groups: number[][]; error?: never } | { groups?: never; error: string } {
  const input = value.trim();
  if (!input) return { error: "Enter at least one page number or range." };
  const seen = new Set<number>();
  const groups: number[][] = [];
  for (const part of input.split(",")) {
    const parsed = parsePageRanges(part, totalPages);
    if ("error" in parsed && parsed.error) return { error: parsed.error };
    const group = (parsed.pages ?? []).filter((page) => !seen.has(page));
    group.forEach((page) => seen.add(page));
    if (group.length) groups.push(group);
  }
  return groups.length ? { groups } : { error: "Each selected page is already included in an earlier range." };
}

export function groupsForEveryN(totalPages: number, every: number): number[][] {
  if (!Number.isInteger(every) || every < 1) throw new Error("Pages per file must be a whole number greater than zero.");
  const groups: number[][] = [];
  for (let page = 1; page <= totalPages; page += every) groups.push(Array.from({ length: Math.min(every, totalPages - page + 1) }, (_, index) => page + index));
  return groups;
}

export async function splitPdfBytes(source: ArrayBuffer | Uint8Array, groups: number[][]): Promise<Uint8Array[]> {
  const original = await PDFDocument.load(source, { ignoreEncryption: false });
  const total = original.getPageCount();
  const output: Uint8Array[] = [];
  for (const group of groups) {
    if (!group.length || group.some((page) => page < 1 || page > total)) throw new Error("One of the selected pages is outside this PDF.");
    const next = await PDFDocument.create();
    const copied = await next.copyPages(original, group.map((page) => page - 1));
    copied.forEach((page) => next.addPage(page));
    output.push(await next.save());
  }
  return output;
}
