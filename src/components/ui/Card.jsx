export default function Card({
  children,
  className = "",
  hover = true,
  padding = "normal",
  onClick,
}) {
  const classes = [
    "card",
    hover ? "card-hover" : "",
    padding === "compact" ? "card-compact" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
}