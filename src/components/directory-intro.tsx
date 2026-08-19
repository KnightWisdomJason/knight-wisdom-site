"use client";
import { usePreferences } from "@/components/preferences";
export function DirectoryIntro() { const { t } = usePreferences(); return <section className="directory-intro"><h1>{t("Everyday online tools, all in one place.", "日常在线工具，尽在一处。")}</h1><p>{t("Fast, free and privacy-friendly tools for text, code and everyday tasks.", "为文本、代码和日常任务打造的快速、免费、重视隐私的在线工具。")}</p></section>; }
