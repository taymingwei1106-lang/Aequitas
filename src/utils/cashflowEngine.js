export function calculateCashflow(property) {

    const rental = Number(property.monthlyRental || 0);

    const loan = Number(property.monthlyLoan || 0);

    const maintenance = Number(property.maintenanceFee || 0);

    const management = Number(property.managementFee || 0);

    const insurance = Number(property.insurance || 0);

    const tax = Number(property.quitRent || 0);

    const sinking = Number(property.sinkingFund || 0);

    const expenses =
        loan +
        maintenance +
        management +
        insurance +
        tax +
        sinking;

    const monthlyCashflow =
        rental - expenses;

    return {

        rental,

        expenses,

        monthlyCashflow,

        annualCashflow:
            monthlyCashflow * 12,

        positive:
            monthlyCashflow >= 0,

    };

}