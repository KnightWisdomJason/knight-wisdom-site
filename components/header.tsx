type HeaderProps = {
  language: "en" | "zh-CN";
  onLanguageChange: (language: "en" | "zh-CN") => void;
  copy: {
    navigation: { blog: string; computer: string; documents: string; images: string; business: string };
    languageLabel: string;
  };
};

export function Header({ language, onLanguageChange, copy }: HeaderProps) {
  return (
    <header className="site-header section-shell">
      <a className="brand" href="#top" aria-label="Knight Wisdom home"><span className="brand-mark">K</span><span>Knight <b>Wisdom</b></span></a>
      <nav aria-label="Main navigation"><a href="#blog">{copy.navigation.blog}</a><a href="#tools">{copy.navigation.computer}</a><a href="#tools">{copy.navigation.documents}</a><a href="#tools">{copy.navigation.images}</a><a href="#tools">{copy.navigation.business}</a></nav>
      <div className="header-actions">
        <div className="language-switcher" aria-label={copy.languageLabel}>
          <button className={language === "en" ? "active" : ""} onClick={() => onLanguageChange("en")} aria-pressed={language === "en"}>EN</button>
          <button className={language === "zh-CN" ? "active" : ""} onClick={() => onLanguageChange("zh-CN")} aria-pressed={language === "zh-CN"}>简体中文</button>
        </div>
      </div>
    </header>
  );
}
