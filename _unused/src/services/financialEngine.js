import { calculateEquity } from "../utils/financialCalculations";
import { getEquityInsight } from "../utils/aiInsights";

export function analyzeEquity(data) {
  const calculation = calculateEquity(data);

  return {
    calculation,
    insight: getEquityInsight(calculation),
  };
}