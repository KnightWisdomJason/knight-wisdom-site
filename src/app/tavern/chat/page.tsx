"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { isSupabaseReady, supabase } from "@/lib/supabase";

type ChatMessage = {
  id: number;
  nickname: string;
  content: string;
  created_at: string;
};

export default function TavernChatPage() {
  const [nickname, setNickname] = useState("冒险者");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!supabase) return;
    const db = supabase;

    const load = async () => {
      const msgRes = await db
        .from("chat_messages")
        .select("id,nickname,content,created_at")
        .order("created_at", { ascending: true })
        .limit(80);

      if (msgRes.data) setMessages(msgRes.data as ChatMessage[]);
    };

    load();

    const channel = db
      .channel("tavern-room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const incoming = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming].slice(-100);
          });
        }
      )
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, []);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase || !chatInput.trim()) return;
    const db = supabase;

    const { data } = await db
      .from("chat_messages")
      .insert({
        nickname: nickname.trim() || "冒险者",
        content: chatInput.trim(),
      })
      .select("id,nickname,content,created_at")
      .single();

    if (data) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === (data as ChatMessage).id)) return prev;
        return [...prev, data as ChatMessage].slice(-100);
      });
    }

    setChatInput("");
  };

  if (!isSupabaseReady) {
    return (
      <main className="tavern-page">
        <h1>⚙️ 还差一步：配置 Supabase</h1>
      </main>
    );
  }

  return (
    <main className="tavern-page">
      <header className="tavern-header">
        <h1>🍺 吧台实时聊天</h1>
        <p>
          <Link href="/tavern">← 返回酒馆大厅</Link>
        </p>
      </header>

      <section className="tavern-grid single-col">
        <article className="tavern-card">
          <form onSubmit={sendMessage} className="stack-sm">
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="昵称"
            />
            <div className="row">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="来一条酒馆消息..."
              />
              <button type="submit">发送</button>
            </div>
          </form>
          <ul className="feed">
            {messages.map((m) => (
              <li key={m.id}>
                <b>{m.nickname}：</b>
                {m.content}
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
