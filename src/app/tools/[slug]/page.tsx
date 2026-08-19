import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolPageContent } from "@/components/tool-page-content";
import { toolBySlug, tools } from "@/lib/tools";
export function generateStaticParams() { return tools.map(({ slug }) => ({ slug })); }
export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { return params.then(({ slug }) => { const tool = toolBySlug(slug); if (!tool) return {}; return { title: tool.name, description: tool.description, alternates: { canonical: `/tools/${tool.slug}` }, openGraph: { title: `${tool.name} | KnightWisdom Tools`, description: tool.description } }; }); }
export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) { const tool = toolBySlug((await params).slug); if (!tool) notFound(); const related = tool.related.map((slug) => toolBySlug(slug)).filter((item): item is NonNullable<typeof item> => Boolean(item)); return <ToolPageContent tool={tool} related={related} />; }
