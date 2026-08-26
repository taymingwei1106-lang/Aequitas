export function calculateEquity({
  purchasePrice = 0,
  currentValue = 0,
  outstandingLoan = 0,
  renovationCost = 0,
  legalFees = 0,
  stampDuty = 0,
  agentCommission = 3,
}) {
  const commission =
    currentValue * (agentCommission / 100);

  const sellingCosts =
    commission + legalFees;

  const totalInvestment =
    purchasePrice +
    renovationCost +
    stampDuty +
    legalFees;

  const currentEquity =
    currentValue - outstandingLoan;

  const netSaleProceeds =
    currentValue -
    outstandingLoan -
    sellingCosts;

  const profit =
    netSaleProceeds -
    (
      purchasePrice +
      renovationCost +
      stampDuty
    );

  const breakEvenPrice =
    (
      purchasePrice +
      renovationCost +
      stampDuty +
      legalFees +
      outstandingLoan
    ) /
    (1 - agentCommission / 100);

  return {
    commission,
    sellingCosts,
    totalInvestment,
    currentEquity,
    netSaleProceeds,
    profit,
    breakEvenPrice,
  };
}