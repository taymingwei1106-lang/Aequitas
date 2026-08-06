import { calculatePropertyScore } from "./PropertyScoreEngine";
import { calculatePropertyStatus } from "./propertyStatusEngine";
import { calculateHealth } from "./healthEngine";
import { calculateInvestment } from "./investmentEngine";
import { calculateMonthlyCommitments } from "./monthlyCommitmentEngine";
import { calculateCashflow } from "./cashflowEngine";
import { calculateProfit } from "./profitEngine";
import { calculateEquity } from "./equityEngine";
import { calculateRentalYield } from "./rentalYieldEngine";
import { generatePropertyAI } from "./propertyAI";
import { generateTimeline } from "./propertyTimeline";

export function calculatePropertyAnalytics(property) {

    const score =
        calculatePropertyScore(property);

    const status =
        calculatePropertyStatus(property);

    const health =
        calculateHealth(property);

    const investment =
        calculateInvestment(property);

    const commitments =
        calculateMonthlyCommitments(property);

    const cashflow =
        calculateCashflow(property);

    const profit =
        calculateProfit(property);

    const equity =
        calculateEquity(property);

    const rentalYield =
        calculateRentalYield(property);

    const ai =
        generatePropertyAI(property);

    const timeline =
        generateTimeline(property);

    return {

        score,

        status,

        health,

        investment,

        commitments,

        cashflow,

        profit,

        equity,

        rentalYield,

        ai,

        timeline,

    };

}