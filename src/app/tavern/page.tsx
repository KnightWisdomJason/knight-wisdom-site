import Link from "next/link";

export default function TavernPage() {
  return (
    <main className="tavern-hub">
      <section className="tavern-scene">
        <div className="hub-title">酒馆大厅</div>

        <div className="zone left-placeholder">
          <h3>左侧预留区</h3>
          <p>未来：游戏厅 + 收藏品展示</p>
        </div>

        <Link href="/tavern/chat" className="zone bar-zone">
          <h3>吧台</h3>
          <p>点击进入实时聊天</p>
        </Link>

        <Link href="/tavern/board" className="zone board-zone">
          <h3>公告板</h3>
          <p>点击进入留言板</p>
        </Link>
      </section>
    </main>
  );
}
