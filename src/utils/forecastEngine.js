import { projectBalance } from "./loanEngine";

/*
 * 5-year projection (illustrative).
 *
 * - Property value and rent compound at the growth rates set in Settings
 *   (defaults 4% and 2% a year).
 * - Loan: when an interest rate and instalment are recorded, the balance is
 *   projected month by month at that rate. Otherwise a simplified 2% a year
 *   reduction is used, and the result says so.
 */
export function calculateForecast({
  marketValue = 0,
  outstandingLoan = 0,
  monthlyRental = 0,
  annualGrowthRate = 4,
  annualRentalGrowth = 2,
  interestRate = null,
  monthlyInstalment = 0,
  years = 5,
}) {
  const futureMarketValue = marketValue * Math.pow(1 + annualGrowthRate / 100, years);
  const futureRental = monthlyRental * Math.pow(1 + annualRentalGrowth / 100, years);

  const amortised = interestRate > 0 && monthlyInstalment > 0 && outstandingLoan > 0;

  const futureLoan = amortised
    ? projectBalance(outstandingLoan, interestRate / 100 / 12, monthlyInstalment, years * 12)
    : outstandingLoan * Math.pow(0.98, years);

  const futureEquity = futureMarketValue - futureLoan;
  const capitalGrowth = futureMarketValue - marketValue;

  return {
    years,
    marketValueToday: marketValue,
    futureMarketValue: Math.round(futureMarketValue),
    capitalGrowth: Math.round(capitalGrowth),
    futureLoan: Math.round(futureLoan),
    futureEquity: Math.round(futureEquity),
    futureRental: Math.round(futureRental),
    assumptions: {
      annualGrowthRate,
      annualRentalGrowth,
      loanMethod: amortised ? "amortised" : "simplified",
      interestRate: amortised ? interestRate : null,
    },
  };
}
