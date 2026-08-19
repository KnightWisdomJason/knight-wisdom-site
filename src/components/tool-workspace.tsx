"use client";
import { useMemo, useState } from "react";
import { convertCase, decodeBase64, encodeBase64, formatJson, getTextStats } from "@/lib/transformations";
import type { Tool } from "@/lib/tools";
import { usePreferences } from "@/components/preferences";
import { DocumentConverter } from "@/components/document-converter";

const cases = [["upper", "UPPERCASE"], ["lower", "lowercase"], ["title", "Title Case"], ["sentence", "Sentence case"], ["camel", "camelCase"], ["pascal", "PascalCase"], ["snake", "snake_case"], ["kebab", "kebab-case"]] as const;
export function ToolWorkspace({ tool }: { tool: Tool }) {
  if (tool.slug === "word-to-pdf" || tool.slug === "pdf-to-word") return <DocumentConverter tool={tool} />;
  return <TextWorkspace tool={tool} />;
}
function TextWorkspace({ tool }: { tool: Tool }) {
  const { t } = usePreferences(); const [input, setInput] = useState(""); const [output, setOutput] = useState(""); const [status, setStatus] = useState<string | null>(null); const stats = useMemo(() => getTextStats(input), [input]);
  const clear = () => { setInput(""); setOutput(""); setStatus(null); };
  const copy = async (value: string) => { if (!value) return; await navigator.clipboard.writeText(value); setStatus("Copied to clipboard."); };
  const runJson = (minify = false, validateOnly = false) => { try { const result = formatJson(input, minify); setOutput(validateOnly ? result : result); setStatus("Valid JSON."); } catch (error) { setOutput(""); setStatus(error instanceof Error ? `Invalid JSON: ${error.message}` : "Invalid JSON."); } };
  const runBase64 = (decode = false) => { try { setOutput(decode ? decodeBase64(input) : encodeBase64(input)); setStatus(null); } catch (error) { setOutput(""); setStatus(error instanceof Error ? error.message : "Unable to decode Base64."); } };
  const isCounter = tool.slug === "word-counter" || tool.slug === "character-counter";
  return <section className="workspace"><div className="workspace-top"><label htmlFor="tool-input">{t("Your text", "输入内容")}</label><div className="action-row"><button type="button" className="text-button" onClick={() => navigator.clipboard.readText().then(setInput).catch(() => setStatus(t("Paste is unavailable in this browser.", "当前浏览器无法读取剪贴板。")))}>{t("Paste", "粘贴")}</button><button type="button" className="text-button" onClick={clear}>{t("Clear", "清除")}</button></div></div><textarea id="tool-input" value={input} onChange={(event) => setInput(event.target.value)} placeholder={tool.slug.startsWith("json") ? '{"hello":"world"}' : t("Type or paste here...", "在这里输入或粘贴...")} spellCheck={false} />
    {isCounter && <div className="stats">{tool.slug === "word-counter" ? <><Stat label="Words" value={stats.words}/><Stat label="Characters" value={stats.characters}/><Stat label="Without spaces" value={stats.charactersWithoutSpaces}/><Stat label="Sentences" value={stats.sentences}/><Stat label="Paragraphs" value={stats.paragraphs}/><Stat label="Reading time" value={stats.words ? `${stats.readingMinutes} min` : "0 min"}/></> : <><Stat label="Characters" value={stats.characters}/><Stat label="Without spaces" value={stats.charactersWithoutSpaces}/><Stat label="Words" value={stats.words}/><Stat label="Lines" value={stats.lines}/></>}</div>}
    {tool.slug === "case-converter" && <div className="case-actions">{cases.map(([kind, label]) => <button type="button" key={kind} onClick={() => { setOutput(convertCase(input, kind)); setStatus(null); }}>{label}</button>)}</div>}
    {tool.slug.startsWith("json") && <div className="primary-actions"><button type="button" className="primary" onClick={() => runJson(false, tool.slug === "json-validator")}>{tool.slug === "json-validator" ? "Validate JSON" : "Format JSON"}</button><button type="button" onClick={() => runJson(true)}>Minify</button></div>}
    {tool.slug === "base64" && <div className="primary-actions"><button type="button" className="primary" onClick={() => runBase64(false)}>Encode to Base64</button><button type="button" onClick={() => runBase64(true)}>Decode Base64</button></div>}
    {!isCounter && <><div className="workspace-top output-label"><label htmlFor="tool-output">{t("Result", "结果")}</label><button type="button" className="text-button" onClick={() => copy(output)}>{t("Copy result", "复制结果")}</button></div><textarea id="tool-output" value={output} placeholder={t("Your result will appear here...", "结果将显示在这里...")} readOnly spellCheck={false} /></>}
    <p className={`status ${status?.startsWith("Invalid") || status?.startsWith("Please") ? "error" : ""}`} aria-live="polite">{status || t("Processed locally in your browser.", "在你的浏览器本地处理。")}</p>
  </section>;
}
function Stat({ label, value }: { label: string; value: string | number }) { return <div><strong>{value}</strong><span>{label}</span></div>; }
