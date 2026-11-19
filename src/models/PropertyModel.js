import { getMonthlyCashflow } from "../utils/propertyFinancials";

function firstValue(...values) {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return 0;
}

export default class PropertyModel {
  constructor(data = {}) {
    this.id = data.id ?? "";

    // Shared Aequitas cashflow definition (includes recurring expenses).
    this._monthlyCashflow = getMonthlyCashflow(data).cashflow;

    // Property Name
    this.name =
      firstValue(
        data.name,
        data.projectName,
        data.propertyName
      ) || "";

    // Purchase Price
    this.purchasePrice = Number(
      firstValue(
        data.purchasePrice,
        data.buyPrice,
        data.purchase
      )
    );

    // Current Market Value
    // If no market value has been entered,
    // use purchase price as the current portfolio value.
    this.currentValue = Number(
      firstValue(
        data.currentValue,
        data.marketValue,
        data.propertyValue,
        data.valuation,
        data.estimatedValue,
        data.purchasePrice
      )
    );

    // Outstanding Loan
    this.loanBalance = Number(
      firstValue(
        data.loanBalance,
        data.outstandingLoan,
        data.loanOutstanding,
        data.balance
      )
    );

    // Renovation
    this.renovationCost = Number(
      firstValue(
        data.renovationCost,
        data.renovation
      )
    );

    // Rental Income
    this.monthlyRent = Number(
      firstValue(
        data.monthlyRent,
        data.monthlyRental,
        data.rental,
        data.rent
      )
    );

    // Monthly Instalment
    this.monthlyRepayment = Number(
      firstValue(
        data.monthlyRepayment,
        data.monthlyInstalment,
        data.monthlyInstallment,
        data.loanRepayment,
        data.installment
      )
    );
  }

  get equity() {
    return (
      this.currentValue -
      this.loanBalance
    );
  }

  get loanToValue() {
    if (this.currentValue <= 0) {
      return 0;
    }

    return (
      (this.loanBalance /
        this.currentValue) *
      100
    );
  }

  get monthlyCashflow() {
    return this._monthlyCashflow;
  }

  get appreciation() {
    return (
      this.currentValue -
      this.purchasePrice
    );
  }
}