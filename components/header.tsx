type HeaderProps = {
  language: "en" | "zh-CN";
  onLanguageChange: (language: "en" | "zh-CN") => void;
  copy: {
    navigation: { blog: string; computer: string; pdf: string; images: string; business: string };
    languageLabel: string;
  };
};

export function Header({ language, onLanguageChange, copy }: HeaderProps) {
  const menus = language === "zh-CN" ? {
    computer: ["JSON 格式化", "密码生成器", "二维码生成器", "UUID 生成器"],
    pdf: ["PDF 转 Word", "Word 转 PDF", "PDF 在线编辑", "PDF 拆分", "PDF 合并", "PDF 压缩"],
    images: ["图片压缩", "图片尺寸调整", "图片格式转换"],
    business: ["利润率计算器", "ROI 计算器", "发票生成器"],
  } : {
    computer: ["JSON Formatter", "Password Generator", "QR Code Generator", "UUID Generator"],
    pdf: ["PDF to Word", "Word to PDF", "PDF Editor", "Split PDF", "Merge PDF", "Compress PDF"],
    images: ["Image Compressor", "Image Resizer", "Image Converter"],
    business: ["Profit Margin", "ROI Calculator", "Invoice Generator"],
  };
  return (
    <header className="site-header section-shell">
      <a className="brand" href="#top" aria-label="Knight Wisdom home"><span className="brand-mark">K</span><span>Knight <b>Wisdom</b></span></a>
      <nav aria-label="Main navigation">
        <a href="#blog">{copy.navigation.blog}</a>
        <div className="nav-menu"><a href="#tools">{copy.navigation.computer}</a><div className="tool-menu">{menus.computer.map((item) => <a href="#tools" key={item}>{item}</a>)}</div></div>
        <div className="nav-menu"><a href="#tools">{copy.navigation.pdf}</a><div className="tool-menu"><a href={`/tools/pdf-to-word?lang=${language}`}>{menus.pdf[0]}</a><a href={`/tools/word-to-pdf?lang=${language}`}>{menus.pdf[1]}</a><a href={`/tools/pdf-editor?lang=${language}`}>{menus.pdf[2]}</a><a href={`/tools/split-pdf?lang=${language}`}>{menus.pdf[3]}</a><a href="#tools">{menus.pdf[4]}</a><a href="#tools">{menus.pdf[5]}</a></div></div>
        <div className="nav-menu"><a href="#tools">{copy.navigation.images}</a><div className="tool-menu">{menus.images.map((item) => <a href="#tools" key={item}>{item}</a>)}</div></div>
        <div className="nav-menu"><a href="#tools">{copy.navigation.business}</a><div className="tool-menu">{menus.business.map((item) => <a href="#tools" key={item}>{item}</a>)}</div></div>
      </nav>
      <div className="header-actions">
        <div className="language-switcher" aria-label={copy.languageLabel}>
          <button className={language === "en" ? "active" : ""} onClick={() => onLanguageChange("en")} aria-pressed={language === "en"}>EN</button>
          <button className={language === "zh-CN" ? "active" : ""} onClick={() => onLanguageChange("zh-CN")} aria-pressed={language === "zh-CN"}>简体中文</button>
        </div>
      </div>
    </header>
  );
}
