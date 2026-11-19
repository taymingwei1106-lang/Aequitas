export default function Button({
  children,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
  onClick,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={[
        "btn",
        `btn-${variant}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}