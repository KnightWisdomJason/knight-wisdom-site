"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { supabase, isSupabaseReady } from "@/lib/supabase";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [msg, setMsg] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setMsg("处理中...");

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return setMsg(error.message);

      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          email: data.user.email,
          nickname: data.user.email?.split("@")[0] || "Knight",
        });
      }

      setMsg("注册成功，请回酒馆使用功能。");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setMsg(error.message);

    setMsg("登录成功，返回酒馆中...");
    window.location.href = "/tavern";
  };

  if (!isSupabaseReady) {
    return <main className="tavern-page"><h1>⚙️ 还差一步：配置 Supabase</h1></main>;
  }

  return (
    <main className="tavern-page">
      <header className="tavern-header">
        <h1>🛡 Knight Wisdom 通行证</h1>
        <p><Link href="/tavern">← 返回 Club</Link></p>
      </header>

      <section className="tavern-grid single-col">
        <article className="tavern-card stack-sm">
          <div className="row">
            <button onClick={() => setMode("signup")} type="button">注册</button>
            <button onClick={() => setMode("login")} type="button">登录</button>
          </div>
          <form className="stack-sm" onSubmit={submit}>
            <input
              type="email"
              placeholder="邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="密码（至少6位）"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
            <button type="submit">{mode === "signup" ? "创建账号" : "登录"}</button>
          </form>
          <p>{msg}</p>
        </article>
      </section>
    </main>
  );
}
