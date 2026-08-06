export function calculateHealth(property) {

    const checks = [

        "purchasePrice",

        "outstandingLoan",

        "monthlyRental",

        "marketValue",

        "interestRate",

        "maintenanceFee",

        "renovationCost",

        "legalFees",

        "stampDuty",

        "furnishingCost",

        "insurance",

        "quitRent",

        "assessmentTax",

        "purchaseDate"

    ];

    let completed = 0;

    checks.forEach(field => {

        if (
            property[field] !== undefined &&
            property[field] !== null &&
            property[field] !== ""
        ) {

            completed++;

        }

    });

    const score = Math.round(

        (completed / checks.length) * 100

    );

    let level = "Poor";

    if (score >= 90)

        level = "Excellent";

    else if (score >= 75)

        level = "Good";

    else if (score >= 50)

        level = "Average";

    return {

        score,

        level,

        completed,

        total: checks.length,

    };

}