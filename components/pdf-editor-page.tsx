"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

type Language = "en" | "zh-CN";
const text = {
  en: { navigation: { blog: "Blog", computer: "Computer tools", pdf: "PDF", images: "Image tools", business: "Business tools" }, languageLabel: "Choose language", back: "All tools", label: "PDF EDITOR", title: "Edit a PDF online.", intro: "Add text to a page, then download your updated PDF.", drop: "Choose a PDF to edit", hint: "PDF files up to 20 MB", choose: "Choose PDF", textLabel: "Text to add", textPlaceholder: "Type your note here…", pageLabel: "Page", xLabel: "Horizontal position", yLabel: "Vertical position", apply: "Add text & download", processing: "Preparing PDF…", privacy: "Editing happens in your browser. Your PDF is not uploaded.", error: "We could not open that PDF. Please try another file.", footer: { tagline: "Thoughtful tools and ideas for a more capable day.", rights: "All rights reserved.", privacy: "Privacy", terms: "Terms", contact: "Contact" } },
  "zh-CN": { navigation: { blog: "博客", computer: "计算机工具", pdf: "PDF", images: "图片工具", business: "商业工具" }, languageLabel: "选择语言", back: "全部工具", label: "PDF 编辑器", title: "在线编辑 PDF。", intro: "在页面上添加文字，然后下载更新后的 PDF。", drop: "选择要编辑的 PDF", hint: "支持最大 20 MB 的 PDF 文件", choose: "选择 PDF", textLabel: "添加的文字", textPlaceholder: "在这里输入你的文字…", pageLabel: "页面", xLabel: "水平位置", yLabel: "垂直位置", apply: "添加文字并下载", processing: "正在处理 PDF…", privacy: "编辑在你的浏览器中完成，PDF 不会被上传。", error: "无法打开该 PDF，请换一个文件重试。", footer: { tagline: "让每一天都更有能力的实用工具与想法。", rights: "保留所有权利。", privacy: "隐私", terms: "条款", contact: "联系" } },
} as const;

export function PdfEditorPage() {
  const [language, setLanguage] = useState<Language>("en");
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState(0);
  const [note, setNote] = useState("");
  const [page, setPage] = useState(1);
  const [x, setX] = useState(15);
  const [y, setY] = useState(15);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const copy = text[language];

  useEffect(() => { const requested = new URLSearchParams(window.location.search).get("lang"); const saved = window.localStorage.getItem("knightwisdom-language") as Language | null; const initial = requested === "en" || requested === "zh-CN" ? requested : saved ?? (navigator.language.toLowerCase().startsWith("zh") ? "zh-CN" : "en"); document.documentElement.lang = initial; setLanguage(initial); }, []);
  const changeLanguage = (next: Language) => { window.localStorage.setItem("knightwisdom-language", next); document.documentElement.lang = next; window.history.replaceState(null, "", `${window.location.pathname}?lang=${next}`); setLanguage(next); };
  const selectFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null; setFile(nextFile); setError(""); setPages(0);
    if (!nextFile) return;
    try { const pdf = await PDFDocument.load(await nextFile.arrayBuffer()); setPages(pdf.getPageCount()); setPage(1); } catch { setError(copy.error); }
  };
  const save = async () => {
    if (!file || !note.trim()) return;
    setWorking(true); setError("");
    try {
      const pdf = await PDFDocument.load(await file.arrayBuffer()); const target = pdf.getPage(Math.min(Math.max(page - 1, 0), pdf.getPageCount() - 1)); const font = await pdf.embedFont(StandardFonts.Helvetica); const size = 14; const { width, height } = target.getSize();
      target.drawText(note.trim(), { x: width * (x / 100), y: height * (y / 100), size, font, color: rgb(0.86, 0.84, 1) });
      const blob = new Blob([await pdf.save()], { type: "application/pdf" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `${file.name.replace(/\.pdf$/i, "")}-edited.pdf`; link.click(); URL.revokeObjectURL(url);
    } catch { setError(copy.error); } finally { setWorking(false); }
  };
  return <main id="top"><Header language={language} onLanguageChange={changeLanguage} copy={{ navigation: copy.navigation, languageLabel: copy.languageLabel }} /><section className="editor-page section-shell"><a className="back-link" href={`/?lang=${language}#tools`}>← {copy.back}</a><p className="label">{copy.label}</p><h1>{copy.title}</h1><p className="converter-intro">{copy.intro}</p><label className={`upload-panel ${file ? "has-file" : ""}`}><input type="file" accept=".pdf,application/pdf" onChange={selectFile} /><span className="upload-icon">↑</span><strong>{file ? file.name : copy.drop}</strong><span>{file ? `${pages} ${copy.pageLabel.toLowerCase()}${pages === 1 ? "" : "s"}` : copy.hint}</span><em>{copy.choose}</em></label>{file && <div className="editor-controls"><label>{copy.textLabel}<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder={copy.textPlaceholder} /></label><label>{copy.pageLabel}<input type="number" min="1" max={pages || 1} value={page} onChange={(event) => setPage(Number(event.target.value))} /></label><label>{copy.xLabel}<input type="range" min="0" max="90" value={x} onChange={(event) => setX(Number(event.target.value))} /></label><label>{copy.yLabel}<input type="range" min="0" max="90" value={y} onChange={(event) => setY(Number(event.target.value))} /></label></div>}{error && <p className="converter-error">{error}</p>}<button className="button button-primary convert-button" disabled={!file || !note.trim() || working} onClick={save}>{working ? copy.processing : copy.apply}</button><p className="converter-privacy">{copy.privacy}</p></section><Footer copy={copy.footer} /></main>;
}
