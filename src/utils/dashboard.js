export function calculateDashboard(properties) {

  return properties.reduce(

    (summary, property) => {

      summary.totalValue += Number(property.purchasePrice || 0);

      summary.totalLoan += Number(property.outstandingLoan || 0);

      summary.totalRental += Number(property.monthlyRental || 0);

      summary.totalProperties += 1;

      return summary;

    },

    {
      totalValue: 0,
      totalLoan: 0,
      totalRental: 0,
      totalProperties: 0,
    }

  );

}