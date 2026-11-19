import PropertyRepository from "../repositories/PropertyRepository";
import {
  generateExecutiveSummary,
  generatePortfolioScore,
  generateFinancialHealth,
  generateRiskAnalysis,
} from "./intelligenceEngine";

export function generateDashboard() {
  const portfolio = PropertyRepository.getAll();

  return {
    executive: generateExecutiveSummary(portfolio),
    score: generatePortfolioScore(portfolio),
    health: generateFinancialHealth(portfolio),
    risk: generateRiskAnalysis(portfolio),
  };
}