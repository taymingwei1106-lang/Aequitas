import { getMonthlyCashflow } from "./propertyFinancials";

/*
 * Monthly profit = the shared Aequitas cashflow definition
 * (rental + other income − instalment − recurring expenses).
 * Return shape is unchanged for existing components.
 */
export function calculateProfit(property) {
    const flow = getMonthlyCashflow(property);

    const monthlyProfit = flow.cashflow;

    return {
        monthlyProfit,
        yearlyProfit: monthlyProfit * 12,
        expenses: flow.outgoings,
        profitable: monthlyProfit >= 0,
    };
}
