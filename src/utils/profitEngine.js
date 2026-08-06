export function calculateProfit(property) {

    const rental =
        Number(property.monthlyRental || 0);

    const instalment =
        Number(property.monthlyInstalment || 0);

    const maintenance =
        Number(property.maintenanceFee || 0);

    const insurance =
        Number(property.insurance || 0);

    const quitRent =
        Number(property.quitRent || 0);

    const assessment =
        Number(property.assessmentTax || 0);

    const management =
        Number(property.managementFee || 0);

    const other =
        Number(property.otherExpenses || 0);

    const expenses =
        instalment +
        maintenance +
        insurance +
        quitRent +
        assessment +
        management +
        other;

    const monthlyProfit =
        rental - expenses;

    const yearlyProfit =
        monthlyProfit * 12;

    return {

        monthlyProfit,

        yearlyProfit,

        expenses,

        profitable:
            monthlyProfit >= 0,

    };

}