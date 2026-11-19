export function calculatePropertyStatus(property) {

    const purchasePrice = Number(property.purchasePrice || 0);

    const outstandingLoan = Number(property.outstandingLoan || 0);

    const monthlyRental = Number(property.monthlyRental || 0);

    const marketValue = Number(property.marketValue || purchasePrice);

    const debtRatio = purchasePrice
        ? outstandingLoan / purchasePrice
        : 1;

    const rentalYield = purchasePrice
        ? ((monthlyRental * 12) / purchasePrice) * 100
        : 0;

    const appreciation = marketValue - purchasePrice;

    let status = "Needs Attention";
    let colour = "var(--color-danger)";

    if (
        debtRatio < 0.70 &&
        rentalYield >= 4
    ) {

        status = "Healthy";

        colour = "var(--color-success)";

    }

    if (
        debtRatio < 0.50 &&
        rentalYield >= 5 &&
        appreciation > 0
    ) {

        status = "Excellent";

        colour = "var(--color-primary)";

    }

    return {

        debtRatio,

        rentalYield,

        appreciation,

        status,

        colour,

    };

}