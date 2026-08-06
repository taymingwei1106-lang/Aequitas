export function calculateEquity(property) {

    const purchase =
        Number(property.purchasePrice || 0);

    const market =
        Number(property.marketValue || purchase);

    const loan =
        Number(property.outstandingLoan || 0);

    const equity =
        market - loan;

    const gain =
        market - purchase;

    return {

        purchase,

        market,

        loan,

        equity,

        gain,

        gainPercentage:

            purchase > 0

                ? (gain / purchase) * 100

                : 0,

    };

}