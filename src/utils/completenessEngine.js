import { getFreshness } from "./freshnessEngine";
import { getTenancyDates } from "./tenancies";
import { toAmount } from "./propertyFinancials";

/*
 * "Complete this property"
 *
 * Optional details that unlock specific Aequitas features. Each item says
 * what it enables and links to where it is entered.
 */

export function getCompleteness(property, today = new Date()) {
  const id = property?.id;
  const edit = (step) => `/property/${id}/edit?step=${step}`;
  const monthly = `/property/${id}?tab=monthly`;
  const has = (key) => toAmount(property?.[key]) !== null;
  const freshness = getFreshness(property, today);
  const tenancy = getTenancyDates(property);
  const rented = (toAmount(property?.monthlyRental) ?? 0) > 0;

  const items = [
    {
      key: "checkin",
      label: freshness.status === "none" ? "Record your first check-in" : `Record the ${freshness.label.replace(/ (due|overdue)$/, "")}`,
      why: "Keeps cashflow history and loan checks current.",
      done: freshness.status === "up-to-date",
      to: monthly,
      action: "Record",
    },
    {
      key: "rate",
      label: "Add the loan interest rate",
      why: "Checks each loan balance and projects repayment.",
      done: has("interestRate") || !((toAmount(property?.outstandingLoan) ?? 0) > 0),
      to: edit(2),
      action: "Add",
    },
    {
      key: "marketValue",
      label: "Add a market value",
      why: "Measures equity and capital growth.",
      done: (toAmount(property?.marketValue) ?? 0) > 0,
      to: edit(1),
      action: "Add",
    },
    {
      key: "purchaseDate",
      label: "Add the purchase date",
      why: "Sets the RPGT holding period and your timeline.",
      done: Boolean(property?.purchaseDate),
      to: edit(1),
      action: "Add",
    },
    {
      key: "originalLoan",
      label: "Add the original loan amount",
      why: "Shows how much of your own money is in the property.",
      done: has("originalLoanAmount"),
      to: edit(2),
      action: "Add",
    },
    {
      key: "purchaseCosts",
      label: "Add legal fees and stamp duty",
      why: "Completes the Investment Breakdown and RPGT cost base.",
      done: has("legalFees") && has("stampDuty"),
      to: edit(1),
      action: "Add",
    },
  ];

  if (rented) {
    items.push({
      key: "tenancy",
      label: "Record your tenant and tenancy dates",
      why: "Reminds you before the tenancy runs out and keeps deposits on record.",
      done: Boolean(tenancy.endDate) || tenancy.ended,
      to: `${monthly}#tenant`,
      action: "Add",
    });
  }

  const doneCount = items.filter((i) => i.done).length;

  return {
    items,
    missing: items.filter((i) => !i.done),
    doneCount,
    total: items.length,
  };
}
