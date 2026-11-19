import ProgressCard from "./ProgressCard";

export default function InvestmentHealth({

  purchasePrice = 0,

  outstandingLoan = 0,

  completion = 100,

}) {

  const debtRatio =
    purchasePrice > 0
      ? Math.round(
          (outstandingLoan / purchasePrice) * 100
        )
      : 0;

  const health =
    Math.max(
      0,
      Math.min(
        100,
        completion - Math.floor(debtRatio * 0.25)
      )
    );

  return (

    <ProgressCard
      title="Investment Health"
      value={health}
      subtitle={`Debt Ratio ${debtRatio}%`}
    />

  );

}