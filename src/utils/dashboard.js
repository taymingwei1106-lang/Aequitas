import { amount, getCurrentValue } from "./propertyFinancials";

/*
 * Portfolio snapshot for the Home dashboard.
 *
 * totalValue uses each property's recorded market value, falling back to
 * the purchase price when no valuation has been recorded. The properties
 * relying on that fallback are listed so the screen can say so.
 */
export function calculateDashboard(properties = []) {
  return properties.reduce(
    (summary, property) => {
      const value = getCurrentValue(property);

      summary.totalValue += value.value;
      summary.totalLoan += amount(property.outstandingLoan);
      summary.totalRental += amount(property.monthlyRental);
      summary.totalProperties += 1;

      if (value.source !== "market") {
        summary.valuedAtPurchasePrice.push(
          property.projectName || "Unnamed property"
        );
      }

      return summary;
    },
    {
      totalValue: 0,
      totalLoan: 0,
      totalRental: 0,
      totalProperties: 0,
      valuedAtPurchasePrice: [],
    }
  );
}
