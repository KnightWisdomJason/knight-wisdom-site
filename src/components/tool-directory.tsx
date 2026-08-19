"use client";
import Link from "next/link";
import { useState } from "react";
import type { Tool } from "@/lib/tools";

export function ToolDirectory({ tools }: { tools: Tool[] }) {
  const [query, setQuery] = useState(""); const [category, setCategory] = useState("All Tools");
  const categories = ["All Tools", "Text", "Developer", "Encoding"];
  const filtered = tools.filter((tool) => (category === "All Tools" || tool.category === category) && [tool.name, tool.description, ...tool.keywords].join(" ").toLowerCase().includes(query.toLowerCase()));
  return <section className="directory" aria-labelledby="tools-heading"><div className="search-wrap"><label className="sr-only" htmlFor="tool-search">Search tools</label><span>⌕</span><input id="tool-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search free online tools..." /></div><div className="filters" role="tablist" aria-label="Tool categories">{categories.map((item) => <button key={item} id={item.toLowerCase().replace(" ", "-")} className={category === item ? "active" : ""} onClick={() => setCategory(item)} type="button">{item}</button>)}</div><div className="directory-heading"><div><p className="eyebrow">{category === "All Tools" ? "ALL TOOLS" : category.toUpperCase()}</p><h2 id="tools-heading">Useful tools, ready when you are.</h2></div><p>{filtered.length} {filtered.length === 1 ? "tool" : "tools"} available</p></div><div className="tool-grid">{filtered.map((tool) => <Link className="tool-card" href={`/tools/${tool.slug}`} key={tool.slug}><span className="tool-icon" aria-hidden="true">{tool.icon}</span><span className="tool-card-content"><strong>{tool.name}</strong><span>{tool.description}</span><small>{tool.category}</small></span><span className="arrow" aria-hidden="true">→</span></Link>)}</div>{!filtered.length && <p className="empty">No matching tools yet. Try a different search.</p>}</section>;
}
