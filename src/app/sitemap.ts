import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools";
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://knightwisdom.com";
export default function sitemap(): MetadataRoute.Sitemap { return ["", "/about", "/privacy", "/terms", "/contact", ...tools.map((tool) => `/tools/${tool.slug}`)].map((path) => ({ url: `${baseUrl}${path}`, lastModified: new Date(), changeFrequency: "weekly", priority: path === "" ? 1 : path.startsWith("/tools") ? 0.8 : 0.4 })); }
