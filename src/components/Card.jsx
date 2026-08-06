export default function Card({
  children,
  className = "",
  onClick,
}) {
  const classes = ["card", className].filter(Boolean).join(" ");

  if (onClick) {
    return (
      <div
        className={classes}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {children}
      </div>
    );
  }

  return <div className={classes}>{children}</div>;
}