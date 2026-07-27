"use client";

import JSZip from "jszip";
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ArrowRight } from "@/components/icons";
import { groupsForEveryN, parsePageRangeGroups, splitPdfBytes } from "@/lib/pdf-split";

type Language = "en" | "zh-CN";
type Mode = "ranges" | "each" | "every" | "selected" | "selectedEach";
type PreviewDoc = { numPages: number; getPage: (page: number) => Promise<any>; destroy?: () => Promise<void> | void };
type SplitResult = { name: string; url: string; bytes: Uint8Array };

const words = {
  en: { navigation: { blog: "Blog", computer: "Computer tools", pdf: "PDF", images: "Image tools", business: "Business tools" }, languageLabel: "Choose language", back: "All tools", label: "PDF TOOLS", title: "Split a PDF locally.", intro: "Choose exactly how pages should be separated. Your document stays in your browser.", drop: "Drop a PDF here to split", choose: "Choose PDF", hint: "PDF files up to 20 MB", privacy: "Your file is processed locally in your browser and is never uploaded to our server.", mode: "How would you like to split it?", ranges: "Split page ranges", each: "Every page separately", every: "Every N pages", selected: "Selected pages in one PDF", selectedEach: "Each selected page separately", rangeHint: "For example: 1-3, 5, 8-10", everyHint: "Pages per PDF", selectHint: "Click page thumbnails to select pages", split: "Split PDF", working: "Splitting PDF…", page: "Page", pages: "pages", success: "Your split files are ready", successText: "Nothing downloads automatically. Choose an individual file or download everything as a ZIP.", download: "Download", all: "Download all as ZIP", again: "Split another PDF", error: "We could not split that PDF. It may be encrypted or damaged.", tooLarge: "Please choose a PDF smaller than 20 MB.", selectPages: "Select at least one page.", footer: { tagline: "Thoughtful tools and ideas for a more capable day.", rights: "All rights reserved.", privacy: "Privacy", terms: "Terms", contact: "Contact" } },
  "zh-CN": { navigation: { blog: "博客", computer: "计算机工具", pdf: "PDF", images: "图片工具", business: "商业工具" }, languageLabel: "选择语言", back: "全部工具", label: "PDF 工具", title: "在本地拆分 PDF。", intro: "按你的需要拆分页面，文件始终保留在浏览器中。", drop: "将 PDF 拖到这里开始拆分", choose: "选择 PDF", hint: "支持最大 20 MB 的 PDF 文件", privacy: "您的文件仅在浏览器本地处理，绝不会上传到我们的服务器。", mode: "请选择拆分方式", ranges: "按页码范围拆分", each: "每页单独生成 PDF", every: "每 N 页生成一个 PDF", selected: "选中页面合并为一个 PDF", selectedEach: "每个选中页面单独生成 PDF", rangeHint: "例如：1-3, 5, 8-10", everyHint: "每个 PDF 的页数", selectHint: "点击页面缩略图进行选择", split: "拆分 PDF", working: "正在拆分 PDF…", page: "第", pages: "页", success: "拆分文件已准备好", successText: "不会自动下载。你可以选择单独下载，或将全部文件下载为 ZIP。", download: "下载", all: "全部下载为 ZIP", again: "拆分另一份 PDF", error: "无法拆分此 PDF。它可能已加密或已损坏。", tooLarge: "请选择小于 20 MB 的 PDF。", selectPages: "请至少选择一页。", footer: { tagline: "让每一天都更有能力的实用工具与想法。", rights: "保留所有权利。", privacy: "隐私", terms: "条款", contact: "联系" } },
} as const;
const MAX_SIZE = 20 * 1024 * 1024;
const base = (name: string) => name.replace(/\.pdf$/i, "");

