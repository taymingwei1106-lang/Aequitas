import Card from "./ui/Card";
import Button from "./ui/Button";

export default function RecommendationCard({
  title,
  description,
  buttonText,
  onClick,
}) {
  return (
    <Card className="recommendation-card">

      <div className="recommendation-content">

        <div>

          <h3>{title}</h3>

          <p>{description}</p>

        </div>

        {buttonText && (
          <Button onClick={onClick}>
            {buttonText}
          </Button>
        )}

      </div>

    </Card>
  );
}