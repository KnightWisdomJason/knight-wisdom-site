"use client";

import { useEffect, useState } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { CategoryCard } from "@/components/category-card";
import { GuideCard } from "@/components/guide-card";
import { ArrowRight, Check, Sparkles } from "@/components/icons";

type Language = "en" | "zh-CN";

const content = {
  en: {
    navigation: { tools: "Tools", guides: "Guides", about: "About" }, languageLabel: "Choose language", exploreTools: "Explore tools",
    eyebrow: "A smarter place to get things done", title: <>Tools for the task.<br /><em>Ideas for what&apos;s next.</em></>,
    intro: "Knight Wisdom brings practical online tools together with clear guides, thoughtful commentary, and useful explainers for work, business, and everyday life.",
    primaryCta: "Browse the guides", secondaryCta: "Explore tools", proof: "Useful now. Built to grow with you.",
    contentLabel: "THE JOURNAL", contentTitle: "Learn, make sense of it, move forward.", contentText: "Start with practical tool tutorials today. Soon, you&apos;ll also find timely commentary and clear explainers on the topics worth understanding.", browse: "Browse all posts", readGuide: "Read guide",
    guides: [
      { category: "TOOL TUTORIAL", title: "How to choose the right online tool for a task", time: "6 min read" },
      { category: "PRACTICAL WORK", title: "A simple workflow for handling everyday files", time: "5 min read" },
      { category: "COMING SOON", title: "Clear perspectives on the topics people are talking about", time: "New series" },
    ],
    toolsLabel: "THE TOOLBOX", toolsTitle: "Find a useful shortcut.", viewAll: "View all tools", categories: [
      { icon: "▣", title: "PDF Tools", description: "Simple, secure ways to work with your documents.", tools: ["Merge & split", "Compress", "Convert"] },
      { icon: "◒", title: "Image Tools", description: "Prepare images that look great and load fast.", tools: ["Compress", "Resize", "Convert"] },
      { icon: "↗", title: "Business Tools", description: "Make clearer decisions with practical calculators.", tools: ["Profit margin", "ROI", "Break-even"] },
      { icon: "⌘", title: "Developer Tools", description: "Small utilities that keep your workflow moving.", tools: ["JSON formatter", "UUID", "Base64"] },
    ],
    aboutLabel: "WHY KNIGHT WISDOM", aboutTitle: <>Less noise.<br />More progress.</>, aboutText: "A growing home for the useful things that make work and learning feel lighter.", benefits: [["Free to use", "The essentials should be easy to access."], ["Privacy minded", "Your files and data deserve careful handling."], ["Made for momentum", "No clutter—just useful tools when you need them."]],
    contactLabel: "LET&apos;S WORK TOGETHER", contactTitle: "Have an idea, partnership, or useful resource to share?", contactText: "We&apos;re building Knight Wisdom carefully and would love to hear from people who want to make it more useful.", contactCta: "Email Knight Wisdom",
    footer: { tagline: "Thoughtful tools and ideas for a more capable day.", collaboration: "Collaborate with us", rights: "All rights reserved.", privacy: "Privacy", terms: "Terms", contact: "Contact" },
  },
  "zh-CN": {
    navigation: { tools: "工具", guides: "文章", about: "关于我们" }, languageLabel: "选择语言", exploreTools: "浏览工具",
    eyebrow: "更聪明地完成每一件事", title: <>为任务准备工具。<br /><em>为下一步带来思路。</em></>,
    intro: "Knight Wisdom 将实用在线工具与清晰指南、深度点评和知识讲解汇集在一起，服务于工作、商业和日常生活中的每一个实际问题。",
    primaryCta: "阅读文章", secondaryCta: "浏览工具", proof: "现在就有用，并会随你一起成长。",
    contentLabel: "内容专栏", contentTitle: "学习、看懂、继续前进。", contentText: "现在从实用工具教程开始；未来还会有针对热门话题的及时点评，以及值得深入了解的清晰讲解。", browse: "浏览全部文章", readGuide: "阅读文章",
    guides: [
      { category: "工具教程", title: "如何为手头的任务选择合适的在线工具", time: "6 分钟阅读" },
      { category: "实用工作", title: "处理日常文件的一套简单工作流", time: "5 分钟阅读" },
      { category: "即将推出", title: "用清晰的观点解读大家正在讨论的话题", time: "新栏目" },
    ],
    toolsLabel: "工具箱", toolsTitle: "找到一个实用捷径。", viewAll: "查看全部工具", categories: [
      { icon: "▣", title: "PDF 工具", description: "以简单、安全的方式处理你的文档。", tools: ["合并与拆分", "压缩", "转换"] },
      { icon: "◒", title: "图片工具", description: "让图片兼顾美观、体积与加载速度。", tools: ["压缩", "调整尺寸", "转换"] },
      { icon: "↗", title: "商业工具", description: "用实用计算器做出更清晰的决策。", tools: ["利润率", "投资回报率", "盈亏平衡"] },
      { icon: "⌘", title: "开发工具", description: "让工作流程持续顺畅的小型工具。", tools: ["JSON 格式化", "UUID", "Base64"] },
    ],
    aboutLabel: "为什么是 KNIGHT WISDOM", aboutTitle: <>更少杂音。<br />更多进展。</>, aboutText: "一个不断成长的空间，汇集让工作和学习都更轻松的实用资源。", benefits: [["免费使用", "基础且重要的工具应当易于获得。"], ["注重隐私", "你的文件和数据值得被认真对待。"], ["保持前进", "没有杂乱，只有需要时就能使用的工具。"]],
    contactLabel: "一起合作", contactTitle: "有想法、合作机会，或有价值的资源想分享？", contactText: "我们正在认真打造 Knight Wisdom，期待与同样希望让它更有用的人交流。", contactCta: "邮件联系 Knight Wisdom",
    footer: { tagline: "让每一天都更有能力的实用工具与想法。", collaboration: "与我们合作", rights: "保留所有权利。", privacy: "隐私", terms: "条款", contact: "联系" },
  },
} as const;

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const copy = content[language];

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("knightwisdom-language") as Language | null;
    const initialLanguage = savedLanguage ?? (navigator.language.toLowerCase().startsWith("zh") ? "zh-CN" : "en");
    document.documentElement.lang = initialLanguage;
    setLanguage(initialLanguage);
  }, []);

  const changeLanguage = (nextLanguage: Language) => {
    window.localStorage.setItem("knightwisdom-language", nextLanguage);
    document.documentElement.lang = nextLanguage;
    setLanguage(nextLanguage);
  };

  return (
    <main id="top">
      <Header language={language} onLanguageChange={changeLanguage} copy={{ navigation: copy.navigation, languageLabel: copy.languageLabel, exploreTools: copy.exploreTools }} />
      <section className="hero section-shell" aria-labelledby="hero-title">
        <div className="hero-glow" aria-hidden="true" />
        <div className="eyebrow"><Sparkles /> {copy.eyebrow}</div>
        <h1 id="hero-title">{copy.title}</h1>
        <p className="hero-copy">{copy.intro}</p>
        <div className="hero-actions">
          <a className="button button-primary" href="#guides">{copy.primaryCta} <ArrowRight /></a>
          <a className="button button-secondary" href="#tools">{copy.secondaryCta}</a>
        </div>
        <div className="hero-proof"><span className="status-dot" /> {copy.proof}</div>
      </section>

      <section className="section-shell content-layout" aria-label={copy.contentTitle}>
        <div className="journal-column" id="guides">
          <div className="column-heading"><p className="label">{copy.contentLabel}</p><h2>{copy.contentTitle}</h2><p>{copy.contentText}</p><a className="text-link" href="#">{copy.browse} <ArrowRight /></a></div>
          <div className="guide-list">{copy.guides.map((guide, index) => <GuideCard key={guide.title} index={index} linkLabel={copy.readGuide} {...guide} />)}</div>
        </div>
        <aside className="tools-column" id="tools">
          <div className="column-heading"><p className="label">{copy.toolsLabel}</p><h2>{copy.toolsTitle}</h2><a className="text-link" href="#">{copy.viewAll} <ArrowRight /></a></div>
          <div className="tool-list">{copy.categories.map((category) => <CategoryCard key={category.title} {...category} />)}</div>
        </aside>
      </section>

      <section className="section-shell value-section" id="about">
        <div className="value-intro"><p className="label">{copy.aboutLabel}</p><h2>{copy.aboutTitle}</h2><p>{copy.aboutText}</p></div>
        <div className="benefit-list">
          {copy.benefits.map(([title, description], index) => <div className="benefit" key={title}><span className="benefit-number">0{index + 1}</span><div><h3><Check /> {title}</h3><p>{description}</p></div></div>)}
        </div>
      </section>

      <section className="section-shell contact-section">
        <p className="label">{copy.contactLabel}</p>
        <div><h2>{copy.contactTitle}</h2><p>{copy.contactText}</p></div>
        <a className="button button-primary" href="mailto:knightwisdomclub@gmail.com">{copy.contactCta} <ArrowRight /></a>
      </section>
      <Footer copy={copy.footer} />
    </main>
  );
}
