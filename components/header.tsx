type HeaderProps = {
  language: "en" | "zh-CN";
  onLanguageChange: (language: "en" | "zh-CN") => void;
  copy: {
    navigation: { tools: string; guides: string; about: string };
    languageLabel: string;
    exploreTools: string;
  };
};

export function Header({ language, onLanguageChange, copy }: HeaderProps) {
  return (
    <header className="site-header section-shell">
      <a className="brand" href="#top" aria-label="Knight Wisdom home"><span className="brand-mark">K</span><span>Knight <b>Wisdom</b></span></a>
      <nav aria-label="Main navigation"><a href="#tools">{copy.navigation.tools}</a><a href="#guides">{copy.navigation.guides}</a><a href="#about">{copy.navigation.about}</a></nav>
      <div className="header-actions">
        <div className="language-switcher" aria-label={copy.languageLabel}>
          <button className={language === "en" ? "active" : ""} onClick={() => onLanguageChange("en")} aria-pressed={language === "en"}>EN</button>
          <button className={language === "zh-CN" ? "active" : ""} onClick={() => onLanguageChange("zh-CN")} aria-pressed={language === "zh-CN"}>简体中文</button>
        </div>
        <a className="header-cta" href="#tools">{copy.exploreTools} <span>→</span></a>
      </div>
    </header>
  );
}
