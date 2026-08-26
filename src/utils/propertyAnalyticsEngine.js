import {
  calculatePropertyScore,
} from "./PropertyScoreEngine";

import {
  calculatePropertyStatus,
} from "./propertyStatusEngine";

import {
  calculateHealth,
} from "./healthEngine";

import {
  calculateInvestmentHealth,
} from "./InvestmentHealthEngine";

import {
  calculateInvestment,
} from "./investmentEngine";

import {
  calculateMonthlyCommitments,
} from "./monthlyCommitmentEngine";

import {
  calculateCashflow,
} from "./cashflowEngine";

import {
  calculateProfit,
} from "./profitEngine";

import {
  calculateEquity,
} from "./equityEngine";

import {
  calculateRentalYield,
} from "./rentalYieldEngine";

import {
  generatePropertyAI,
} from "./propertyAI";

import {
  generateTimeline,
} from "./propertyTimeline";

import {
  calculateRisk,
} from "./riskEngine";

import {
  calculateForecast,
} from "./forecastEngine";

import {
  calculateContribution,
} from "./contributionEngine";

import {
  getProperties,
} from "../services/storage";


export function calculatePropertyAnalytics(
  property
) {

  const score =
    calculatePropertyScore(
      property
    );

  const status =
    calculatePropertyStatus(
      property
    );

  /*
   * This is now DATA COMPLETENESS.
   *
   * The existing healthEngine checks how many
   * important property fields have been filled.
   */
  const dataCompleteness =
    calculateHealth(
      property
    );

  const investment =
    calculateInvestment(
      property
    );

  const commitments =
    calculateMonthlyCommitments(
      property
    );

  const cashflow =
    calculateCashflow(
      property
    );

  const profit =
    calculateProfit(
      property
    );

  const equity =
    calculateEquity(
      property
    );

  const rentalYield =
    calculateRentalYield(
      property
    );

  /*
   * REAL INVESTMENT HEALTH
   *
   * This measures the financial condition
   * of the investment rather than how complete
   * the data is.
   */
  const investmentHealth =
    calculateInvestmentHealth({
      cashflow:
        profit.monthlyProfit,

      loan:
        equity.loan,

      marketValue:
        equity.market,

      rentalYield:
        rentalYield.grossYield,

      equity:
        equity.equity,

      purchasePrice:
        investment.purchasePrice,
    });

  const ai =
    generatePropertyAI(
      property
    );

  const timeline =
    generateTimeline(
      property
    );

  const risk =
    calculateRisk({
      loan:
        equity.loan,

      marketValue:
        equity.market,

      monthlyProfit:
        profit.monthlyProfit,

      rentalYield:
        rentalYield.grossYield,

      equity:
        equity.equity,
    });

  const forecast =
    calculateForecast({
      marketValue:
        equity.market,

      outstandingLoan:
        equity.loan,

      monthlyRental:
        cashflow.rental,

      years: 5,
    });

  const portfolio =
    getProperties();

  const contribution =
    calculateContribution(
      property,
      portfolio
    );

  return {

    score,

    status,

    /*
     * New names
     */
    dataCompleteness,

    investmentHealth,

    /*
     * Temporary compatibility alias.
     *
     * Existing components can continue reading
     * analytics.health until we update them.
     */
    health:
      investmentHealth,

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