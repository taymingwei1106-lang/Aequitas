export function calculateRentalYield(property) {

    const purchase =
        Number(property.purchasePrice || 0);

    const rental =
        Number(property.monthlyRental || 0);

    const annualRental =
        rental * 12;

    const grossYield =

        purchase > 0

            ? (annualRental / purchase) * 100

            : 0;

    return {

        annualRental,

        grossYield,

    };

}