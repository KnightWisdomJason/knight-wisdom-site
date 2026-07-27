"use client";

import { ChangeEvent, DragEvent, PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ArrowRight } from "@/components/icons";
import { commitEditorHistory, createEditorHistory, PdfEditorElement, PdfEditorElementType, redoEditorHistory, topLeftToPdfLibY, undoEditorHistory, viewportToPdfPoint } from "@/lib/pdf-editor";

type Language = "en" | "zh-CN";
type Tool = "select" | PdfEditorElementType;
type PdfJsDocument = { numPages: number; getPage: (page: number) => Promise<any>; destroy?: () => Promise<void> | void };

const copy = {
  en: {
    navigation: { blog: "Blog", computer: "Computer tools", pdf: "PDF", images: "Image tools", business: "Business tools" }, languageLabel: "Choose language", back: "All tools", label: "PDF EDITOR", title: "Edit a PDF in your browser.", intro: "Add notes, marks, shapes, and signatures without sending the document to a server.", choose: "Open PDF", drop: "Drop a PDF here to begin", hint: "PDF files up to 20 MB", privacy: "Your file is processed locally in your browser and is never uploaded to our server.", select: "Select", text: "Text", draw: "Draw", highlight: "Highlight", rectangle: "Rectangle", signature: "Signature", undo: "Undo", redo: "Redo", remove: "Delete", zoomOut: "Zoom out", zoomIn: "Zoom in", fit: "Fit width", download: "Download PDF", page: "Page", pages: "pages", properties: "Properties", noSelection: "Select an added item to edit it.", textContent: "Text", fontSize: "Font size", colour: "Colour", width: "Width", height: "Height", font: "Chinese font (optional)", fontHint: "Upload a TTF/OTF font before exporting Chinese text.", result: "Your edited PDF is ready", resultText: "Review is complete. Download it when you are ready.", downloadEdited: "Download edited PDF", editAnother: "Edit another PDF", loading: "Opening your PDF…", error: "We could not open or edit that PDF. It may be encrypted or damaged.", tooLarge: "Please choose a PDF smaller than 20 MB.", cjkError: "To export Chinese text, upload a TTF or OTF font in the Properties panel.", footer: { tagline: "Thoughtful tools and ideas for a more capable day.", rights: "All rights reserved.", privacy: "Privacy", terms: "Terms", contact: "Contact" },
  },
  "zh-CN": {
    navigation: { blog: "博客", computer: "计算机工具", pdf: "PDF", images: "图片工具", business: "商业工具" }, languageLabel: "选择语言", back: "全部工具", label: "PDF 在线编辑器", title: "直接在浏览器中编辑 PDF。", intro: "添加文字、绘制标记、图形和签名，文件不会上传到服务器。", choose: "打开 PDF", drop: "将 PDF 拖到这里开始", hint: "支持最大 20 MB 的 PDF 文件", privacy: "您的文件仅在浏览器本地处理，绝不会上传到我们的服务器。", select: "选择", text: "文字", draw: "画笔", highlight: "高亮", rectangle: "矩形", signature: "签名", undo: "撤销", redo: "重做", remove: "删除", zoomOut: "缩小", zoomIn: "放大", fit: "适应宽度", download: "下载 PDF", page: "第", pages: "页", properties: "属性", noSelection: "选择一个已添加的元素以编辑它。", textContent: "文字内容", fontSize: "字号", colour: "颜色", width: "宽度", height: "高度", font: "中文字体（可选）", fontHint: "导出中文文字前，请上传 TTF 或 OTF 字体。", result: "编辑后的 PDF 已准备好", resultText: "编辑已完成，请在需要时手动下载。", downloadEdited: "下载编辑后的 PDF", editAnother: "编辑另一份 PDF", loading: "正在打开 PDF…", error: "无法打开或编辑此 PDF。它可能已加密或已损坏。", tooLarge: "请选择小于 20 MB 的 PDF。", cjkError: "如需导出中文文字，请在属性栏上传 TTF 或 OTF 字体。", footer: { tagline: "让每一天都更有能力的实用工具与想法。", rights: "保留所有权利。", privacy: "隐私", terms: "条款", contact: "联系" },
  },
} as const;

