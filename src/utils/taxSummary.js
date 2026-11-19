import { getMonthlyCheckins } from "../services/monthlyCheckinStorage";
import { updateProperty } from "../services/storage";
import { formatMonth, toAmount } from "./propertyFinancials";
import { paidBillTotal } from "./yearlyBills";

/*
 * Annual rental income summary (Malaysia, rental income under s.4(d) of
 * the Income Tax Act 1967, deductions per LHDN Public Ruling 12/2018).
 *
 * Built only from what the investor recorded:
 *   - Rent received, maintenance/sinking fund: monthly check-ins in the year
 *   - Quit rent, assessment tax: payments marked in Yearly bills
 *   - Loan interest, fire insurance, repairs/renewal costs: entered here,
 *     from the bank's annual statement and receipts
 *
 * A blank figure is "not entered", never zero, and is listed as missing.
 * Loan interest can be estimated from recorded balances × the interest
 * rate, but the estimate is only used if the investor chooses it.
 *
 * Entered figures are saved on the property:
 *   property.taxYears = { "2026": { loanInterest, fireInsurance, repairs } }
 */

export const ENTERED_FIELDS = [
  {
    key: "loanInterest",
    label: "Loan interest",
    hint: "Interest only, not principal. Your bank's annual loan statement shows it.",
  },
  {
    key: "fireInsurance",
    label: "Fire insurance",
    hint: "Fire / houseowner policy premium. Not mortgage insurance (MRTA/MLTA).",
  },
  {
    key: "repairs",
    label: "Repairs, renewal and rent-collection costs",
    hint: "Ordinary repairs, agent fee or stamp duty to renew a tenancy, costs of collecting rent. Not first-tenancy costs or upgrades.",
  },
];

export const NOT_DEDUCTIBLE = [
  "Loan principal (only the interest part of your instalment counts)",
  "Renovation, furnishing and upgrades (capital costs)",
  "Costs of finding the first tenant: first agent fee, first tenancy agreement and stamp duty, advertising",
  "Expenses from before the property was first rented out",
  "Mortgage insurance (MRTA / MLTA)",
];

export function defaultTaxYear(today = new Date()) {
  // Jan–Jun is filing season for the previous year.
  return today.getMonth() < 6 ? today.getFullYear() - 1 : today.getFullYear();
}

export function getEnteredFigures(property, year) {
  return property?.taxYears?.[String(year)] || {};
}

export function saveEnteredFigure(property, year, key, value) {
  const all = { ...(property?.taxYears || {}) };
  const forYear = { ...(all[String(year)] || {}), [key]: value };
  all[String(year)] = forYear;
  updateProperty(property.id, { taxYears: all });
}

function sum(list, field) {
  let total = 0;
  let count = 0;
  list.forEach((item) => {
    const value = toAmount(item?.[field]);
    if (value !== null) {
      total += value;
      count += 1;
    }
  });
  return { total, count };
}

