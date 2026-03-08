import Link from "next/link";

export default function TavernPage() {
  return (
    <main className="tavern-hub">
      <section className="tavern-scene">
        <div className="hub-title">Knight Wisdom · Castle Club</div>

        <div className="zone left-placeholder">
          <h3>世界观长廊</h3>
          <p>未来：故事链 + NFT 收藏柜 + 小游戏</p>
        </div>

        <Link href="/tavern/chat" className="zone bar-zone">
          <h3>骑士会客厅</h3>
          <p>实时聊天（5秒防刷）</p>
        </Link>

        <Link href="/tavern/board" className="zone board-zone">
          <h3>城堡论坛</h3>
          <p>剧情公告 / 活动 / 交易讨论</p>
        </Link>

        <Link href="/auth" className="zone board-zone" style={{ marginTop: 14 }}>
          <h3>注册 / 登录</h3>
          <p>使用功能前需登录</p>
        </Link>
      </section>
    </main>
  );
}
