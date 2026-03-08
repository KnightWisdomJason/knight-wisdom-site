"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { isSupabaseReady, supabase } from "@/lib/supabase";

type Post = {
  id: number;
  user_id: string | null;
  title: string;
  content: string;
  category: "lore" | "event" | "trade";
  created_at: string;
};

type Profile = {
  id: string;
  email: string | null;
  nickname: string | null;
  role: "member" | "admin";
};

export default function TavernBoardPage() {
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState<Post["category"]>("lore");
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    const db = supabase;

    const load = async () => {
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
      if (existing) setProfile(existing as Profile);

      const postRes = await db
        .from("posts")
        .select("id,user_id,title,content,category,created_at")
        .order("created_at", { ascending: false })
        .limit(80);

      if (postRes.data) setPosts(postRes.data as Post[]);
      setLoading(false);
    };

    load();
  }, []);

  const submitPost = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase || !profile || !postTitle.trim() || !postContent.trim()) return;

    const { data } = await supabase
      .from("posts")
      .insert({
        user_id: profile.id,
        title: postTitle.trim(),
        content: postContent.trim(),
        category: postCategory,
      })
      .select("id,user_id,title,content,category,created_at")
      .single();

    if (data) setPosts((prev) => [data as Post, ...prev]);

    setPostTitle("");
    setPostContent("");
  };

  const removePost = async (id: number) => {
    if (!supabase || profile?.role !== "admin") return;
    await supabase.from("posts").delete().eq("id", id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
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
          <h1>🔐 Knight Wisdom 论坛</h1>
          <p><Link href="/tavern">← 返回 Club</Link></p>
        </header>
        <section className="tavern-grid single-col">
          <article className="tavern-card">
            <p>使用论坛前请先注册/登录。</p>
            <Link href="/auth">前往注册 / 登录</Link>
          </article>
        </section>
      </main>
    );
  }

  return (
    <main className="tavern-page">
      <header className="tavern-header">
        <h1>📜 Knight Wisdom 城堡论坛</h1>
        <p>
          当前身份：{profile.nickname || "Knight"} {profile.role === "admin" ? "(管理员)" : "(成员)"}
        </p>
        <p><Link href="/tavern">← 返回 Club</Link></p>
      </header>

      <section className="tavern-grid single-col">
        <article className="tavern-card">
          <form onSubmit={submitPost} className="stack-sm">
            <input
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="标题"
            />
            <select
              value={postCategory}
              onChange={(e) => setPostCategory(e.target.value as Post["category"])}
            >
              <option value="lore">故事线</option>
              <option value="event">活动公告</option>
              <option value="trade">交易区</option>
            </select>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="写下你的内容..."
              rows={4}
            />
            <button type="submit">发布</button>
          </form>

          <ul className="feed">
            {posts.map((p) => (
              <li key={p.id}>
                <b>[{p.category}] {p.title}</b>
                <div>{p.content}</div>
                {profile.role === "admin" && (
                  <button type="button" onClick={() => removePost(p.id)}>
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