const MAX_SIZE = 20 * 1024 * 1024;
const hasCjk = (value: string) => /[\u3400-\u9fff]/.test(value);
const hexToRgb = (value = "#FF4FA3") => rgb(parseInt(value.slice(1, 3), 16) / 255, parseInt(value.slice(3, 5), 16) / 255, parseInt(value.slice(5, 7), 16) / 255);
const fileBase = (name: string) => name.replace(/\.pdf$/i, "");

export function PdfEditorPage() {
  const [language, setLanguage] = useState<Language>("en");
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pdf, setPdf] = useState<PdfJsDocument | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [zoom, setZoom] = useState(1.15);
  const [pageSize, setPageSize] = useState({ width: 595, height: 842 });
  const [history, setHistory] = useState(() => createEditorHistory());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<Tool>("select");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ url: string; name: string } | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [fontBytes, setFontBytes] = useState<Uint8Array | null>(null);
  const pageCanvas = useRef<HTMLCanvasElement>(null);
  const canvasShell = useRef<HTMLDivElement>(null);
  const drawing = useRef<PdfEditorElement | null>(null);
  const drawingBase = useRef<PdfEditorElement[] | null>(null);
  const dragState = useRef<{ id: string; startX: number; startY: number; originX: number; originY: number; base: PdfEditorElement[] } | null>(null);
  const copyText = copy[language];
  const elements = history.present;
  const selected = elements.find((element) => element.id === selectedId) ?? null;

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("lang");
    const saved = window.localStorage.getItem("knightwisdom-language") as Language | null;
    const initial = requested === "en" || requested === "zh-CN" ? requested : saved ?? (navigator.language.toLowerCase().startsWith("zh") ? "zh-CN" : "en");
    document.documentElement.lang = initial;
    setLanguage(initial);
  }, []);
  useEffect(() => () => { void pdf?.destroy?.(); if (result) URL.revokeObjectURL(result.url); }, [pdf, result]);

  const changeLanguage = (next: Language) => { window.localStorage.setItem("knightwisdom-language", next); document.documentElement.lang = next; window.history.replaceState(null, "", `${window.location.pathname}?lang=${next}`); setLanguage(next); };
  const commit = (next: PdfEditorElement[]) => setHistory((previous) => commitEditorHistory(previous, next));
  const updateElement = (id: string, patch: Partial<PdfEditorElement>, save = false) => {
    const next = elements.map((element) => element.id === id ? { ...element, ...patch } : element);
    if (save) commit(next); else setHistory((previous) => ({ ...previous, present: next }));
  };

  const openFile = async (nextFile: File | null) => {
    if (!nextFile) return;
    if (nextFile.size > MAX_SIZE) { setError(copyText.tooLarge); return; }
    if (nextFile.type && nextFile.type !== "application/pdf" && !nextFile.name.toLowerCase().endsWith(".pdf")) { setError(copyText.error); return; }
    setLoading(true); setError(""); setSelectedId(null); setHistory(createEditorHistory()); setFile(nextFile);
    try {
      const bytes = new Uint8Array(await nextFile.arrayBuffer());
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
      const nextPdf = await pdfjs.getDocument({ data: bytes.slice() }).promise as unknown as PdfJsDocument;
      await pdf?.destroy?.();
      setPdf(nextPdf); setPdfBytes(bytes); setPageIndex(0); setZoom(1.15);
    } catch { setPdf(null); setPdfBytes(null); setFile(null); setError(copyText.error); } finally { setLoading(false); }
  };

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      if (!pdf || !pageCanvas.current) return;
      const sourcePage = await pdf.getPage(pageIndex + 1);
      const viewport = sourcePage.getViewport({ scale: zoom });
      if (cancelled || !pageCanvas.current) return;
      const canvas = pageCanvas.current;
      canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
      canvas.style.width = `${viewport.width}px`; canvas.style.height = `${viewport.height}px`;
      setPageSize({ width: viewport.width / zoom, height: viewport.height / zoom });
      await sourcePage.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
    };
    void render().catch(() => setError(copyText.error));
    return () => { cancelled = true; };
  }, [pdf, pageIndex, zoom, copyText.error]);

  const currentElements = useMemo(() => elements.filter((element) => element.pageIndex === pageIndex), [elements, pageIndex]);
  const getPoint = (event: PointerEvent<HTMLElement>) => {
    const bounds = canvasShell.current?.getBoundingClientRect();
    if (!bounds) return { x: 0, y: 0 };
    return viewportToPdfPoint(event.clientX - bounds.left, event.clientY - bounds.top, zoom);
  };
  const addElement = (element: PdfEditorElement) => { commit([...elements, element]); setSelectedId(element.id); };
  const onCanvasDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!pdf || tool === "select") { setSelectedId(null); return; }
    const point = getPoint(event); const id = crypto.randomUUID();
    if (tool === "text") addElement({ id, pageIndex, type: "text", x: point.x, y: point.y, width: 180, height: 30, text: "Text", fontSize: 16, color: "#FF4FA3" });
    if (tool === "signature") {
      if (!signatureData) { setError(language === "zh-CN" ? "请先在工具栏上传签名图片。" : "Upload a signature image in the toolbar first."); return; }
      addElement({ id, pageIndex, type: "signature", x: point.x, y: point.y, width: 150, height: 60, imageData: signatureData });
    }
    if (tool === "draw" || tool === "highlight" || tool === "rectangle") {
      const element: PdfEditorElement = tool === "draw" ? { id, pageIndex, type: "draw", x: point.x, y: point.y, color: "#FF4FA3", points: [point.x, point.y] } : { id, pageIndex, type: tool, x: point.x, y: point.y, width: 1, height: 1, color: tool === "highlight" ? "#FFD86B" : "#FF4FA3", opacity: tool === "highlight" ? .34 : 1 };
      drawing.current = element; drawingBase.current = elements; setHistory((previous) => ({ ...previous, present: [...previous.present, element] })); setSelectedId(id); (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    }
  };
  const onCanvasMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drawing.current) return;
    const point = getPoint(event); const item = drawing.current;
    let patch: Partial<PdfEditorElement>;
    if (item.type === "draw") patch = { points: [...(item.points ?? []), point.x, point.y] };
    else patch = { width: Math.max(1, point.x - item.x), height: Math.max(1, point.y - item.y) };
    drawing.current = { ...item, ...patch };
    updateElement(item.id, patch);
  };
  const onCanvasUp = () => { if (!drawing.current) return; const base = drawingBase.current; setHistory((previous) => ({ past: base ? [...previous.past, base] : previous.past, present: previous.present, future: [] })); drawing.current = null; drawingBase.current = null; };
  const beginDrag = (event: PointerEvent<HTMLDivElement>, element: PdfEditorElement) => { if (tool !== "select") return; event.stopPropagation(); const point = getPoint(event); dragState.current = { id: element.id, startX: point.x, startY: point.y, originX: element.x, originY: element.y, base: elements }; setSelectedId(element.id); (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId); };
  const dragElement = (event: PointerEvent<HTMLDivElement>) => { const drag = dragState.current; if (!drag) return; const point = getPoint(event); updateElement(drag.id, { x: Math.max(0, drag.originX + point.x - drag.startX), y: Math.max(0, drag.originY + point.y - drag.startY) }); };
  const finishDrag = () => { const drag = dragState.current; if (drag) { setHistory((previous) => ({ past: [...previous.past, drag.base], present: previous.present, future: [] })); dragState.current = null; } };
  const selectSignature = async (event: ChangeEvent<HTMLInputElement>) => { const image = event.target.files?.[0]; if (!image) return; if (!/^image\/(png|jpeg)$/.test(image.type)) { setError("Please choose a PNG or JPG image."); return; } setSignatureData(await new Promise<string>((resolve) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.readAsDataURL(image); })); setTool("signature"); };
  const selectFont = async (event: ChangeEvent<HTMLInputElement>) => { const font = event.target.files?.[0]; if (font) setFontBytes(new Uint8Array(await font.arrayBuffer())); };

  const exportPdf = async () => {
    if (!pdfBytes || !file) return;
    setLoading(true); setError("");
    try {
      const document = await PDFDocument.load(pdfBytes.slice()); document.registerFontkit(fontkit);
      const hasChinese = elements.some((element) => element.type === "text" && hasCjk(element.text ?? ""));
      if (hasChinese && !fontBytes) throw new Error(copyText.cjkError);
      const embeddedFont = fontBytes ? await document.embedFont(fontBytes) : await document.embedFont(StandardFonts.Helvetica);
      for (const element of elements) {
        const target = document.getPage(element.pageIndex); const { height } = target.getSize(); const color = hexToRgb(element.color);
        if (element.type === "text") target.drawText(element.text || "Text", { x: element.x, y: topLeftToPdfLibY(height, element.y, element.fontSize ?? 16), size: element.fontSize ?? 16, font: embeddedFont, color });
        if (element.type === "rectangle") target.drawRectangle({ x: element.x, y: topLeftToPdfLibY(height, element.y, element.height), width: element.width ?? 1, height: element.height ?? 1, borderColor: color, borderWidth: 2, opacity: element.opacity ?? 1 });
        if (element.type === "highlight") target.drawRectangle({ x: element.x, y: topLeftToPdfLibY(height, element.y, element.height), width: element.width ?? 1, height: element.height ?? 1, color, opacity: element.opacity ?? .34 });
        if (element.type === "draw") for (let index = 0; index < (element.points?.length ?? 0) - 2; index += 2) target.drawLine({ start: { x: element.points![index], y: height - element.points![index + 1] }, end: { x: element.points![index + 2], y: height - element.points![index + 3] }, thickness: 2, color });
        if (element.type === "signature" && element.imageData) { const imageBytes = await fetch(element.imageData).then((response) => response.arrayBuffer()); const image = element.imageData.startsWith("data:image/png") ? await document.embedPng(imageBytes) : await document.embedJpg(imageBytes); target.drawImage(image, { x: element.x, y: topLeftToPdfLibY(height, element.y, element.height), width: element.width ?? 150, height: element.height ?? 60 }); }
      }
      const bytes = await document.save(); const url = URL.createObjectURL(new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" })); setResult({ url, name: `${fileBase(file.name)}-edited.pdf` });
    } catch (exportError) { setError(exportError instanceof Error ? exportError.message : copyText.error); } finally { setLoading(false); }
  };

  const toolbar = [
    ["select", copyText.select], ["text", copyText.text], ["draw", copyText.draw], ["highlight", copyText.highlight], ["rectangle", copyText.rectangle], ["signature", copyText.signature],
  ] as const;
  const reset = () => { if (result) URL.revokeObjectURL(result.url); setResult(null); setFile(null); setPdfBytes(null); void pdf?.destroy?.(); setPdf(null); setHistory(createEditorHistory()); setSelectedId(null); };
  if (result) return <main id="top"><Header language={language} onLanguageChange={changeLanguage} copy={{ navigation: copyText.navigation, languageLabel: copyText.languageLabel }} /><section className="conversion-result section-shell"><span className="result-check">✓</span><p className="label">PDF EDITOR</p><h1>{copyText.result}</h1><p>{copyText.resultText}</p><a className="button button-primary" href={result.url} download={result.name}>{copyText.downloadEdited} <ArrowRight /></a><button className="result-reset" onClick={reset}>{copyText.editAnother}</button></section><Footer copy={copyText.footer} /></main>;

  return <main id="top"><Header language={language} onLanguageChange={changeLanguage} copy={{ navigation: copyText.navigation, languageLabel: copyText.languageLabel }} />
    <section className="pdf-editor section-shell"><a className="back-link" href={`/?lang=${language}#tools`}>← {copyText.back}</a><p className="label">{copyText.label}</p><h1>{copyText.title}</h1><p className="converter-intro">{copyText.intro}</p>
      {!pdf && <label className="upload-panel editor-upload" onDragOver={(event) => event.preventDefault()} onDrop={(event: DragEvent<HTMLLabelElement>) => { event.preventDefault(); void openFile(event.dataTransfer.files[0] ?? null); }}><input type="file" accept="application/pdf,.pdf" onChange={(event) => void openFile(event.target.files?.[0] ?? null)} /><span className="upload-icon">↑</span><strong>{copyText.drop}</strong><span>{copyText.hint}</span><em>{copyText.choose}</em></label>}
      {loading && <p className="editor-status">{copyText.loading}</p>}{error && <p className="converter-error">{error}</p>}
      {pdf && <div className="editor-workspace">
        <div className="editor-toolbar" role="toolbar" aria-label="PDF editor tools">{toolbar.map(([nextTool, label]) => nextTool === "signature" ? <label className={`editor-tool ${tool === nextTool ? "active" : ""}`} key={nextTool} title={label}><input type="file" accept="image/png,image/jpeg" onChange={(event) => void selectSignature(event)} />{label}</label> : <button key={nextTool} className={`editor-tool ${tool === nextTool ? "active" : ""}`} onClick={() => setTool(nextTool)} aria-pressed={tool === nextTool}>{label}</button>)}<span className="toolbar-spacer" /><button className="editor-tool" onClick={() => setHistory((value) => undoEditorHistory(value))} disabled={!history.past.length}>{copyText.undo}</button><button className="editor-tool" onClick={() => setHistory((value) => redoEditorHistory(value))} disabled={!history.future.length}>{copyText.redo}</button><button className="editor-tool" onClick={() => setZoom((value) => Math.max(.5, value - .15))}>{copyText.zoomOut}</button><button className="editor-tool" onClick={() => setZoom((value) => Math.min(2.5, value + .15))}>{copyText.zoomIn}</button><button className="editor-tool" onClick={() => setZoom(Math.min(1.3, (Math.max(380, (canvasShell.current?.parentElement?.clientWidth ?? 800) - 40)) / pageSize.width))}>{copyText.fit}</button><button className="button button-primary editor-download" onClick={() => void exportPdf()} disabled={loading}>{copyText.download}</button></div>
        <aside className="editor-thumbnails" aria-label="PDF pages">{Array.from({ length: pdf.numPages }, (_, index) => <EditorThumbnail key={index} pdf={pdf} index={index} active={pageIndex === index} onClick={() => setPageIndex(index)} label={`${copyText.page} ${index + 1}`} />)}</aside>
        <div className="editor-stage"><div className="editor-page-wrap" ref={canvasShell} style={{ width: pageSize.width * zoom, height: pageSize.height * zoom }} onPointerDown={onCanvasDown} onPointerMove={onCanvasMove} onPointerUp={onCanvasUp}><canvas ref={pageCanvas} /> <div className="editor-overlay">{currentElements.map((element) => <EditorElement key={element.id} element={element} selected={element.id === selectedId} zoom={zoom} onPointerDown={(event) => beginDrag(event, element)} onPointerMove={dragElement} onPointerUp={finishDrag} />)}</div></div><p className="editor-page-indicator">{copyText.page} {pageIndex + 1} / {pdf.numPages} · {Math.round(zoom * 100)}%</p></div>
        <aside className="editor-properties"><h2>{copyText.properties}</h2>{selected ? <><label>{selected.type === "text" ? copyText.textContent : copyText.colour}<input value={selected.type === "text" ? selected.text ?? "" : selected.color ?? "#FF4FA3"} type={selected.type === "text" ? "text" : "color"} onChange={(event) => updateElement(selected.id, selected.type === "text" ? { text: event.target.value } : { color: event.target.value })} onBlur={() => commit(elements)} /></label>{selected.type === "text" && <label>{copyText.fontSize}<input type="number" min="8" max="72" value={selected.fontSize ?? 16} onChange={(event) => updateElement(selected.id, { fontSize: Number(event.target.value) })} onBlur={() => commit(elements)} /></label>}{selected.type !== "draw" && selected.type !== "text" && <><label>{copyText.width}<input type="number" min="1" value={Math.round(selected.width ?? 1)} onChange={(event) => updateElement(selected.id, { width: Number(event.target.value) })} onBlur={() => commit(elements)} /></label><label>{copyText.height}<input type="number" min="1" value={Math.round(selected.height ?? 1)} onChange={(event) => updateElement(selected.id, { height: Number(event.target.value) })} onBlur={() => commit(elements)} /></label></>}<button className="editor-delete" onClick={() => { commit(elements.filter((element) => element.id !== selected.id)); setSelectedId(null); }}>{copyText.remove}</button></> : <p>{copyText.noSelection}</p>}<label className="editor-font-upload">{copyText.font}<input type="file" accept=".ttf,.otf,font/ttf,font/otf" onChange={(event) => void selectFont(event)} /><small>{fontBytes ? "✓ Font ready" : copyText.fontHint}</small></label></aside>
      </div>}
      <p className="converter-privacy">{copyText.privacy}</p>
    </section><Footer copy={copyText.footer} /></main>;
}

