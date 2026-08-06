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
import { calculateRisk } from "./riskEngine";
import { calculateForecast } from "./forecastEngine";
import { calculateContribution } from "./contributionEngine";
import { getProperties } from "../services/storage";

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
        
        const risk = calculateRisk({

  loan: equity.loan,

  marketValue: equity.market,

  monthlyProfit: profit.monthlyProfit,

  rentalYield: rentalYield.grossYield,

  equity: equity.equity,

});
const forecast = calculateForecast({

  marketValue: equity.market,

  outstandingLoan: equity.loan,

  monthlyRental: cashflow.rental,

  years: 5,

});

const portfolio = getProperties();

const contribution =
  calculateContribution(
    property,
    portfolio
  );

 return {

  score,

  health,

  risk,

  forecast,

  contribution,

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