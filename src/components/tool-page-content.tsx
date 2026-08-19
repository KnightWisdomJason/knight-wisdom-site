"use client";
import Link from "next/link";
import { ToolWorkspace } from "@/components/tool-workspace";
import { usePreferences } from "@/components/preferences";
import type { Tool } from "@/lib/tools";
const zh: Record<string, [string, string]> = { "word-counter":["字数统计", "实时统计字数、字符、句子和阅读时长。"], "character-counter":["字符统计", "实时统计字符、字数和行数。"], "case-converter":["大小写转换", "转换为大写、camelCase、snake_case 等格式。"], "json-formatter":["JSON 格式化", "即时格式化、压缩和验证 JSON。"], "json-validator":["JSON 验证器", "检查 JSON 是否有效，并格式化正确的 JSON。"], "base64":["Base64 编码 / 解码", "安全地将文本编码为 Base64 或解码。"], "word-to-pdf":["Word 转 PDF", "将 Word 文档转换为可下载 PDF。"], "pdf-to-word":["PDF 转 Word", "将 PDF 文本提取为可下载 Word 文档。"] };
const faq = (questions: string[], answers: string[]): [string, string][] => questions.map((question, index) => [question, answers[index]]);
const zhFaqs: Record<string, [string, string][]> = {
  "word-counter": faq(["我的文字会被上传吗？", "什么内容会被算作一个字词？", "阅读时间如何计算？"], ["不会。输入内容会在你的浏览器中本地统计。", "由空白字符分隔的一组文字或数字会被统计为一个字词。", "系统按平均每分钟阅读 200 个英文单词估算阅读时间。"]),
  "character-counter": faq(["字符统计是否包含空格？", "可以用来检查社交媒体字数限制吗？", "我的文字会被上传吗？"], ["会同时显示含空格和不含空格两种统计结果。", "可以。它适合核对标题、简介、评论和社交媒体文案长度。", "不会。所有统计都在你的浏览器本地完成。"]),
  "case-converter": faq(["支持哪些文本格式？", "可以用于代码命名吗？", "我的文字会被上传吗？"], ["支持大写、小写、标题、句子、camelCase、PascalCase、snake_case 和 kebab-case。", "可以。多种常见命名格式都适用于代码和文件。", "不会。文本只在你的浏览器中转换。"]),
  "json-formatter": faq(["JSON 会被发送到服务器吗？", "无效 JSON 会怎样处理？", "压缩 JSON 有什么作用？"], ["不会。解析和格式化完全在浏览器内执行。", "工具会提示可读的错误信息，并保留原始输入。", "压缩会移除多余空格和换行，同时保持数据不变。"]),
  "json-validator": faq(["哪些情况会让 JSON 无效？", "有效 JSON 可以被格式化吗？", "我的数据是否私密？"], ["常见原因包括缺少引号、末尾多余逗号和括号不匹配。", "可以。验证成功后可格式化为易读的缩进结构。", "是的。验证和格式化都在浏览器本地完成。"]),
  "base64": faq(["Base64 是加密吗？", "支持中文和其他非英文文本吗？", "无效 Base64 会怎样处理？"], ["不是。Base64 只是编码方式。", "支持。此工具使用 UTF-8。", "工具会显示错误提示，并保留原始输入。"]),
  "word-to-pdf": faq(["文件会被上传吗？", "支持哪些文件？", "排版会完全保留吗？"], ["不会。Word 文档只会在浏览器中本地处理。", "当前版本支持 DOCX 格式的 Word 文档。", "以文字转换为主；复杂排版、表格和图片可能变化。"]),
  "pdf-to-word": faq(["PDF 会被上传吗？", "版式会完全保留吗？", "扫描版 PDF 可以转换吗？"], ["不会。PDF 文本提取在浏览器内完成。", "会创建可编辑 Word 文档；复杂版式可能变化。", "扫描件需要 OCR；当前版本暂不包含 OCR。"]),
};
export function ToolPageContent({ tool, related }: { tool: Tool; related: Tool[] }) {
  const { locale, t } = usePreferences(); const current = locale === "zh" ? zh[tool.slug] : undefined; const faqs = zhFaqs[tool.slug];
  return <main className="tool-page"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">{t("Tools", "工具")}</Link><span>/</span><span>{current?.[0] || tool.name}</span></nav><header className="tool-hero"><p className="eyebrow">{t(tool.category, ({ Text:"文本", Developer:"开发者", Encoding:"编码" }[tool.category] || tool.category))}</p><h1>{current?.[0] || tool.name}</h1><p>{current?.[1] || tool.description}</p><span>✦ {t("Processed locally in your browser", "在你的浏览器本地处理")}</span></header><ToolWorkspace tool={tool}/><section className="content-grid"><article><h2>{t(`How to use ${tool.name}`, `如何使用${current?.[0] || tool.name}`)}</h2><ol><li>{t("Paste or type your content into the input area.", "在输入框中粘贴或输入内容。")}</li><li>{t("Choose the action that fits your task.", "选择适合你任务的操作。")}</li><li>{t("Copy the result when you are ready.", "完成后复制结果。")}</li></ol><h2>{t("Example", "示例")}</h2><p>{locale === "zh" ? "输入内容后，选择所需操作即可即时获得结果。" : tool.example}</p></article><aside><h2>{t("Frequently asked questions", "常见问题")}</h2>{tool.faqs.map((item, index) => <details key={item.question}><summary>{locale === "zh" ? faqs[index][0] : item.question}</summary><p>{locale === "zh" ? faqs[index][1] : item.answer}</p></details>)}</aside></section><section className="related"><p className="eyebrow">{t("KEEP EXPLORING", "继续探索")}</p><h2>{t("Related tools", "相关工具")}</h2><div className="related-links">{related.map((item) => { const itemZh = zh[item.slug]; return <Link href={`/tools/${item.slug}`} key={item.slug}>{locale === "zh" ? itemZh?.[0] : item.name}<span>{locale === "zh" ? itemZh?.[1] : item.description}</span></Link>; })}</div></section></main>;
}
