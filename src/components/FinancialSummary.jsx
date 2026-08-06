import MetricCard from "./MetricCard";

export default function FinancialSummary({

  value,

  loan,

  rental,

  equity,

}) {

  return (

    <div className="financial-summary-grid">

      <MetricCard
        label="Portfolio Value"
        value={value}
      />

      <MetricCard
        label="Outstanding Loan"
        value={loan}
      />

      <MetricCard
        label="Net Equity"
        value={equity}
      />

      <MetricCard
        label="Monthly Rental"
        value={rental}
      />

    </div>

  );

}