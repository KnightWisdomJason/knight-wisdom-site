"use client";
import Link from "next/link";
import { usePreferences } from "@/components/preferences";
export function SiteFooter() { const { t } = usePreferences(); return <footer className="site-footer"><Link className="brand" href="/"><span>✦</span> KnightWisdom</Link><p>{t("Fast, free, privacy-friendly online tools.", "快速、免费、重视隐私的在线工具。")}</p><nav><Link href="/about">{t("About", "关于我们")}</Link><Link href="/privacy">{t("Privacy", "隐私")}</Link><Link href="/terms">{t("Terms", "条款")}</Link><Link href="/contact">{t("Contact", "联系")}</Link></nav></footer>; }
