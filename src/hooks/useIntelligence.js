import { useMemo } from "react";

import { usePortfolio } from "../context/PortfolioContext";

import { generateOpportunities } from "../services/opportunityEngine";

import {
  generateExecutiveSummary,
  generatePortfolioScore,
  generateFinancialHealth,
  generateRiskAnalysis,
} from "../services/intelligenceEngine";

import { generateDecisionReport } from "../services/decisionEngine";

export default function useIntelligence() {
  const { portfolio } = usePortfolio();

  const safePortfolio = portfolio ?? {
    properties: [],
  };

  return useMemo(() => {
    const executive =
      generateExecutiveSummary(safePortfolio);

    const score =
      generatePortfolioScore(safePortfolio);

    const health =
      generateFinancialHealth(safePortfolio);

    const risk =
      generateRiskAnalysis(safePortfolio);

    const decisions =
      generateDecisionReport({
        ...executive,
        ...score,
        ...health,
        ...risk,
      });

    const opportunities =
      generateOpportunities(safePortfolio);

    return {
      portfolio: safePortfolio,
      executive,
      score,
      health,
      risk,
      decisions,
      opportunities,
    };
  }, [safePortfolio]);
}