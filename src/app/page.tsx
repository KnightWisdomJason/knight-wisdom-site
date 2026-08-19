import { ToolDirectory } from "@/components/tool-directory";
import { tools } from "@/lib/tools";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <p className="eyebrow">KNIGHTWISDOM TOOLS</p>
        <h1>Every tool you need, in one place.</h1>
        <p className="hero-copy">Fast, free, privacy-friendly online tools that work right in your browser.</p>
      </section>
      <ToolDirectory tools={tools} />
      <section className="trust-grid" aria-label="Why use KnightWisdom Tools">
        <article><h2>Fast by design</h2><p>Open a tool, paste your content, and get the result immediately.</p></article>
        <article><h2>Privacy-friendly</h2><p>The current text and developer tools process your input locally in your browser.</p></article>
        <article><h2>Free to use</h2><p>No account, download, or complicated setup is needed for these everyday tools.</p></article>
      </section>
    </main>
  );
}
