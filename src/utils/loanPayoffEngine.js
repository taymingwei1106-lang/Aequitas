export function calculateLoanPayoff({
  loanAmount = 0,
  annualInterestRate = 0,
  remainingYears = 0,
  extraPayment = 0,
}) {

  const monthlyRate =
    annualInterestRate / 100 / 12;

  const totalMonths =
    remainingYears * 12;

  if (
    loanAmount <= 0 ||
    monthlyRate <= 0 ||
    totalMonths <= 0
  ) {

    return null;

  }

  const monthlyPayment =
    loanAmount *
    monthlyRate *
    Math.pow(
      1 + monthlyRate,
      totalMonths
    ) /
    (
      Math.pow(
        1 + monthlyRate,
        totalMonths
      ) - 1
    );

  const newMonthlyPayment =
    monthlyPayment + extraPayment;

  let balance = loanAmount;

  let months = 0;

  let totalInterest = 0;

  while (
    balance > 1 &&
    months < 1000
  ) {

    const interest =
      balance * monthlyRate;

    const principal =
      newMonthlyPayment - interest;

    if (principal <= 0)
      break;

    balance -= principal;

    totalInterest += interest;

    months++;

  }

  const yearsSaved =
    remainingYears -
    months / 12;

  const originalInterest =
    monthlyPayment *
      totalMonths -
    loanAmount;

  const interestSaved =
    originalInterest -
    totalInterest;

  return {

    monthlyPayment:
      Math.round(monthlyPayment),

    newMonthlyPayment:
      Math.round(newMonthlyPayment),

    months,

    yearsSaved:
      Number(
        yearsSaved.toFixed(1)
      ),

    interestSaved:
      Math.round(interestSaved),

    payoffYears:
      Number(
        (months / 12).toFixed(1)
      ),

  };

}