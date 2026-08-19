"use client";
import { Suspense } from "react";
import { ToolDirectory } from "@/components/tool-directory";
import { tools } from "@/lib/tools";
import { usePreferences } from "@/components/preferences";
import { DirectoryIntro } from "@/components/directory-intro";
export default function Home() { const { t } = usePreferences(); return <main><DirectoryIntro /><Suspense fallback={<div className="directory" />}><ToolDirectory tools={tools} /></Suspense><section className="trust-grid" aria-label={t("Why use KnightWisdom Tools", "为什么选择 KnightWisdom Tools")}><article><h2>{t("Fast by design", "快速易用")}</h2><p>{t("Open a tool, paste your content, and get the result immediately.", "打开工具、粘贴内容，即刻获得结果。")}</p></article><article><h2>{t("Privacy-friendly", "注重隐私")}</h2><p>{t("The current text and developer tools process your input locally in your browser.", "当前文本和开发工具会在你的浏览器本地处理输入。")}</p></article><article><h2>{t("Free to use", "免费使用")}</h2><p>{t("No account, download, or complicated setup is needed for these everyday tools.", "这些日常工具无需注册、下载或复杂设置。")}</p></article></section></main>; }
