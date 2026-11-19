function hasValue(value) {
  return (
    value !== undefined &&
    value !== null &&
    value !== ""
  );
}

function getPropertyValue(property) {
  if (
    hasValue(property?.marketValue) &&
    Number(property.marketValue) > 0
  ) {
    return Number(property.marketValue);
  }

  return Number(
    property?.currentValue ??
    property?.purchasePrice ??
    0
  );
}

function hasReliableMarketValue(property) {
  return (
    hasValue(property?.marketValue) &&
    Number(property.marketValue) > 0
  );
}

function getLoan(property) {
  return Number(
    property?.loanBalance ??
    property?.outstandingLoan ??
    0
  );
}

function getRental(property) {
  return Number(
    property?.monthlyRent ??
    property?.monthlyRental ??
    0
  );
}

function getRepayment(property) {
  return Number(
    property?.monthlyRepayment ??
    property?.monthlyInstalment ??
    0
  );
}

function getCashflow(property) {
  if (
    typeof property?.monthlyCashflow === "number"
  ) {
    return property.monthlyCashflow;
  }

  return (
    getRental(property) -
    getRepayment(property)
  );
}

function getEquity(property) {
  const value =
    getPropertyValue(property);

  const loan =
    getLoan(property);

  return value - loan;
}

export function generateOpportunities(portfolio) {
  const opportunities = {
    refinance: [],
    equity: [],
    rental: [],
    sell: [],
  };

  const properties = Array.isArray(
    portfolio?.properties
  )
    ? portfolio.properties
    : [];

  properties.forEach((property) => {
    if (!property) return;

    const propertyValue =
      getPropertyValue(property);

    const loan =
      getLoan(property);

    const equity =
      getEquity(property);

    const cashflow =
      getCashflow(property);

    /*
     * REFINANCING
     *
     * High LTV by itself is NOT a refinancing
     * opportunity.
     *
     * We require a reliable current market value
     * before surfacing a financing review.
     *
     * If market value is unavailable, Aequitas
     * should monitor rather than recommend action.
     */

    if (
      hasReliableMarketValue(property) &&
      propertyValue > 0
    ) {
      const ltv =
        (loan / propertyValue) * 100;

      /*
       * Even here, we call this a REVIEW rather
       * than an automatic refinancing decision.
       *
       * The actual recommendation layer should
       * consider rates, lock-in period, fees and
       * potential savings when those fields exist.
       */
      if (
        ltv >= 80 &&
        equity > 0
      ) {
        opportunities.refinance.push(
          property
        );
      }
    }

    /*
     * EQUITY RELEASE
     *
     * Only surface when there is meaningful
     * positive equity.
     */
    if (equity > 300000) {
      opportunities.equity.push(
        property
      );
    }

    /*
     * RENTAL OPTIMISATION
     *
     * Negative recurring cashflow is a real
     * condition worth reviewing.
     */
    if (cashflow < 0) {
      opportunities.rental.push(
        property
      );
    }

    /*
     * SELL OPPORTUNITY
     *
     * Only use actual appreciation data.
     * If market value is unavailable, don't
     * manufacture a capital gain.
     */
    if (
      hasReliableMarketValue(property) &&
      propertyValue -
        Number(
          property?.purchasePrice ?? 0
        ) >
        300000
    ) {
      opportunities.sell.push(
        property
      );
    }
  });

  return opportunities;
}