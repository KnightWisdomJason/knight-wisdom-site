import { createHmac } from "crypto";
import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function POST(request: Request) { const secret = process.env.CONVERTER_SIGNING_SECRET; if (!secret) return NextResponse.json({ error: "Converter is not configured" }, { status: 503 }); const { action } = await request.json(); if (action !== "word-to-pdf" && action !== "pdf-to-word") return NextResponse.json({ error: "Unsupported action" }, { status: 400 }); const expiry = Math.floor(Date.now() / 1000) + 300; const payload = `${expiry}.${action}`; const signature = createHmac("sha256", secret).update(payload).digest("hex"); return NextResponse.json({ token: `${payload}.${signature}` }, { headers: { "Cache-Control": "no-store" } }); }
