import { formatRM, getMonthlyCashflow, toAmount } from "./propertyFinancials";

/*
 * Acquisition & capital invested
 *
 * Separates three different questions that were previously mixed into one
 * "Total Capital Invested" figure:
 *
 *   1. What did the property cost?
 *        SPA price − purchase discount           = net purchase price
 *        + legal fees, stamp duty, other costs   = total acquisition cost
 *        + renovation, furnishing                = total cost
 *
 *   2. How was it paid for?
 *        total cost − original loan amount       = own cash put in
 *        − cashback received                     = net cash invested
 *
 *   3. What does that cash earn?
 *        annual cashflow ÷ net cash invested     = cash-on-cash return
 *
 * Rules:
 * - A blank field is "not entered", never zero. Figures that depend on a
 *   missing field are not calculated; the field is listed as missing.
 * - Cashback is money paid back to the investor (by the developer or the
 *   bank). It reduces the cash invested, not the contract price.
 * - The outstanding loan is never used in place of the original loan
 *   amount: it changes every month and would misstate the cash invested.
 */

const FIELDS = {
  purchasePrice: "SPA purchase price",
  purchaseDiscount: "Purchase discount / rebate",
  legalFees: "Legal fees",
  stampDuty: "Stamp duty",
  miscellaneousCost: "Other acquisition costs",
  renovationCost: "Renovation",
  furnishingCost: "Furnishing",
  originalLoanAmount: "Original loan amount",
  loanCashback: "Cashback received",
};

const SOURCES = {
  developer: "from the developer",
  bank: "from the bank",
  other: "",
};

export function calculateAcquisition(property = {}) {
  const v = Object.fromEntries(
    Object.keys(FIELDS).map((key) => [key, toAmount(property?.[key])])
  );
  const val = (key) => v[key] ?? 0;

  const missing = Object.keys(FIELDS)
    .filter((key) => v[key] === null)
    .map((key) => ({ key, label: FIELDS[key] }));

  const hasPrice = v.purchasePrice !== null && v.purchasePrice > 0;
  const hasLoan = v.originalLoanAmount !== null;

  const netPurchasePrice = hasPrice
    ? val("purchasePrice") - val("purchaseDiscount")
    : null;

  const acquisitionCosts =
    val("legalFees") + val("stampDuty") + val("miscellaneousCost");
  const improvementCosts = val("renovationCost") + val("furnishingCost");

  const totalAcquisitionCost = hasPrice
    ? netPurchasePrice + acquisitionCosts
    : null;
  const totalCost = hasPrice ? totalAcquisitionCost + improvementCosts : null;

  const cashback = val("loanCashback");
  const effectiveCost = hasPrice ? totalCost - cashback : null;

  const ownCash = hasPrice && hasLoan ? totalCost - v.originalLoanAmount : null;
  const netCashInvested = ownCash !== null ? ownCash - cashback : null;

  const annualCashflow = getMonthlyCashflow(property).cashflow * 12;

  let cashOnCash = null;
  let cashOnCashNote = null;
  if (netCashInvested === null) {
    cashOnCashNote = "Needs the original loan amount.";
  } else if (netCashInvested <= 0) {
    cashOnCashNote =
      "Not meaningful: the cash you received back is at least what you put in, so there is no net cash to earn a return on.";
  } else {
    cashOnCash = (annualCashflow / netCashInvested) * 100;
  }

  /* Plausibility checks: shown as notes, never blocking. */
  const checks = [];

  if (hasPrice && hasLoan && v.originalLoanAmount > netPurchasePrice) {
    checks.push(
      `The loan amount (${formatRM(v.originalLoanAmount)}) is more than the net purchase price ` +
        `(${formatRM(netPurchasePrice)}). This can happen when insurance (MRTA/MLTA) or legal fees ` +
        "were added to the loan; otherwise check both figures."
    );
  }

  if (hasPrice && v.originalLoanAmount !== null && v.originalLoanAmount <= 0) {
    checks.push("The original loan amount is zero. If the property was bought with a loan, check this figure.");
  }

  if (
    hasPrice &&
    val("purchaseDiscount") + cashback > val("purchasePrice") * 0.2
  ) {
    checks.push(
      "Discount and cashback together exceed 20% of the SPA price. Check that the same rebate isn't recorded twice (once as a discount and again as cashback)."
    );
  }

  const source = SOURCES[property?.cashbackSource] ?? "";

  return {
    values: v,
    missing,
    hasPrice,
    hasLoan,
    netPurchasePrice,
    acquisitionCosts,
    improvementCosts,
    totalAcquisitionCost,
    totalCost,
    cashback,
    cashbackSource: source,
    effectiveCost,
    ownCash,
    netCashInvested,
    annualCashflow,
    cashOnCash,
    cashOnCashNote,
    checks,
  };
}
