import Button from "./ui/Button";

export default function EmptyState({
  title,
  description,
  actionText,
  onAction,
}) {
  return (
    <div className="empty-state">

      <div className="empty-state-icon">
        📂
      </div>

      <h2>{title}</h2>

      <p>{description}</p>

      {actionText && (
        <Button onClick={onAction}>
          {actionText}
        </Button>
      )}

    </div>
  );
}