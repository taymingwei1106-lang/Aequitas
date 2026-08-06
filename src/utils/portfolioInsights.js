export function generatePortfolioInsights(properties = []) {
  if (!properties.length) {
    return {
      health: 15,
      completeness: 0,
      insights: [
        "Your portfolio is empty. Add your first investment to begin."
      ],
      recommendations: [
        "Add your first investment property."
      ]
    };
  }

  const totalPurchase = properties.reduce(
    (sum, p) => sum + Number(p.purchasePrice || 0),
    0
  );

  const totalLoan = properties.reduce(
    (sum, p) => sum + Number(p.outstandingLoan || 0),
    0
  );

  const totalRental = properties.reduce(
    (sum, p) => sum + Number(p.monthlyRental || 0),
    0
  );

  const completedFields = properties.reduce((sum, p) => {
    let score = 0;
    if (p.projectName) score++;
    if (p.purchasePrice) score++;
    if (p.outstandingLoan) score++;
    if (p.monthlyRental) score++;
    return sum + score;
  }, 0);

  const completeness = Math.round(
    (completedFields / (properties.length * 4)) * 100
  );

  let health = 50;
  health += Math.min(20, properties.length * 5);
  health += Math.round(completeness * 0.2);

  if (totalPurchase > 0) {
    const debtRatio = totalLoan / totalPurchase;
    if (debtRatio < 0.5) health += 10;
    else if (debtRatio > 0.9) health -= 10;
  }

  health = Math.max(0, Math.min(100, health));

  const highestPurchase = [...properties].sort(
    (a, b) => Number(b.purchasePrice || 0) - Number(a.purchasePrice || 0)
  )[0];

  const highestRental = [...properties].sort(
    (a, b) => Number(b.monthlyRental || 0) - Number(a.monthlyRental || 0)
  )[0];

  const insights = [
    `Portfolio contains ${properties.length} investment${properties.length > 1 ? "s" : ""}.`,
    `Highest investment: ${highestPurchase.projectName}.`,
    `Highest rental income: ${highestRental.projectName}.`,
    `Outstanding loan totals RM ${totalLoan.toLocaleString()}.`
  ];

  const recommendations = [];

  if (completeness < 100)
    recommendations.push("Complete every investment profile to unlock advanced analytics.");

  recommendations.push("Add market value to calculate capital gains and ROI.");
  recommendations.push("Add interest rate for refinancing recommendations.");
  recommendations.push("Track maintenance fees to unlock true cashflow.");

  return {
    health,
    completeness,
    totalPurchase,
    totalLoan,
    totalRental,
    insights,
    recommendations
  };
}