export function buildPropertyTaxYear(property, year, checkins = getMonthlyCheckins(property?.id)) {
  const prefix = `${year}-`;
  const months = checkins
    .filter((c) => String(c?.month || "").startsWith(prefix))
    .sort((a, b) => String(a.month).localeCompare(String(b.month)));

  const rent = sum(months, "rentalReceived");
  const maintenance = sum(months, "maintenancePaid");
  const entered = getEnteredFigures(property, year);

  const quitRent = paidBillTotal(property, year, "quitRent");
  const assessment = paidBillTotal(property, year, "assessment");

  /* Interest estimate: recorded balance × rate ÷ 12 for each recorded month. */
  const rate = toAmount(property?.interestRate);
  let interestEstimate = null;
  let interestEstimateMonths = 0;
  if (rate !== null && rate > 0) {
    let total = 0;
    months.forEach((c) => {
      const balance = toAmount(c.outstandingLoan);
      if (balance !== null && balance > 0) {
        total += (balance * rate) / 100 / 12;
        interestEstimateMonths += 1;
      }
    });
    if (interestEstimateMonths > 0) interestEstimate = Math.round(total * 100) / 100;
  }

  const lines = [
    {
      key: "maintenance",
      label: "Maintenance fee and sinking fund",
      amount: months.length ? maintenance.total : null,
      source:
        months.length === 0
          ? "No check-ins recorded for this year"
          : `From ${maintenance.count} check-in${maintenance.count === 1 ? "" : "s"}`,
    },
    {
      key: "quitRent",
      label: "Quit rent",
      amount: quitRent.paidCount ? quitRent.total : null,
      source: quitRent.paidCount
        ? quitRent.missingAmount
          ? "Marked paid, but the amount wasn't entered"
          : "From Yearly bills"
        : "Not marked paid in Yearly bills",
      incomplete: quitRent.missingAmount > 0,
    },
    {
      key: "assessment",
      label: "Assessment tax",
      amount: assessment.paidCount ? assessment.total : null,
      source: assessment.paidCount
        ? `${assessment.paidCount} of ${assessment.billCount} halves marked paid${
            assessment.missingAmount ? " (an amount is missing)" : ""
          }`
        : "Not marked paid in Yearly bills",
      incomplete: assessment.missingAmount > 0 || assessment.paidCount < assessment.billCount,
    },
    ...ENTERED_FIELDS.map((field) => ({
      key: field.key,
      label: field.label,
      amount: toAmount(entered[field.key]),
      source: toAmount(entered[field.key]) === null ? "Not entered" : "Entered by you",
      entered: true,
    })),
  ];

  const deductions = lines.reduce((total, line) => total + (line.amount ?? 0), 0);
  const grossRent = months.length ? rent.total : null;
  const net = grossRent !== null ? grossRent - deductions : null;

  const otherExpenses = months
    .filter((c) => (toAmount(c.otherExpenses) ?? 0) > 0)
    .map((c) => ({ month: c.month, amount: toAmount(c.otherExpenses), note: c.note || "" }));

  const missing = lines.filter((line) => line.amount === null || line.incomplete).map((line) => line.label);

  return {
    property,
    name: property?.projectName || "Unnamed property",
    year,
    months,
    monthsRecorded: months.length,
    monthRange:
      months.length === 0
        ? "No months recorded"
        : months.length === 1
        ? formatMonth(months[0].month)
        : `${formatMonth(months[0].month)} to ${formatMonth(months[months.length - 1].month)}`,
    grossRent,
    lines,
    deductions,
    net,
    interestEstimate,
    interestEstimateMonths,
    hasRate: rate !== null && rate > 0,
    otherExpenses,
    missing,
  };
}

export function buildTaxSummary(properties = [], year) {
  const rows = properties.map((property) => buildPropertyTaxYear(property, year));
  const withIncome = rows.filter((row) => row.grossRent !== null);

  return {
    year,
    rows,
    grossRent: withIncome.reduce((t, r) => t + r.grossRent, 0),
    deductions: withIncome.reduce((t, r) => t + r.deductions, 0),
    profit: withIncome.reduce((t, r) => t + Math.max(0, r.net), 0),
    losses: withIncome.filter((r) => r.net < 0),
    noData: rows.filter((r) => r.grossRent === null),
  };
}

/* ---------- Excel export ---------- */

