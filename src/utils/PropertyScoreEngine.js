export function calculatePropertyScore(property) {

    let score = 50;

    const purchase =
        Number(property.purchasePrice || 0);

    const loan =
        Number(property.outstandingLoan || 0);

    const rental =
        Number(property.monthlyRental || 0);

    const market =
        Number(property.marketValue || purchase);

    if (purchase > 0) {

        const debtRatio = loan / purchase;

        if (debtRatio < 0.50)

            score += 15;

        else if (debtRatio < 0.70)

            score += 8;

        else

            score -= 8;

    }

    if (purchase > 0 && rental > 0) {

        const yieldRate =
            (rental * 12 / purchase) * 100;

        if (yieldRate >= 6)

            score += 15;

        else if (yieldRate >= 4)

            score += 8;

    }

    if (market > purchase)

        score += 10;

    if (property.marketValue)

        score += 5;

    if (property.interestRate)

        score += 5;

    if (property.maintenanceFee)

        score += 5;

    score = Math.max(
        0,
        Math.min(100, score)
    );

    let grade = "C";

    if (score >= 90)

        grade = "A+";

    else if (score >= 80)

        grade = "A";

    else if (score >= 70)

        grade = "B";

    else if (score >= 60)

        grade = "C+";

    else if (score >= 50)

        grade = "C";

    else

        grade = "D";

    return {

        score,

        grade,

    };

}