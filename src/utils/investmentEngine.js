export function calculateInvestment(property) {

    const purchasePrice =
        Number(property.purchasePrice || 0);

    const renovation =
        Number(property.renovationCost || 0);

    const legalFees =
        Number(property.legalFees || 0);

    const stampDuty =
        Number(property.stampDuty || 0);

    const furnishing =
        Number(property.furnishingCost || 0);

    const miscellaneous =
        Number(property.miscellaneousCost || 0);

    const totalInvestment =
        purchasePrice +
        renovation +
        legalFees +
        stampDuty +
        furnishing +
        miscellaneous;

    return {

        purchasePrice,

        renovation,

        legalFees,

        stampDuty,

        furnishing,

        miscellaneous,

        totalInvestment,

    };

}