import { getMonthlyCashflow } from "./propertyFinancials";

/*
 * Previously read a non-existent "monthlyLoan" field, so the loan instalment
 * was left out of cashflow. Now uses the shared definition.
 * Return shape is unchanged for existing components.
 */
export function calculateCashflow(property) {
    const flow = getMonthlyCashflow(property);

    return {
        rental: flow.rental,
        expenses: flow.outgoings,
        monthlyCashflow: flow.cashflow,
        annualCashflow: flow.cashflow * 12,
        positive: flow.cashflow >= 0,
    };
}
