export function calculateEquityBreakeven({

  purchasePrice = 0,

  marketValue = 0,

  outstandingLoan = 0,

  renovationCost = 0,

  legalFees = 0,

  stampDuty = 0,

  agentCommissionRate = 3,

}) {

  const commission =
    marketValue *
    (agentCommissionRate / 100);

  const totalSellingCosts =
    commission +
    legalFees;

  const totalInvestment =
    purchasePrice +
    renovationCost +
    stampDuty +
    legalFees;

  const currentEquity =
    marketValue -
    outstandingLoan;

  const netSaleProceeds =
    marketValue -
    outstandingLoan -
    totalSellingCosts;

  const breakEvenPrice =
    totalInvestment +
    outstandingLoan +
    totalSellingCosts;

  const profit =
    netSaleProceeds -
    totalInvestment;

  return {

    currentEquity:
      Math.round(currentEquity),

    commission:
      Math.round(commission),

    totalSellingCosts:
      Math.round(totalSellingCosts),

    netSaleProceeds:
      Math.round(netSaleProceeds),

    breakEvenPrice:
      Math.round(breakEvenPrice),

    profit:
      Math.round(profit),

  };

}