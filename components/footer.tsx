type FooterProps = { copy: { tagline: string; collaboration: string; rights: string; privacy: string; terms: string; contact: string } };

export function Footer({ copy }: FooterProps) {
  return <footer className="footer section-shell"><div className="footer-main"><a className="brand" href="#top"><span className="brand-mark">K</span><span>Knight <b>Wisdom</b></span></a><p>{copy.tagline}</p><a className="newsletter" href="mailto:knightwisdomclub@gmail.com">{copy.collaboration} <span>→</span></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Knight Wisdom. {copy.rights}</span><div><a href="#">{copy.privacy}</a><a href="#">{copy.terms}</a><a href="mailto:knightwisdomclub@gmail.com">{copy.contact}</a></div></div></footer>;
}
