import MetricCard from "./MetricCard";

export default function PropertyHighlights({

  property,

}) {

  const equity =

    Number(property.purchasePrice || 0) -

    Number(property.outstandingLoan || 0);

  return (

    <div className="financial-summary-grid">

      <MetricCard

        label="Purchase"

        value={`RM ${Number(property.purchasePrice || 0).toLocaleString()}`}

      />

      <MetricCard

        label="Loan"

        value={`RM ${Number(property.outstandingLoan || 0).toLocaleString()}`}

      />

      <MetricCard

        label="Equity"

        value={`RM ${equity.toLocaleString()}`}

      />

      <MetricCard

        label="Rental"

        value={`RM ${Number(property.monthlyRental || 0).toLocaleString()}`}

      />

    </div>

  );

}