export function calculateRisk({
  loan = 0,
  marketValue = 0,
  monthlyProfit = 0,
  rentalYield = 0,
  equity = 0,
}) {

  const leverageRatio =
    marketValue > 0 ? loan / marketValue : 0;

  const equityRatio =
    marketValue > 0 ? equity / marketValue : 0;

  const leverageScore =
    leverageRatio < 0.4 ? 100 :
    leverageRatio < 0.6 ? 80 :
    leverageRatio < 0.8 ? 60 :
    leverageRatio < 0.9 ? 40 : 20;

  const cashflowScore =
    monthlyProfit > 500 ? 100 :
    monthlyProfit > 200 ? 85 :
    monthlyProfit > 0 ? 70 :
    monthlyProfit > -200 ? 40 : 15;

  const rentalScore =
    rentalYield > 7 ? 100 :
    rentalYield > 5 ? 85 :
    rentalYield > 4 ? 70 :
    rentalYield > 3 ? 50 : 25;

  const equityScore =
    equityRatio > 0.5 ? 100 :
    equityRatio > 0.3 ? 80 :
    equityRatio > 0.2 ? 60 :
    equityRatio > 0.1 ? 40 : 20;

  const liquidityScore =
    monthlyProfit > 0 && equityRatio > 0.1
      ? 90
      : 40;

  const score = Math.round(
    (
      leverageScore +
      cashflowScore +
      rentalScore +
      equityScore +
      liquidityScore
    ) / 5
  );

  let level = "Critical";

  if (score >= 80) level = "Low";
  else if (score >= 60) level = "Medium";
  else if (score >= 40) level = "High";

  const recommendations = [];

  if (leverageScore < 60)
    recommendations.push(
      "Reduce outstanding loan."
    );

  if (cashflowScore < 60)
    recommendations.push(
      "Increase rental or reduce expenses."
    );

  if (rentalScore < 60)
    recommendations.push(
      "Review rental pricing."
    );

  if (equityScore < 60)
    recommendations.push(
      "Build equity through repayments."
    );

  if (recommendations.length === 0)
    recommendations.push(
      "Investment risk remains well controlled."
    );

  return {

    score,

    level,

    leverage: {
      score: leverageScore,
    },

    cashflow: {
      score: cashflowScore,
    },

    rental: {
      score: rentalScore,
    },

    equity: {
      score: equityScore,
    },

    liquidity: {
      score: liquidityScore,
    },

    recommendations,

  };

}