export function taxSummarySheets(summary, generatedOn = new Date()) {
  const money = (v) => (v === null || v === undefined ? "" : { v, s: "money" });
  const moneyBold = (v) => (v === null || v === undefined ? "" : { v, s: "moneyBold" });
  const header = (v) => ({ v, s: "header" });
  const headerMoney = (v) => ({ v, s: "headerMoney" });
  const note = (v) => ({ v, s: "note" });
  const generated = generatedOn.toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" });

  const lineKeys = ["maintenance", "quitRent", "assessment", "loanInterest", "fireInsurance", "repairs"];
  const lineLabels = [
    "Maintenance & sinking fund",
    "Quit rent",
    "Assessment tax",
    "Loan interest",
    "Fire insurance",
    "Repairs & renewal",
  ];

  const summaryRows = [
    [{ v: `Rental income summary ${summary.year}`, s: "title" }],
    [note(`Prepared with Aequitas on ${generated}. Amounts in RM. A blank cell means the figure was not recorded.`)],
    [],
    [
      header("Property"),
      header("Months recorded"),
      headerMoney("Gross rent received"),
      ...lineLabels.map(headerMoney),
      headerMoney("Total deductions"),
      headerMoney("Net rental income"),
    ],
    ...summary.rows.map((row) => [
      row.name,
      `${row.monthsRecorded} of 12`,
      money(row.grossRent),
      ...lineKeys.map((key) => money(row.lines.find((l) => l.key === key)?.amount ?? null)),
      money(row.grossRent !== null ? row.deductions : null),
      money(row.net),
    ]),
    [
      { v: "Total", s: "bold" },
      "",
      moneyBold(summary.grossRent),
      ...lineKeys.map((key) => {
        const amounts = summary.rows
          .filter((r) => r.grossRent !== null)
          .map((r) => r.lines.find((l) => l.key === key)?.amount ?? null)
          .filter((v) => v !== null);
        return amounts.length ? moneyBold(amounts.reduce((t, v) => t + v, 0)) : "";
      }),
      moneyBold(summary.deductions),
      "",
    ],
    [{ v: "Net rental income from profitable properties", s: "bold" }, "", moneyBold(summary.profit)],
    [],
    ...(summary.losses.length
      ? [
          [
            note(
              `Loss shown separately: ${summary.losses
                .map((r) => r.name)
                .join(", ")}. A rental loss can't be carried forward or set against salary; ask your tax agent whether it can offset another property's profit.`
            ),
          ],
        ]
      : []),
    ...summary.rows
      .filter((r) => r.missing.length)
      .map((r) => [note(`${r.name}: still to complete: ${r.missing.join(", ")}.`)]),
    [note("This summary organises your records. It is not tax advice; check it with your tax agent before filing.")],
  ];

  const sheets = [
    {
      name: `Summary ${summary.year}`,
      widths: [32, 16, 20, 27, 12, 16, 15, 15, 18, 18, 20],
      rows: summaryRows,
    },
  ];

  summary.rows.forEach((row) => {
    const rows = [
      [{ v: `${row.name}: ${summary.year}`, s: "title" }],
      [note(`${row.monthsRecorded} of 12 months recorded (${row.monthRange}).`)],
      [],
      [header("Month"), headerMoney("Rent received"), headerMoney("Maintenance paid"), headerMoney("Other expenses"), headerMoney("Loan balance"), header("Note")],
      ...row.months.map((c) => [
        formatMonth(c.month),
        money(toAmount(c.rentalReceived)),
        money(toAmount(c.maintenancePaid)),
        money(toAmount(c.otherExpenses)),
        money(toAmount(c.outstandingLoan)),
        c.note || "",
      ]),
      [],
      [header("Deductions"), headerMoney("Amount"), header("Source")],
      ...row.lines.map((line) => [line.label, money(line.amount), line.source]),
      [{ v: "Total deductions", s: "bold" }, moneyBold(row.grossRent !== null ? row.deductions : null)],
      [],
      [{ v: "Gross rent received", s: "bold" }, moneyBold(row.grossRent)],
      [{ v: "Net rental income", s: "bold" }, moneyBold(row.net)],
    ];

    if (row.otherExpenses.length) {
      rows.push(
        [],
        [note("Other expenses recorded in check-ins. Only repairs, renewal and rent-collection costs are deductible; add those to the Repairs line.")]
      );
      row.otherExpenses.forEach((item) => rows.push([formatMonth(item.month), money(item.amount), item.note]));
    }

    sheets.push({ name: row.name, widths: [34, 16, 18, 16, 16, 40], rows });
  });

  sheets.push({
    name: "Notes",
    widths: [100],
    rows: [
      [{ v: "How this summary is built", s: "title" }],
      ["Rental income from letting property you don't run as a business is taxed under section 4(d) of the Income Tax Act 1967."],
      ["Deductions follow LHDN Public Ruling No. 12/2018 (Income from Letting of Real Property)."],
      ["Gross rent and maintenance come from your monthly check-ins; months without a check-in are not counted."],
      ["Quit rent and assessment tax come from the payments marked in Yearly bills."],
      ["Loan interest, fire insurance and repairs are the figures you entered."],
      [],
      [{ v: "Not deductible", s: "bold" }],
      ...NOT_DEDUCTIBLE.map((item) => [item]),
      [],
      [note("Not tax advice. Check figures and treatment with your tax agent before filing.")],
    ],
  });

  return sheets;
}
