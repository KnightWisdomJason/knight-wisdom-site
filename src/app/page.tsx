"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [opening, setOpening] = useState(false);
  const router = useRouter();

  const openDoor = () => {
    if (opening) return;
    setOpening(true);
    setTimeout(() => {
      router.push("/tavern");
    }, 1500);
  };

  return (
    <main className="landing-scene">
      <div className="mist" />
      <div className="torch torch-left" />
      <div className="torch torch-right" />

      <section className="hero-panel">
        <p className="hero-eyebrow">The Old Oak Tavern</p>
        <h1 className="hero-title">中世纪酒馆 · NFT世界入口</h1>
        <p className="hero-desc">点击酒馆大门进入。</p>
      </section>

      <button onClick={openDoor} className="door-wrap" aria-label="Enter the tavern">
        <span className="door-frame" />
        <span className={`door leaf left ${opening ? "open" : ""}`} />
        <span className={`door leaf right ${opening ? "open" : ""}`} />
      </button>
    </main>
  );
}