export function SplitPdfPage() {
  const [language, setLanguage] = useState<Language>("en");
  const [file, setFile] = useState<File | null>(null);
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [preview, setPreview] = useState<PreviewDoc | null>(null);
  const [mode, setMode] = useState<Mode>("ranges");
  const [ranges, setRanges] = useState("");
  const [every, setEvery] = useState(2);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState<SplitResult[] | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const copy = words[language];
  useEffect(() => { const requested = new URLSearchParams(window.location.search).get("lang"); const saved = window.localStorage.getItem("knightwisdom-language") as Language | null; const initial = requested === "en" || requested === "zh-CN" ? requested : saved ?? (navigator.language.toLowerCase().startsWith("zh") ? "zh-CN" : "en"); document.documentElement.lang = initial; setLanguage(initial); }, []);
  useEffect(() => () => { void preview?.destroy?.(); result?.forEach((item) => URL.revokeObjectURL(item.url)); }, [preview, result]);
  const changeLanguage = (next: Language) => { window.localStorage.setItem("knightwisdom-language", next); document.documentElement.lang = next; window.history.replaceState(null, "", `${window.location.pathname}?lang=${next}`); setLanguage(next); };
  const open = async (next: File | null) => {
    if (!next) return; if (next.size > MAX_SIZE) { setError(copy.tooLarge); return; }
    setError(""); setWorking(true); setSelected(new Set());
    try { const data = new Uint8Array(await next.arrayBuffer()); await PDFDocument.load(data, { ignoreEncryption: false }); const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs"); pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString(); const nextPreview = await pdfjs.getDocument({ data: data.slice() }).promise as unknown as PreviewDoc; await preview?.destroy?.(); setFile(next); setBytes(data); setPreview(nextPreview); } catch { setError(copy.error); setFile(null); setBytes(null); setPreview(null); } finally { setWorking(false); }
  };
  const buildGroups = (): number[][] | null => {
    const total = preview?.numPages ?? 0;
    if (mode === "ranges") { const parsed = parsePageRangeGroups(ranges, total); if ("error" in parsed && parsed.error) { setError(parsed.error); return null; } return parsed.groups ?? []; }
    if (mode === "each") return groupsForEveryN(total, 1);
    if (mode === "every") try { return groupsForEveryN(total, every); } catch (reason) { setError(reason instanceof Error ? reason.message : copy.error); return null; }
    const pages = Array.from(selected).sort((a, b) => a - b); if (!pages.length) { setError(copy.selectPages); return null; }
    return mode === "selected" ? [pages] : pages.map((page) => [page]);
  };
  const split = async () => { if (!bytes || !file) return; const groups = buildGroups(); if (!groups) return; setWorking(true); setError(""); try { const documents = await splitPdfBytes(bytes, groups); const items = documents.map((item, index) => ({ bytes: item, name: `${base(file.name)}-part-${index + 1}.pdf`, url: URL.createObjectURL(new Blob([item.buffer as ArrayBuffer], { type: "application/pdf" })) })); setResult(items); } catch { setError(copy.error); } finally { setWorking(false); } };
  const downloadAll = async () => { if (!result || !file) return; const zip = new JSZip(); result.forEach((item) => zip.file(item.name, item.bytes)); const blob = await zip.generateAsync({ type: "blob" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${base(file.name)}-split.zip`; anchor.click(); URL.revokeObjectURL(url); };
  const reset = () => { result?.forEach((item) => URL.revokeObjectURL(item.url)); setResult(null); setFile(null); setBytes(null); void preview?.destroy?.(); setPreview(null); setSelected(new Set()); setRanges(""); };
  if (result) return <main id="top"><Header language={language} onLanguageChange={changeLanguage} copy={{ navigation: copy.navigation, languageLabel: copy.languageLabel }} /><section className="conversion-result section-shell"><span className="result-check">✓</span><p className="label">PDF TOOLS</p><h1>{copy.success}</h1><p>{copy.successText}</p><div className="split-results">{result.map((item) => <div key={item.name}><span>{item.name}</span><a className="button button-primary" href={item.url} download={item.name}>{copy.download}</a></div>)}</div>{result.length > 1 && <button className="button button-primary" onClick={() => void downloadAll()}>{copy.all}</button>}<button className="result-reset" onClick={reset}>{copy.again}</button></section><Footer copy={copy.footer} /></main>;
  const modeOptions: [Mode, string][] = [["ranges", copy.ranges], ["each", copy.each], ["every", copy.every], ["selected", copy.selected], ["selectedEach", copy.selectedEach]];
  return <main id="top"><Header language={language} onLanguageChange={changeLanguage} copy={{ navigation: copy.navigation, languageLabel: copy.languageLabel }} /><section className="split-page section-shell"><a className="back-link" href={`/?lang=${language}#tools`}>← {copy.back}</a><p className="label">{copy.label}</p><h1>{copy.title}</h1><p className="converter-intro">{copy.intro}</p>{!preview && <label className="upload-panel" onDragOver={(event) => event.preventDefault()} onDrop={(event: DragEvent<HTMLLabelElement>) => { event.preventDefault(); void open(event.dataTransfer.files[0] ?? null); }}><input ref={input} type="file" accept="application/pdf,.pdf" onChange={(event: ChangeEvent<HTMLInputElement>) => void open(event.target.files?.[0] ?? null)} /><span className="upload-icon">↑</span><strong>{copy.drop}</strong><span>{copy.hint}</span><em>{copy.choose}</em></label>}{working && <p className="editor-status">{copy.working}</p>}{error && <p className="converter-error">{error}</p>}{preview && <div className="split-workspace"><div className="split-settings"><strong>{file?.name}</strong><span>{preview.numPages} {copy.pages}</span><h2>{copy.mode}</h2>{modeOptions.map(([value, label]) => <label className="split-mode" key={value}><input type="radio" name="split-mode" checked={mode === value} onChange={() => setMode(value)} />{label}</label>)}{mode === "ranges" && <input aria-label={copy.ranges} value={ranges} onChange={(event) => setRanges(event.target.value)} placeholder={copy.rangeHint} />}{mode === "every" && <label>{copy.everyHint}<input type="number" min="1" value={every} onChange={(event) => setEvery(Number(event.target.value))} /></label>}{(mode === "selected" || mode === "selectedEach") && <p>{copy.selectHint}</p>}<button className="button button-primary" onClick={() => void split()} disabled={working}>{copy.split} <ArrowRight /></button></div><div className="split-thumbnails" aria-label="PDF page thumbnails">{Array.from({ length: preview.numPages }, (_, index) => <PageThumbnail key={index} pdf={preview} index={index} active={selected.has(index + 1)} onClick={() => setSelected((current) => { const next = new Set(current); next.has(index + 1) ? next.delete(index + 1) : next.add(index + 1); return next; })} label={`${copy.page} ${index + 1}`} />)}</div></div>}<p className="converter-privacy">{copy.privacy}</p></section><Footer copy={copy.footer} /></main>;
}

function PageThumbnail({ pdf, index, active, onClick, label }: { pdf: PreviewDoc; index: number; active: boolean; onClick: () => void; label: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => { let cancelled = false; void (async () => { const page = await pdf.getPage(index + 1); const viewport = page.getViewport({ scale: .22 }); if (cancelled || !canvas.current) return; canvas.current.width = viewport.width; canvas.current.height = viewport.height; await page.render({ canvasContext: canvas.current.getContext("2d")!, viewport }).promise; })(); return () => { cancelled = true; }; }, [pdf, index]);
  return <button className={`split-thumb ${active ? "active" : ""}`} onClick={onClick} aria-pressed={active}><canvas ref={canvas} /><span>{label}</span></button>;
}
