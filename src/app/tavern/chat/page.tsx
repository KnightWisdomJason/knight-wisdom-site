"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { isSupabaseReady, supabase } from "@/lib/supabase";

type ChatMessage = {
  id: number;
  user_id: string | null;
  nickname: string;
  content: string;
  created_at: string;
};

type Profile = {
  id: string;
  email: string | null;
  nickname: string | null;
  role: "member" | "admin";
};

const COOLDOWN_MS = 5000;

export default function TavernChatPage() {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSendAt, setLastSendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  const cooldownLeft = Math.max(0, COOLDOWN_MS - (now - lastSendAt));
  const canSend = cooldownLeft === 0;

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const db = supabase;

    const boot = async () => {
      const { data: sessionRes } = await db.auth.getSession();
      const user = sessionRes.session?.user;
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: existing } = await db
        .from("profiles")
        .select("id,email,nickname,role")
        .eq("id", user.id)
        .single();

      if (existing) {
        setProfile(existing as Profile);
      } else {
        const seed = {
          id: user.id,
          email: user.email ?? null,
          nickname: user.email?.split("@")[0] ?? "Knight",
        };
        await db.from("profiles").upsert(seed);
        setProfile({ ...seed, role: "member" });
      }

      const msgRes = await db
        .from("chat_messages")
        .select("id,user_id,nickname,content,created_at")
        .order("created_at", { ascending: true })
        .limit(120);

      if (msgRes.data) setMessages(msgRes.data as ChatMessage[]);
      setLoading(false);
    };

    boot();

    const channel = db
      .channel("kw-chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const incoming = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming].slice(-120);
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "chat_messages" },
        (payload) => {
          const oldId = (payload.old as { id?: number }).id;
          if (!oldId) return;
          setMessages((prev) => prev.filter((m) => m.id !== oldId));
        }
      )
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, []);

  const nickname = useMemo(() => profile?.nickname || "Knight", [profile]);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase || !profile || !chatInput.trim() || !canSend) return;

    setLastSendAt(Date.now());

    await supabase.from("chat_messages").insert({
      user_id: profile.id,
      nickname,
      content: chatInput.trim(),
    });

    setChatInput("");
  };

  const removeMessage = async (id: number) => {
    if (!supabase || profile?.role !== "admin") return;
    await supabase.from("chat_messages").delete().eq("id", id);
  };

  if (!isSupabaseReady) {
    return (
      <main className="tavern-page">
        <h1>⚙️ 还差一步：配置 Supabase</h1>
      </main>
    );
  }

  if (loading) return <main className="tavern-page"><h1>加载中...</h1></main>;

  if (!profile) {
    return (
      <main className="tavern-page">
        <header className="tavern-header">
          <h1>🔐 骑士会客厅</h1>
          <p><Link href="/tavern">← 返回 Club</Link></p>
        </header>
        <section className="tavern-grid single-col">
          <article className="tavern-card">
            <p>使用聊天前请先注册/登录。</p>
            <Link href="/auth">前往注册 / 登录</Link>
          </article>
        </section>
      </main>
    );
  }

  return (
    <main className="tavern-page">
      <header className="tavern-header">
        <h1>🏰 Knight Wisdom 实时聊天室</h1>
        <p>
          身份：{nickname} {profile.role === "admin" ? "(管理员)" : "(成员)"}
        </p>
        <p><Link href="/tavern">← 返回 Club</Link></p>
      </header>

      <section className="tavern-grid single-col">
        <article className="tavern-card">
          <form onSubmit={sendMessage} className="stack-sm">
            <div className="row">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="输入你的消息..."
              />
              <button type="submit" disabled={!canSend || !chatInput.trim()}>
                {canSend ? "发送" : `${Math.ceil(cooldownLeft / 1000)}s`}
              </button>
            </div>
            <small>防刷屏：每位用户每 5 秒只能发送 1 条。</small>
          </form>

          <ul className="feed">
            {messages.map((m) => (
              <li key={m.id}>
                <b>{m.nickname}：</b>
                {m.content}
                {profile.role === "admin" && (
                  <button
                    type="button"
                    onClick={() => removeMessage(m.id)}
                    style={{ marginLeft: 10 }}
                  >
                    删除
                  </button>
                )}
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
