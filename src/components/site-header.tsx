"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
export function SiteHeader() {
  const router = useRouter(); const pathname = usePathname(); const params = useSearchParams(); const [language, setLanguage] = useState("en");
  const search = (value: string) => { const next = new URLSearchParams(); if (value.trim()) next.set("q", value); router.replace(`/?${next.toString()}`, { scroll: false }); };
  const chooseLanguage = (value: string) => { setLanguage(value); window.localStorage.setItem("kw-language", value); document.documentElement.lang = value === "zh" ? "zh-CN" : "en"; };
  return <header className="site-header"><Link className="brand" href="/"><span>✦</span> KnightWisdom</Link><div className="header-search"><label className="sr-only" htmlFor="header-tool-search">Search tools</label><span aria-hidden="true">⌕</span><input id="header-tool-search" value={params.get("q") || ""} onChange={(event) => search(event.target.value)} placeholder="Search tools..." /></div><nav aria-label="Primary navigation"><Link className={pathname === "/" ? "selected" : ""} href="/">All tools</Link><Link href="/#text">Text</Link><Link href="/#developer">Developer</Link></nav><label className="language-select"><span className="sr-only">Language</span><select value={language} onChange={(event) => chooseLanguage(event.target.value)} aria-label="Language"><option value="en">English</option><option value="zh">中文</option></select></label></header>;
}
