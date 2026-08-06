export function calculateMonthlyCommitments(property) {

    const instalment =
        Number(property.monthlyInstalment || 0);

    const maintenance =
        Number(property.maintenanceFee || 0);

    const insurance =
        Number(property.insurance || 0);

    const quitRent =
        Number(property.quitRent || 0);

    const assessmentTax =
        Number(property.assessmentTax || 0);

    const managementFee =
        Number(property.managementFee || 0);

    const otherExpenses =
        Number(property.otherExpenses || 0);

    const totalExpenses =
        maintenance +
        insurance +
        quitRent +
        assessmentTax +
        managementFee +
        otherExpenses;

    const totalCommitments =
        instalment +
        totalExpenses;

    return {

        instalment,

        maintenance,

        insurance,

        quitRent,

        assessmentTax,

        managementFee,

        otherExpenses,

        totalExpenses,

        totalCommitments,

    };

}