export function getEquityInsight(result) {
  if (!result) return null;

  if (result.profit > 100000) {
    return {
      type: "success",
      title: "Excellent Exit Opportunity",
      message:
        "Selling today is expected to generate a strong profit after transaction costs. Reinvesting the released equity could accelerate portfolio growth.",
    };
  }

  if (result.profit > 0) {
    return {
      type: "warning",
      title: "Moderate Profit",
      message:
        "The property is profitable, but selling costs reduce your overall gain. Holding for further appreciation may improve long-term returns.",
    };
  }

  return {
    type: "danger",
    title: "Selling at a Loss",
    message:
      "Selling today is likely to realise a loss. Unless liquidity is required, consider holding the property until market value improves or the loan balance reduces.",
  };
}