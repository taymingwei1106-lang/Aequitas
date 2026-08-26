function clamp(value, min = 0, max = 100) {
  return Math.max(
    min,
    Math.min(value, max)
  );
}

function getNumber(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return 0;
  }

  return Number(value) || 0;
}

export function calculateInvestmentHealth({
  cashflow = 0,
  loan = 0,
  marketValue = 0,
  rentalYield = 0,
  equity = 0,
  purchasePrice = 0,
}) {
  const cashflowValue =
    getNumber(cashflow);

  const loanValue =
    getNumber(loan);

  const marketValueNumber =
    getNumber(marketValue);

  const rentalYieldValue =
    getNumber(rentalYield);

  const equityValue =
    getNumber(equity);

  const purchasePriceValue =
    getNumber(purchasePrice);

  /*
   * ----------------------------------------
   * CASHFLOW SCORE — 25%
   * ----------------------------------------
   *
   * Positive cashflow is rewarded.
   * Negative cashflow reduces the score.
   *
   * The score is deliberately capped so a
   * very high cashflow property cannot
   * completely hide poor leverage.
   */

  let cashflowScore = 50;

  if (cashflowValue > 0) {
    cashflowScore =
      clamp(
        50 +
          Math.min(
            cashflowValue / 20,
            50
          )
      );
  } else if (cashflowValue < 0) {
    cashflowScore =
      clamp(
        50 +
          Math.max(
            cashflowValue / 20,
            -50
          )
      );
  }

  /*
   * ----------------------------------------
   * LEVERAGE SCORE — 25%
   * ----------------------------------------
   */

  let leverageScore = 50;

  if (marketValueNumber > 0) {
    const ltv =
      (loanValue /
        marketValueNumber) *
      100;

    if (ltv <= 50) {
      leverageScore = 100;
    } else if (ltv <= 60) {
      leverageScore = 90;
    } else if (ltv <= 70) {
      leverageScore = 80;
    } else if (ltv <= 80) {
      leverageScore = 65;
    } else if (ltv <= 90) {
      leverageScore = 45;
    } else {
      leverageScore = 20;
    }
  }

  /*
   * ----------------------------------------
   * RENTAL YIELD — 20%
   * ----------------------------------------
   */

  let rentalYieldScore = 50;

  if (rentalYieldValue >= 8) {
    rentalYieldScore = 100;
  } else if (rentalYieldValue >= 7) {
    rentalYieldScore = 90;
  } else if (rentalYieldValue >= 6) {
    rentalYieldScore = 80;
  } else if (rentalYieldValue >= 5) {
    rentalYieldScore = 70;
  } else if (rentalYieldValue >= 4) {
    rentalYieldScore = 60;
  } else if (rentalYieldValue >= 3) {
    rentalYieldScore = 45;
  } else {
    rentalYieldScore = 30;
  }

  /*
   * ----------------------------------------
   * EQUITY — 20%
   * ----------------------------------------
   */

  let equityScore = 50;

  if (marketValueNumber > 0) {
    const equityRatio =
      (equityValue /
        marketValueNumber) *
      100;

    if (equityRatio >= 50) {
      equityScore = 100;
    } else if (equityRatio >= 40) {
      equityScore = 90;
    } else if (equityRatio >= 30) {
      equityScore = 80;
    } else if (equityRatio >= 20) {
      equityScore = 70;
    } else if (equityRatio >= 10) {
      equityScore = 55;
    } else if (equityRatio > 0) {
      equityScore = 40;
    } else {
      equityScore = 20;
    }
  }

  /*
   * ----------------------------------------
   * CAPITAL GROWTH — 10%
   * ----------------------------------------
   *
   * If market value is unavailable, we do not
   * pretend the property has appreciated.
   */

  let growthScore = 50;

  const capitalGrowth =
    marketValueNumber -
    purchasePriceValue;

  if (
    marketValueNumber > 0 &&
    purchasePriceValue > 0
  ) {
    const growthPercentage =
      (capitalGrowth /
        purchasePriceValue) *
      100;

    if (growthPercentage >= 30) {
      growthScore = 100;
    } else if (growthPercentage >= 20) {
      growthScore = 90;
    } else if (growthPercentage >= 10) {
      growthScore = 80;
    } else if (growthPercentage >= 5) {
      growthScore = 70;
    } else if (growthPercentage >= 0) {
      growthScore = 60;
    } else if (growthPercentage >= -10) {
      growthScore = 45;
    } else {
      growthScore = 25;
    }
  }

  /*
   * ----------------------------------------
   * FINAL SCORE
   * ----------------------------------------
   */

  const score = Math.round(
    cashflowScore * 0.25 +
      leverageScore * 0.25 +
      rentalYieldScore * 0.20 +
      equityScore * 0.20 +
      growthScore * 0.10
  );

  let level = "Needs Attention";

  if (score >= 80) {
    level = "Strong";
  } else if (score >= 65) {
    level = "Stable";
  } else if (score >= 50) {
    level = "Moderate";
  }

  return {
    score,
    level,

    components: {
      cashflow: Math.round(
        cashflowScore
      ),

      leverage: Math.round(
        leverageScore
      ),

      rentalYield: Math.round(
        rentalYieldScore
      ),

      equity: Math.round(
        equityScore
      ),

      capitalGrowth: Math.round(
        growthScore
      ),
    },

    weights: {
      cashflow: 25,
      leverage: 25,
      rentalYield: 20,
      equity: 20,
      capitalGrowth: 10,
    },

    raw: {
      cashflow:
        cashflowValue,

      loan:
        loanValue,

      marketValue:
        marketValueNumber,

      rentalYield:
        rentalYieldValue,

      equity:
        equityValue,

      purchasePrice:
        purchasePriceValue,
    },
  };
}