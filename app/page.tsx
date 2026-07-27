"use client";

import { useEffect, useState } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { GuideCard } from "@/components/guide-card";
import { ToolCard } from "@/components/tool-card";
import { ArrowRight } from "@/components/icons";

type Language = "en" | "zh-CN";

const content = {
  en: {
    navigation: { blog: "Blog", computer: "Computer tools", documents: "Document tools", images: "Image tools", business: "Business tools" },
    languageLabel: "Choose language",
    categories: ["All tools", "Computer", "Documents", "Images", "Business"],
    toolsLabel: "THE KNIGHT WISDOM TOOLBOX",
    toolsTitle: "A useful tool for every task.",
    toolsText: "Simple, clear tools for the tasks you want to finish quickly. More are on the way.",
    tools: [
      { group: "computer-tools", icon: "⌘", title: "JSON Formatter", description: "Format, validate, and understand JSON instantly." },
      { group: "computer-tools", icon: "#", title: "Password Generator", description: "Create strong passwords in a few seconds." },
      { group: "computer-tools", icon: "◌", title: "QR Code Generator", description: "Turn any link or text into a clean QR code." },
      { group: "computer-tools", icon: "↺", title: "UUID Generator", description: "Generate unique IDs for your projects and data." },
      { group: "document-tools", icon: "▤", title: "Merge PDF", description: "Combine documents into one organized PDF." },
      { group: "document-tools", icon: "⇄", title: "PDF to Word", description: "Turn PDF documents into editable Word files.", href: "/tools/pdf-to-word" },
      { group: "document-tools", icon: "✂", title: "Split PDF", description: "Separate pages into the files you need." },
      { group: "document-tools", icon: "✎", title: "Edit PDF", description: "Add a note to a PDF directly in your browser.", href: "/tools/pdf-editor", badge: "NEW" },
      { group: "document-tools", icon: "≋", title: "Compress PDF", description: "Reduce file size while keeping documents clear." },
      { group: "image-tools", icon: "◒", title: "Image Compressor", description: "Make images lighter without losing their quality." },
      { group: "image-tools", icon: "↔", title: "Image Resizer", description: "Resize images for web, work, and sharing." },
      { group: "image-tools", icon: "▧", title: "Image Converter", description: "Convert between the formats you use every day." },
      { group: "image-tools", icon: "⌑", title: "Image Cropper", description: "Crop an image quickly to the right frame." },
      { group: "business-tools", icon: "%", title: "Profit Margin", description: "Understand margins with a quick calculation." },
      { group: "business-tools", icon: "↗", title: "ROI Calculator", description: "Estimate the return on an investment." },
      { group: "business-tools", icon: "±", title: "Break-even Calculator", description: "See when a business idea reaches break-even." },
      { group: "business-tools", icon: "¤", title: "Invoice Generator", description: "Create a clear invoice for your next client." },
      { group: "computer-tools", icon: "Aa", title: "Word Counter", description: "Count words, characters, and reading time." },
      { group: "document-tools", icon: "▣", title: "Word to PDF", description: "Turn Word documents into clean PDF files.", href: "/tools/word-to-pdf" },
      { group: "image-tools", icon: "✦", title: "Watermark Image", description: "Add a simple watermark to your visual work." },
      { group: "business-tools", icon: "₿", title: "Loan Calculator", description: "Plan repayments with a clear monthly estimate." },
    ],
    blogLabel: "FROM THE BLOG",
    blogTitle: "Helpful ideas, clearly shared.",
    blogText: "Tool tutorials today, with thoughtful explainers and topic commentary to follow.",
    browse: "Browse the blog",
    readGuide: "Read article",
    guides: [
      { category: "TOOL TUTORIAL", title: "How to choose the right online tool for a task", time: "6 min read" },
      { category: "PRACTICAL WORK", title: "A simple workflow for handling everyday files", time: "5 min read" },
      { category: "COMING SOON", title: "Clear perspectives on the topics people are talking about", time: "New series" },
    ],
    contactTitle: "Have an idea, partnership, or useful resource to share?",
    contactText: "Contact Knight Wisdom at knightwisdomclub@gmail.com.",
    contactCta: "Email Knight Wisdom",
    footer: { tagline: "Thoughtful tools and ideas for a more capable day.", rights: "All rights reserved.", privacy: "Privacy", terms: "Terms", contact: "Contact" },
  },
  "zh-CN": {
    navigation: { blog: "博客", computer: "计算机工具", documents: "文档工具", images: "图片工具", business: "商业工具" },
    languageLabel: "选择语言",
    categories: ["全部工具", "计算机", "文档", "图片", "商业"],
    toolsLabel: "KNIGHT WISDOM 工具箱",
    toolsTitle: "每一项任务，都有实用工具。",
    toolsText: "为你希望快速完成的任务提供简单、清晰的工具。更多工具正在准备中。",
    tools: [
      { group: "computer-tools", icon: "⌘", title: "JSON 格式化", description: "即时格式化、验证并理解 JSON。" },
      { group: "computer-tools", icon: "#", title: "密码生成器", description: "几秒钟内创建高强度密码。" },
      { group: "computer-tools", icon: "◌", title: "二维码生成器", description: "将链接或文本变成简洁二维码。" },
      { group: "computer-tools", icon: "↺", title: "UUID 生成器", description: "为项目和数据生成唯一 ID。" },
      { group: "document-tools", icon: "▤", title: "PDF 合并", description: "将文档合并为一个井然有序的 PDF。" },
      { group: "document-tools", icon: "⇄", title: "PDF 转 Word", description: "将 PDF 文档转为可编辑的 Word 文件。", href: "/tools/pdf-to-word" },
      { group: "document-tools", icon: "✂", title: "PDF 拆分", description: "将页面拆分为所需的独立文件。" },
      { group: "document-tools", icon: "✎", title: "PDF 在线编辑", description: "直接在浏览器中为 PDF 添加文字。", href: "/tools/pdf-editor", badge: "新功能" },
      { group: "document-tools", icon: "≋", title: "PDF 压缩", description: "缩小文件体积，保持文档清晰。" },
      { group: "image-tools", icon: "◒", title: "图片压缩", description: "不损失画质，让图片更轻巧。" },
      { group: "image-tools", icon: "↔", title: "图片尺寸调整", description: "为网页、工作和分享调整图片尺寸。" },
      { group: "image-tools", icon: "▧", title: "图片格式转换", description: "转换日常使用的图片格式。" },
      { group: "image-tools", icon: "⌑", title: "图片裁剪", description: "快速裁剪到合适的画面范围。" },
      { group: "business-tools", icon: "%", title: "利润率计算器", description: "快速计算，理解利润空间。" },
      { group: "business-tools", icon: "↗", title: "ROI 计算器", description: "估算一项投资的回报。" },
      { group: "business-tools", icon: "±", title: "盈亏平衡计算器", description: "了解业务何时达到盈亏平衡。" },
      { group: "business-tools", icon: "¤", title: "发票生成器", description: "为下一位客户创建清晰的发票。" },
      { group: "computer-tools", icon: "Aa", title: "字数统计", description: "统计字数、字符和阅读时间。" },
      { group: "document-tools", icon: "▣", title: "Word 转 PDF", description: "将 Word 文档转为清晰的 PDF 文件。", href: "/tools/word-to-pdf" },
      { group: "image-tools", icon: "✦", title: "图片加水印", description: "为你的视觉作品添加简洁水印。" },
      { group: "business-tools", icon: "₿", title: "贷款计算器", description: "清楚估算每月还款，做好规划。" },
    ],
    blogLabel: "来自博客",
    blogTitle: "有用的想法，清晰地分享。",
    blogText: "现在有工具教程；之后会加入有深度的讲解和热门话题点评。",
    browse: "浏览博客",
    readGuide: "阅读文章",
    guides: [
      { category: "工具教程", title: "如何为手头的任务选择合适的在线工具", time: "6 分钟阅读" },
      { category: "实用工作", title: "处理日常文件的一套简单工作流", time: "5 分钟阅读" },
      { category: "即将推出", title: "用清晰的观点解读大家正在讨论的话题", time: "新栏目" },
    ],
    contactTitle: "有想法、合作机会，或有价值的资源想分享？",
    contactText: "请通过 knightwisdomclub@gmail.com 联系 Knight Wisdom。",
    contactCta: "邮件联系 Knight Wisdom",
    footer: { tagline: "让每一天都更有能力的实用工具与想法。", rights: "保留所有权利。", privacy: "隐私", terms: "条款", contact: "联系" },
  },
} as const;

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [activeCategory, setActiveCategory] = useState(0);
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

  const groups = ["all", "computer-tools", "document-tools", "image-tools", "business-tools"];
  const visibleTools = activeCategory === 0 ? copy.tools : copy.tools.filter((tool) => tool.group === groups[activeCategory]);

  return (
    <main id="top">
      <Header language={language} onLanguageChange={changeLanguage} copy={{ navigation: copy.navigation, languageLabel: copy.languageLabel }} />

      <section className="tools-section" id="tools" aria-labelledby="tools-title">
        <div className="section-shell">
          <div className="tools-heading"><p className="label">{copy.toolsLabel}</p><h2 id="tools-title">{copy.toolsTitle}</h2><p>{copy.toolsText}</p></div>
          <div className="tool-filters" aria-label="Tool categories">{copy.categories.map((category, index) => <button key={category} className={activeCategory === index ? "active" : ""} onClick={() => setActiveCategory(index)}>{category}</button>)}</div>
          <div className="tool-grid">{visibleTools.map((tool) => <ToolCard key={tool.title} {...tool} />)}</div>
        </div>
      </section>

      <section className="section-shell blog-section" id="blog" aria-labelledby="blog-title">
        <div className="blog-heading"><div><p className="label">{copy.blogLabel}</p><h2 id="blog-title">{copy.blogTitle}</h2><p>{copy.blogText}</p></div><a className="text-link" href="#">{copy.browse} <ArrowRight /></a></div>
        <div className="blog-grid">{copy.guides.map((guide, index) => <GuideCard key={guide.title} index={index} linkLabel={copy.readGuide} {...guide} />)}</div>
      </section>

      <section className="section-shell contact-section">
        <div><h2>{copy.contactTitle}</h2><p>{copy.contactText}</p></div><a className="button button-primary" href="mailto:knightwisdomclub@gmail.com">{copy.contactCta} <ArrowRight /></a>
      </section>
      <Footer copy={copy.footer} />
    </main>
  );
}
