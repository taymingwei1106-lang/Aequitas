import { Link } from "react-router-dom";
import Card from "./ui/Card";

export default function QuickAction({
  to,
  icon,
  title,
  description,
}) {
  return (
    <Link
      to={to}
      className="quick-action-link"
    >
      <Card className="quick-action-card">

        <div className="quick-action-icon">
          {icon}
        </div>

        <div className="quick-action-content">

          <h3>{title}</h3>

          <p>{description}</p>

        </div>

      </Card>
    </Link>
  );
}