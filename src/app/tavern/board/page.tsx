"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { isSupabaseReady, supabase } from "@/lib/supabase";

type Post = {
  id: number;
  title: string;
  content: string;
  category: "bounty" | "rumor" | "trade";
  created_at: string;
};

export default function TavernBoardPage() {
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState<Post["category"]>("bounty");
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!supabase) return;
    const db = supabase;

    const load = async () => {
      const postRes = await db
        .from("posts")
        .select("id,title,content,category,created_at")
        .order("created_at", { ascending: false })
        .limit(30);

      if (postRes.data) setPosts(postRes.data as Post[]);
    };

    load();
  }, []);

  const submitPost = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase || !postTitle.trim() || !postContent.trim()) return;
    const db = supabase;

    const { data } = await db
      .from("posts")
      .insert({
        title: postTitle.trim(),
        content: postContent.trim(),
        category: postCategory,
      })
      .select("id,title,content,category,created_at")
      .single();

    if (data) setPosts((prev) => [data as Post, ...prev]);

    setPostTitle("");
    setPostContent("");
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
        <h1>📜 公告板 / 留言板</h1>
        <p>
          <Link href="/tavern">← 返回酒馆大厅</Link>
        </p>
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
              <option value="bounty">悬赏</option>
              <option value="rumor">传闻</option>
              <option value="trade">交易</option>
            </select>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="写下你的公告..."
              rows={4}
            />
            <button type="submit">发布</button>
          </form>

          <ul className="feed">
            {posts.map((p) => (
              <li key={p.id}>
                <b>[{p.category}] {p.title}</b>
                <div>{p.content}</div>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
