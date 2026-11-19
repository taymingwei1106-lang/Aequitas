function getProperties(portfolio) {
  return Array.isArray(
    portfolio?.properties
  )
    ? portfolio.properties
    : [];
}

function getValue(property) {
  if (
    property?.marketValue !== undefined &&
    property?.marketValue !== null &&
    property?.marketValue !== ""
  ) {
    return Number(property.marketValue) || 0;
  }

  return Number(
    property?.currentValue ??
    property?.purchasePrice ??
    0
  ) || 0;
}

function getLoan(property) {
  return Number(
    property?.loanBalance ??
    property?.outstandingLoan ??
    0
  ) || 0;
}

function getRental(property) {
  return Number(
    property?.monthlyRent ??
    property?.monthlyRental ??
    0
  ) || 0;
}

function getRepayment(property) {
  return Number(
    property?.monthlyRepayment ??
    property?.monthlyInstalment ??
    0
  ) || 0;
}

function getCashflow(property) {
  if (
    typeof property?.monthlyCashflow ===
    "number"
  ) {
    return property.monthlyCashflow;
  }

  return (
    getRental(property) -
    getRepayment(property)
  );
}

function getEquity(property) {
  return (
    getValue(property) -
    getLoan(property)
  );
}

function calculatePortfolioMetrics(
  portfolio
) {
  const properties =
    getProperties(portfolio);

  const propertyCount =
    properties.length;

  const totalValue =
    properties.reduce(
      (sum, property) =>
        sum + getValue(property),
      0
    );

  const totalDebt =
    properties.reduce(
      (sum, property) =>
        sum + getLoan(property),
      0
    );

  const totalEquity =
    properties.reduce(
      (sum, property) =>
        sum + getEquity(property),
      0
    );

  const totalRental =
    properties.reduce(
      (sum, property) =>
        sum + getRental(property),
      0
    );

  const totalCashflow =
    properties.reduce(
      (sum, property) =>
        sum + getCashflow(property),
      0
    );

  const averageLTV =
    totalValue > 0
      ? (totalDebt / totalValue) * 100
      : 0;

  return {
    propertyCount,
    totalValue,
    totalDebt,
    totalEquity,
    totalRental,
    totalCashflow,
    averageLTV,
  };
}

export function generateExecutiveSummary(
  portfolio
) {
  const metrics =
    calculatePortfolioMetrics(
      portfolio
    );

  return {
    properties:
      metrics.propertyCount,

    portfolioValue:
      metrics.totalValue,

    totalDebt:
      metrics.totalDebt,

    totalEquity:
      metrics.totalEquity,

    monthlyRental:
      metrics.totalRental,

    monthlyCashflow:
      metrics.totalCashflow,

    averageLTV:
      metrics.averageLTV,
  };
}

export function generatePortfolioScore(
  portfolio
) {
  const {
    propertyCount,
    totalEquity,
    totalCashflow,
    averageLTV,
  } =
    calculatePortfolioMetrics(
      portfolio
    );

  let score = 50;

  /*
   * Diversification
   */
  if (propertyCount >= 3) {
    score += 10;
  }

  if (propertyCount >= 5) {
    score += 5;
  }

  /*
   * Leverage
   */
  if (averageLTV < 70) {
    score += 15;
  } else if (averageLTV < 80) {
    score += 10;
  } else if (averageLTV > 90) {
    score -= 10;
  }

  /*
   * Equity
   */
  if (totalEquity > 500000) {
    score += 10;
  }

  if (totalEquity > 1000000) {
    score += 10;
  }

  if (totalEquity < 0) {
    score -= 10;
  }

  /*
   * Cashflow
   */
  if (totalCashflow > 0) {
    score += 5;
  }

  if (totalCashflow < 0) {
    score -= 10;
  }

  return {
    score: Math.max(
      0,
      Math.min(score, 100)
    ),
  };
}

export function generateFinancialHealth(
  portfolio
) {
  const {
    averageLTV,
    totalDebt,
    totalEquity,
    totalCashflow,
  } =
    calculatePortfolioMetrics(
      portfolio
    );

  return {
    loanToValue:
      averageLTV,

    totalDebt,

    totalEquity,

    cashflow:
      totalCashflow,
  };
}

export function generateRiskAnalysis(
  portfolio
) {
  const {
    propertyCount,
    averageLTV,
    totalEquity,
    totalCashflow,
  } =
    calculatePortfolioMetrics(
      portfolio
    );

  let overall = "Low";

  if (
    averageLTV > 80 ||
    totalEquity < 0 ||
    totalCashflow < 0
  ) {
    overall = "High";
  } else if (
    averageLTV > 70
  ) {
    overall = "Medium";
  }

  return {
    overall,

    diversification:
      propertyCount >= 5
        ? "Excellent"
        : propertyCount >= 3
        ? "Good"
        : "Limited",

    leverage:
      averageLTV,

    equity:
      totalEquity,

    cashflow:
      totalCashflow,
  };
}