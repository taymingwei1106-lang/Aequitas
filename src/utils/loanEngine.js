import { amount, toAmount } from "./propertyFinancials";

/*
 * Loan analysis
 *
 * Uses the interest rate, the outstanding balance and the monthly
 * instalment. It does not need the original loan amount or start date:
 * every projection starts from a balance the investor actually recorded,
 * which also keeps it correct for loans that were drawn down in stages.
 *
 * Interest is estimated monthly (rate ÷ 12). Banks usually charge daily
 * interest, so small differences against a statement are normal; the
 * tolerance below allows for that.
 */

function addMonths(month, count) {
  const [year, m] = String(month).split("-").map(Number);
  const date = new Date(year, m - 1 + count, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthsBetween(from, to) {
  const [fy, fm] = String(from).split("-").map(Number);
  const [ty, tm] = String(to).split("-").map(Number);
  return (ty - fy) * 12 + (tm - fm);
}

/* Balance after `months` instalments at a monthly rate. */
export function projectBalance(balance, monthlyRate, instalment, months) {
  let result = balance;
  for (let i = 0; i < months; i += 1) {
    result = result * (1 + monthlyRate) - instalment;
  }
  return Math.max(0, result);
}

export function remainingMonths(balance, monthlyRate, instalment) {
  if (balance <= 0) return 0;
  if (instalment <= 0) return null;
  if (monthlyRate <= 0) return Math.ceil(balance / instalment);
  if (instalment <= balance * monthlyRate) return null; // never repaid
  return Math.ceil(
    -Math.log(1 - (monthlyRate * balance) / instalment) /
      Math.log(1 + monthlyRate)
  );
}

export function analyseLoan(property, checkins = [], today = new Date()) {
  const rate = toAmount(property?.interestRate);
  const instalment = amount(property?.monthlyInstalment);
  const balance = amount(property?.outstandingLoan);

  const base = {
    hasRate: rate !== null && rate > 0,
    rate,
    lender: property?.lender || "",
    balance,
    instalment,
  };

  if (!base.hasRate || balance <= 0 || instalment <= 0) {
    return { ...base, ready: false };
  }

  const monthlyRate = rate / 100 / 12;
  const interest = balance * monthlyRate;
  const principal = instalment - interest;
  const repaying = principal > 0;
  const months = remainingMonths(balance, monthlyRate, instalment);

  const nowMonth = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;

  const tolerance = Math.max(100, instalment * 0.05);

  /*
   * Check each recorded balance against the balance expected from the
   * previous record.
   */
  const recorded = [...checkins]
    .filter((c) => c?.month && toAmount(c.outstandingLoan) !== null)
    .sort((a, b) => String(a.month).localeCompare(String(b.month)));

  const review = [];

  for (let i = 1; i < recorded.length; i += 1) {
    const before = recorded[i - 1];
    const after = recorded[i];
    const gap = monthsBetween(before.month, after.month);
    if (gap <= 0) continue;

    const paid = toAmount(after.loanInstalment) ?? instalment;
    const expected = projectBalance(
      toAmount(before.outstandingLoan),
      monthlyRate,
      paid,
      gap
    );
    const actual = toAmount(after.outstandingLoan);
    const difference = actual - expected;
    const unchanged =
      Math.abs(actual - toAmount(before.outstandingLoan)) < 0.5;

    review.push({
      month: after.month,
      previousMonth: before.month,
      actual,
      expected,
      difference,
      status: unchanged
        ? "unchanged"
        : Math.abs(difference) <= tolerance
        ? "consistent"
        : difference > 0
        ? "higher"
        : "lower",
    });
  }

  const latestRecord = recorded[recorded.length - 1];
  const anchorBalance = latestRecord
    ? toAmount(latestRecord.outstandingLoan)
    : balance;
  const anchorMonth = latestRecord ? latestRecord.month : nowMonth;

  return {
    ...base,
    ready: true,
    monthlyRate,
    interest,
    principal,
    repaying,
    interestShare: instalment > 0 ? interest / instalment : 0,
    remainingMonths: months,
    payoffMonth: months !== null ? addMonths(nowMonth, months) : null,
    remainingInterest:
      months !== null ? Math.max(0, months * instalment - balance) : null,
    tolerance,
    review,
    nextExpected: {
      month: addMonths(anchorMonth, 1),
      balance: projectBalance(anchorBalance, monthlyRate, instalment, 1),
      from: anchorBalance,
      fromMonth: anchorMonth,
    },
  };
}
