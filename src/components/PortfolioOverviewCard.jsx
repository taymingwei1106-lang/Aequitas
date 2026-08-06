import Card from "../ui/Card";

export default function PortfolioOverviewCard({

  title,

  value,

  subtitle,

}) {

  return (

    <Card>

      <span className="metric-label">

        {title}

      </span>

      <h2 className="metric-value">

        {value}

      </h2>

      {subtitle && (

        <p className="section-subtitle">

          {subtitle}

        </p>

      )}

    </Card>

  );

}