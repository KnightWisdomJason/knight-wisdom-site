import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { CategoryCard } from "@/components/category-card";
import { GuideCard } from "@/components/guide-card";
import { ArrowRight, Check, Sparkles } from "@/components/icons";

const categories = [
  { icon: "▣", title: "PDF Tools", description: "Simple, secure ways to work with your documents.", tools: ["Merge & split", "Compress", "Convert"] },
  { icon: "◒", title: "Image Tools", description: "Prepare images that look great and load fast.", tools: ["Compress", "Resize", "Convert"] },
  { icon: "↗", title: "Business Tools", description: "Make clearer decisions with practical calculators.", tools: ["Profit margin", "ROI", "Break-even"] },
  { icon: "⌘", title: "Developer Tools", description: "Small utilities that keep your workflow moving.", tools: ["JSON formatter", "UUID", "Base64"] },
];

const guides = [
  { category: "PRODUCTIVITY", title: "How to build a calmer, more focused workday", time: "6 min read" },
  { category: "BUSINESS", title: "The simple numbers every new business should know", time: "8 min read" },
  { category: "TOOLS", title: "A practical guide to working with files online", time: "5 min read" },
];

export default function Home() {
  return (
    <main>
      <Header />
      <section className="hero section-shell">
        <div className="hero-glow" aria-hidden="true" />
        <div className="eyebrow"><Sparkles /> Built for better work</div>
        <h1>Smart tools.<br /><span>Clearer work.</span></h1>
        <p className="hero-copy">Free, thoughtful tools and practical guides to help you get work done with more confidence.</p>
        <div className="hero-actions">
          <a className="button button-primary" href="#tools">Explore tools <ArrowRight /></a>
          <a className="button button-secondary" href="#guides">Read the guides</a>
        </div>
        <div className="hero-proof"><span className="status-dot" /> Fast, free, and designed with privacy in mind.</div>
      </section>

      <section className="section-shell section" id="tools">
        <div className="section-heading"><div><p className="label">THE TOOLBOX</p><h2>Useful by design.</h2></div><a className="text-link" href="#">View all tools <ArrowRight /></a></div>
        <div className="category-grid">{categories.map((category) => <CategoryCard key={category.title} {...category} />)}</div>
      </section>

      <section className="section-shell value-section">
        <div className="value-intro"><p className="label">WHY KNIGHT WISDOM</p><h2>Less noise.<br />More progress.</h2><p>We make the everyday tasks around work and business feel a little lighter.</p></div>
        <div className="benefit-list">
          {[
            ["Free to use", "The essentials should be easy to access."],
            ["Privacy minded", "Your files and data deserve careful handling."],
            ["Made for momentum", "No clutter—just useful tools when you need them."],
          ].map(([title, description], index) => <div className="benefit" key={title}><span className="benefit-number">0{index + 1}</span><div><h3><Check /> {title}</h3><p>{description}</p></div></div>)}
        </div>
      </section>

      <section className="section-shell section guides-section" id="guides">
        <div className="section-heading"><div><p className="label">FROM THE JOURNAL</p><h2>Practical ideas, clearly shared.</h2></div><a className="text-link" href="#">Browse guides <ArrowRight /></a></div>
        <div className="guide-grid">{guides.map((guide, index) => <GuideCard key={guide.title} index={index} {...guide} />)}</div>
      </section>
      <Footer />
    </main>
  );
}
