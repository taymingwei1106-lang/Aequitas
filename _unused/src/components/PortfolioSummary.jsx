import FinancialSummary from "./FinancialSummary";
import RecommendationCard from "./RecommendationCard";

export default function PortfolioSummary({

  dashboard,

}) {

  const equity =
    dashboard.totalValue -
    dashboard.totalLoan;

  return (

    <>

      <FinancialSummary

        value={`RM ${dashboard.totalValue.toLocaleString()}`}

        loan={`RM ${dashboard.totalLoan.toLocaleString()}`}

        rental={`RM ${dashboard.totalRental.toLocaleString()}`}

        equity={`RM ${equity.toLocaleString()}`}

      />

      <RecommendationCard

        title="Portfolio Opportunity"

        description="Complete market values and interest rates to unlock ROI, capital gain, refinancing suggestions and AI portfolio analysis."

        buttonText="Complete Portfolio"

      />

    </>

  );

}