function EditorElement({ element, selected, zoom, onPointerDown, onPointerMove, onPointerUp }: { element: PdfEditorElement; selected: boolean; zoom: number; onPointerDown: (event: PointerEvent<HTMLDivElement>) => void; onPointerMove: (event: PointerEvent<HTMLDivElement>) => void; onPointerUp: () => void }) {
  const style = { left: element.x * zoom, top: element.y * zoom, width: (element.width ?? 1) * zoom, height: (element.height ?? 1) * zoom };
  if (element.type === "draw") { const points = element.points ?? []; return <svg className={`pdf-overlay-item pdf-draw ${selected ? "selected" : ""}`} style={{ left: 0, top: 0, width: "100%", height: "100%", pointerEvents: "none" }}><polyline points={points.reduce<string>((value, point, index) => `${value}${index % 2 ? "," : " "}${point * zoom}`, "")} fill="none" stroke={element.color} strokeWidth="2" /></svg>; }
  if (element.type === "text") return <div className={`pdf-overlay-item pdf-text ${selected ? "selected" : ""}`} style={{ ...style, color: element.color, fontSize: (element.fontSize ?? 16) * zoom }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>{element.text || "Text"}</div>;
  if (element.type === "signature") return <img className={`pdf-overlay-item pdf-signature ${selected ? "selected" : ""}`} src={element.imageData} alt="Signature" style={style} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} />;
  return <div className={`pdf-overlay-item pdf-${element.type} ${selected ? "selected" : ""}`} style={{ ...style, borderColor: element.color, background: element.type === "highlight" ? element.color : "transparent", opacity: element.type === "highlight" ? element.opacity : 1 }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} />;
}

function EditorThumbnail({ pdf, index, active, onClick, label }: { pdf: PdfJsDocument; index: number; active: boolean; onClick: () => void; label: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => { let cancelled = false; void (async () => { const page = await pdf.getPage(index + 1); const viewport = page.getViewport({ scale: .16 }); if (cancelled || !canvas.current) return; canvas.current.width = viewport.width; canvas.current.height = viewport.height; await page.render({ canvasContext: canvas.current.getContext("2d")!, viewport }).promise; })(); return () => { cancelled = true; }; }, [pdf, index]);
  return <button className={active ? "active" : ""} onClick={onClick}><canvas ref={canvas} /><span>{label}</span></button>;
}
