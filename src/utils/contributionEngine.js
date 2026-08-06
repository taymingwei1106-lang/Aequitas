export function calculateContribution(
  property,
  portfolio = []
) {

  if (!portfolio.length) {

    return {

      value: 100,

      rental: 100,

      equity: 100,

      cashflow: 100,

    };

  }

  const totalValue = portfolio.reduce(
    (sum, p) =>
      sum + Number(p.marketValue || p.purchasePrice || 0),
    0
  );

  const totalRental = portfolio.reduce(
    (sum, p) =>
      sum + Number(p.monthlyRental || 0),
    0
  );

  const totalEquity = portfolio.reduce(
    (sum, p) =>
      sum +
      (
        Number(p.marketValue || p.purchasePrice || 0) -
        Number(p.outstandingLoan || 0)
      ),
    0
  );

  const totalCashflow = portfolio.reduce(
    (sum, p) => {

      const income =
        Number(p.monthlyRental || 0);

      const expenses =
        Number(p.monthlyInstalment || 0) +
        Number(p.maintenanceFee || 0) +
        Number(p.insurance || 0) +
        Number(p.managementFee || 0) +
        Number(p.otherExpenses || 0);

      return sum + (income - expenses);

    },
    0
  );

  const propertyValue =
    Number(
      property.marketValue ||
      property.purchasePrice ||
      0
    );

  const propertyRental =
    Number(property.monthlyRental || 0);

  const propertyEquity =
    propertyValue -
    Number(property.outstandingLoan || 0);

  const propertyCashflow =
    propertyRental -
    (
      Number(property.monthlyInstalment || 0) +
      Number(property.maintenanceFee || 0) +
      Number(property.insurance || 0) +
      Number(property.managementFee || 0) +
      Number(property.otherExpenses || 0)
    );

  return {

    value:
      totalValue
        ? Math.round(propertyValue / totalValue * 100)
        : 0,

    rental:
      totalRental
        ? Math.round(propertyRental / totalRental * 100)
        : 0,

    equity:
      totalEquity
        ? Math.round(propertyEquity / totalEquity * 100)
        : 0,

    cashflow:
      totalCashflow
        ? Math.round(propertyCashflow / totalCashflow * 100)
        : 0,

  };

}