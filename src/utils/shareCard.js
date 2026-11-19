import { getMonthlyCheckins } from "../services/monthlyCheckinStorage";
import {
  amount,
  formatMonth,
  getCheckinCashflow,
  getCurrentValue,
  getMonthlyCashflow,
  toAmount,
} from "./propertyFinancials";

/*
 * Figures for the shareable portfolio card.
 *
 *   Capital gain   = recorded market value − net purchase price
 *                    (properties with a market value only; a property
 *                    still at purchase price has no measured gain)
 *   Cashflow       = sum of every recorded check-in's cashflow
 *   Total return   = capital gain + cashflow collected
 *   Equity         = value − outstanding loan (the dashboard definition)
 *
 * Percentages are on the net purchase price of the properties included.
 * The card says when properties are left out or values are estimates.
 */

export function buildShareData(properties = []) {
  const perProperty = properties.map((property) => {
    const price = toAmount(property.purchasePrice);
    const netPrice = price !== null && price > 0 ? price - amount(property.purchaseDiscount) : null;
    const current = getCurrentValue(property);
    const valued = current.source === "market" && netPrice !== null;
    const checkins = getMonthlyCheckins(property.id).filter((c) => c?.month);

    return {
      id: property.id,
      name: property.projectName || "Unnamed property",
      netPrice,
      value: current.value,
      valued,
      gain: valued ? current.value - netPrice : null,
      loan: amount(property.outstandingLoan),
      cashflowCollected: checkins.reduce((t, c) => t + getCheckinCashflow(c), 0),
      checkins,
      monthlyCashflow: getMonthlyCashflow(property).cashflow,
    };
  });

  const valued = perProperty.filter((p) => p.valued);
  const priced = perProperty.filter((p) => p.netPrice !== null);

  const gain = valued.reduce((t, p) => t + p.gain, 0);
  const gainBase = valued.reduce((t, p) => t + p.netPrice, 0);

  const cashflowCollected = perProperty.reduce((t, p) => t + p.cashflowCollected, 0);
  const totalReturn = gain + cashflowCollected;
  const returnBase = priced.reduce((t, p) => t + p.netPrice, 0);

  const totalValue = perProperty.reduce((t, p) => t + p.value, 0);
  const totalLoan = perProperty.reduce((t, p) => t + p.loan, 0);
  const equity = totalValue - totalLoan;

  /* Portfolio cashflow per month, last 12 months with any check-in. */
  const byMonth = new Map();
  perProperty.forEach((p) =>
    p.checkins.forEach((c) => {
      byMonth.set(c.month, (byMonth.get(c.month) || 0) + getCheckinCashflow(c));
    })
  );
  const months = [...byMonth.keys()].sort().slice(-12);
  const series = months.map((month) => ({ month, value: byMonth.get(month) }));
  const allMonths = [...byMonth.keys()].sort();

  const pct = (value, base) => (base > 0 ? (value / base) * 100 : null);

  return {
    count: perProperty.length,
    names: perProperty.map((p) => p.name),
    unvalued: perProperty.filter((p) => !p.valued).map((p) => p.name),
    gain: valued.length ? gain : null,
    gainPct: valued.length ? pct(gain, gainBase) : null,
    valuedCount: valued.length,
    cashflowCollected,
    cashflowMonths: allMonths.length,
    positiveMonths: allMonths.filter((m) => byMonth.get(m) >= 0).length,
    firstMonth: allMonths[0] || null,
    totalReturn,
    totalReturnPct: pct(totalReturn, returnBase),
    totalValue,
    totalLoan,
    equity,
    equityPct: totalValue > 0 ? (equity / totalValue) * 100 : null,
    monthlyCashflow: perProperty.reduce((t, p) => t + p.monthlyCashflow, 0),
    series,
    seriesLabel:
      series.length > 1
        ? `${formatMonth(series[0].month)} to ${formatMonth(series[series.length - 1].month)}`
        : "",
  };
}

/* "+RM 45,280" / "−RM 1,200" (true minus sign) */
export function signedRM(value) {
  const rounded = Math.round(value);
  const sign = rounded > 0 ? "+" : rounded < 0 ? "−" : "";
  return `${sign}RM ${Math.abs(rounded).toLocaleString("en-MY")}`;
}

export function plainRM(value) {
  const rounded = Math.round(value);
  return `${rounded < 0 ? "−" : ""}RM ${Math.abs(rounded).toLocaleString("en-MY")}`;
}

export function signedPct(value) {
  if (value === null || value === undefined) return null;
  const fixed = Math.abs(value) < 10 ? value.toFixed(1) : value.toFixed(0);
  const n = Number(fixed);
  return `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(Math.abs(value) < 10 ? 1 : 0)}%`;
}
