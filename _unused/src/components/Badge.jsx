import Card from "./ui/Card";

export default function Badge({
  children,
  color = "blue",
}) {
  return (
    <span className={`badge badge-${color}`}>
      {children}
    </span>
  );
}