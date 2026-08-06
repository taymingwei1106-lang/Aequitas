export function calculateForecast({
  marketValue = 0,
  outstandingLoan = 0,
  monthlyRental = 0,
  annualGrowthRate = 4,
  annualRentalGrowth = 2,
  years = 5,
}) {

  const futureMarketValue =
    marketValue *
    Math.pow(
      1 + annualGrowthRate / 100,
      years
    );

  const futureRental =
    monthlyRental *
    Math.pow(
      1 + annualRentalGrowth / 100,
      years
    );

  /*
    Simple assumption:
    Loan reduces by 2% yearly.
    We can replace this later with
    a real amortisation schedule.
  */

  const futureLoan =
    outstandingLoan *
    Math.pow(0.98, years);

  const futureEquity =
    futureMarketValue -
    futureLoan;

  const capitalGrowth =
    futureMarketValue -
    marketValue;

  return {

    years,

    marketValueToday:
      marketValue,

    futureMarketValue:
      Math.round(futureMarketValue),

    capitalGrowth:
      Math.round(capitalGrowth),

    futureLoan:
      Math.round(futureLoan),

    futureEquity:
      Math.round(futureEquity),

    futureRental:
      Math.round(futureRental),

  };

}