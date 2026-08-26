export function generateDecisionReport(intelligence) {
  if (!intelligence) return [];

  const decisions = [];

  if (intelligence.ltv > 80) {
    decisions.push({
      priority: "high",
      title: "Reduce Portfolio Leverage",
      description:
        "Loan-to-value exceeds 80%. Prioritise debt reduction or additional equity contributions to improve resilience.",
    });
  }

  if (intelligence.totalEquity > 1000000) {
    decisions.push({
      priority: "medium",
      title: "Consider Portfolio Expansion",
      description:
        "Strong equity position may support acquiring another investment property while maintaining healthy leverage.",
    });
  }

  if (intelligence.propertyCount < 3) {
    decisions.push({
      priority: "low",
      title: "Increase Diversification",
      description:
        "Expanding the number of properties can improve portfolio diversification and reduce concentration risk.",
    });
  }

  return decisions;
}