"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ArrowRight } from "@/components/icons";

type Language = "en" | "zh-CN";
type ConverterKind = "pdf-to-word" | "word-to-pdf";

const copy = {
  en: {
    navigation: { blog: "Blog", computer: "Computer tools", pdf: "PDF", images: "Image tools", business: "Business tools" }, languageLabel: "Choose language",
    uploadLabel: "SELECT A FILE", drop: "Drop your file here", choose: "Choose file", supported: "or choose a file from your device", convert: "Convert now", converting: "Converting…", another: "Convert another file", privacy: "Your file is processed for conversion and is not kept after the request is complete.", back: "All tools", error: "We could not convert that file. Please check the file and try again.", footer: { tagline: "Thoughtful tools and ideas for a more capable day.", rights: "All rights reserved.", privacy: "Privacy", terms: "Terms", contact: "Contact" },
    "pdf-to-word": { title: "PDF to Word", intro: "Turn a PDF into an editable Word document.", fileHint: "PDF files up to 20 MB", accept: ".pdf,application/pdf" },
    "word-to-pdf": { title: "Word to PDF", intro: "Convert a Word document into a clean, shareable PDF.", fileHint: "DOC and DOCX files up to 20 MB", accept: ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  },
  "zh-CN": {
    navigation: { blog: "博客", computer: "计算机工具", pdf: "PDF", images: "图片工具", business: "商业工具" }, languageLabel: "选择语言",
    uploadLabel: "选择文件", drop: "将文件拖放到这里", choose: "选择文件", supported: "或从你的设备中选择文件", convert: "开始转换", converting: "正在转换…", another: "转换另一个文件", privacy: "文件仅用于完成本次转换，请求结束后不会保留。", back: "全部工具", error: "暂时无法转换该文件，请检查文件后重试。", footer: { tagline: "让每一天都更有能力的实用工具与想法。", rights: "保留所有权利。", privacy: "隐私", terms: "条款", contact: "联系" },
    "pdf-to-word": { title: "PDF 转 Word", intro: "将 PDF 转为可编辑的 Word 文档。", fileHint: "支持最大 20 MB 的 PDF 文件", accept: ".pdf,application/pdf" },
    "word-to-pdf": { title: "Word 转 PDF", intro: "将 Word 文档转换为清晰、便于分享的 PDF。", fileHint: "支持最大 20 MB 的 DOC 和 DOCX 文件", accept: ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  },
} as const;

export function ConverterPage({ kind }: { kind: ConverterKind }) {
  const [language, setLanguage] = useState<Language>("en");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "converting" | "error">("idle");
  const [error, setError] = useState("");
  const text = copy[language];
  const tool = text[kind];

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("lang");
    const saved = window.localStorage.getItem("knightwisdom-language") as Language | null;
    const initial = requested === "en" || requested === "zh-CN" ? requested : saved ?? (navigator.language.toLowerCase().startsWith("zh") ? "zh-CN" : "en");
    document.documentElement.lang = initial;
    setLanguage(initial);
  }, []);

  const changeLanguage = (next: Language) => { window.localStorage.setItem("knightwisdom-language", next); document.documentElement.lang = next; window.history.replaceState(null, "", `${window.location.pathname}?lang=${next}`); setLanguage(next); };
  const selectFile = (event: ChangeEvent<HTMLInputElement>) => { setFile(event.target.files?.[0] ?? null); setStatus("idle"); setError(""); };

  const convert = async () => {
    if (!file) return;
    setStatus("converting");
    const body = new FormData();
    body.append("file", file);
    body.append("kind", kind);
    try {
      const response = await fetch("/api/convert", { method: "POST", body });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error([result?.error, result?.details].filter(Boolean).join("\n\n") || "Conversion failed");
      }
      const download = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = download;
      link.download = response.headers.get("x-output-filename") ?? `${file.name}.converted`;
      link.click();
      URL.revokeObjectURL(download);
      setStatus("idle");
    } catch (conversionError) { setError(conversionError instanceof Error ? conversionError.message : text.error); setStatus("error"); }
  };

  return <main id="top"><Header language={language} onLanguageChange={changeLanguage} copy={{ navigation: text.navigation, languageLabel: text.languageLabel }} />
    <section className="converter-page section-shell"><a className="back-link" href={`/?lang=${language}#tools`}>← {text.back}</a><p className="label">{text.uploadLabel}</p><h1>{tool.title}</h1><p className="converter-intro">{tool.intro}</p>
      <label className={`upload-panel ${file ? "has-file" : ""}`}><input type="file" accept={tool.accept} onChange={selectFile} /><span className="upload-icon">↑</span><strong>{file ? file.name : text.drop}</strong><span>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : text.supported}</span><em>{text.choose}</em></label>
      <p className="file-hint">{tool.fileHint}</p>{status === "error" && <p className="converter-error">{error || text.error}</p>}
      <button className="button button-primary convert-button" disabled={!file || status === "converting"} onClick={convert}>{status === "converting" ? text.converting : text.convert} <ArrowRight /></button>
      <p className="converter-privacy">{text.privacy}</p>
    </section><Footer copy={text.footer} /></main>;
}
