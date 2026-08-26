import PropertyModel from "./PropertyModel";

export default class PortfolioModel {
  constructor(properties = []) {
    this.properties = properties.map(
      (property) =>
        property instanceof PropertyModel
          ? property
          : new PropertyModel(property)
    );
  }

  get totalValue() {
    return this.properties.reduce(
      (sum, property) =>
        sum + property.currentValue,
      0
    );
  }

  get totalLoan() {
    return this.properties.reduce(
      (sum, property) =>
        sum + property.loanBalance,
      0
    );
  }

  get totalEquity() {
    return this.properties.reduce(
      (sum, property) =>
        sum + property.equity,
      0
    );
  }

  get totalRental() {
    return this.properties.reduce(
      (sum, property) =>
        sum + property.monthlyRent,
      0
    );
  }

  get totalCashflow() {
    return this.properties.reduce(
      (sum, property) =>
        sum + property.monthlyCashflow,
      0
    );
  }

  get averageValue() {
    if (this.properties.length === 0)
      return 0;

    return (
      this.totalValue /
      this.properties.length
    );
  }
}