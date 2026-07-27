type ToolCardProps = {
  icon: string;
  title: string;
  description: string;
  badge?: string;
  href?: string;
};

export function ToolCard({ icon, title, description, badge, href = "#" }: ToolCardProps) {
  return (
    <a className="tool-card" href={href} aria-label={title}>
      <span className="tool-icon">{icon}</span>
      {badge && <span className="tool-badge">{badge}</span>}
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="tool-open">↗</span>
    </a>
  );
}
