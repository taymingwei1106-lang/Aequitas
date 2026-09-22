import { useMemo, useState } from "react";

function money(value) {
  const number = Number(value || 0);
  return `RM ${number.toLocaleString("en-MY", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function numberInput(value, setValue, placeholder = "0") {
  return (
    <input
      type="number"
      min="0"
      value={value}
      placeholder={placeholder}
      onChange={(event) => setValue(event.target.value)}
    />
  );
}

function ToolCard({ title, description, children }) {
  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>{title}</h2>
          <p className="muted">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function ToolGroup({ eyebrow, title, description, children }) {
  return (
    <section>
      <div
        className="section-header"
        style={{
          display: "grid",
          gap: "6px",
          marginBottom: "16px",
        }}
      >
        <p className="eyebrow" style={{ margin: 0 }}>
          {eyebrow}
        </p>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <p className="muted" style={{ margin: 0, maxWidth: "720px" }}>
          {description}
        </p>
      </div>
      <div className="stack">{children}</div>
    </section>
  );
}

export default function InvestorTools() {
  const [purchasePrice, setPurchasePrice] = useState("");
  const [rental, setRental] = useState("");
  const [expenses, setExpenses] = useState("");
  const [loan, setLoan] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [propertyValue, setPropertyValue] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");

  const cashflow = useMemo(
    () => Number(rental || 0) - Number(expenses || 0) - Number(monthlyPayment || 0),
    [rental, expenses, monthlyPayment]
  );

  const grossYield = useMemo(() => {
    const price = Number(purchasePrice || 0);
    if (!price) return 0;
    return (Number(rental || 0) * 12 / price) * 100;
  }, [purchasePrice, rental]);

  const netYield = useMemo(() => {
    const price = Number(purchasePrice || 0);
    if (!price) return 0;
    return ((Number(rental || 0) - Number(expenses || 0)) * 12 / price) * 100;
  }, [purchasePrice, rental, expenses]);

  const ltv = useMemo(() => {
    const value = Number(propertyValue || 0);
    if (!value) return 0;
    return (Number(loan || 0) / value) * 100;
  }, [loan, propertyValue]);

  const loanPayment = useMemo(() => {
    const principal = Number(loan || 0);
    const annualRate = Number(rate || 0);
    const termYears = Number(years || 0);
    if (!principal || !termYears) return 0;
    const months = termYears * 12;
    const monthlyRate = annualRate / 100 / 12;
    if (!monthlyRate) return principal / months;
    return principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  }, [loan, rate, years]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Aequitas Investor Tools</p>
          <h1>Quick Calculators</h1>
          <p className="muted">
            Use these for quick checks without opening a property. When you want to test a decision using your actual Aequitas data, move to Decision Lab.
          </p>
        </div>
      </div>

      <div className="stack">
        <section className="card muted-card">
          <p className="eyebrow">Simple first</p>
          <h2>Calculate without setting up a property</h2>
          <p className="muted">
            These tools are for quick estimates. They do not change your portfolio or property records.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "10px",
              marginTop: "16px",
            }}
          >
            <div className="result-box">
              <span>Quick check</span>
              <strong>Cashflow</strong>
            </div>
            <div className="result-box">
              <span>Quick check</span>
              <strong>Yield</strong>
            </div>
            <div className="result-box">
              <span>Quick check</span>
              <strong>Loan</strong>
            </div>
            <div className="result-box">
              <span>Quick check</span>
              <strong>LTV</strong>
            </div>
          </div>
        </section>

        <ToolGroup
          eyebrow="Property Analysis"
          title="Income & Return"
          description="Check how a property's income compares with its costs and purchase price."
        >
          <ToolCard
            title="Property Cashflow"
            description="Estimate the monthly amount left after rental income, expenses and loan payment."
          >
            <div className="form-grid">
              <label>Monthly rental {numberInput(rental, setRental)}</label>
              <label>Monthly expenses {numberInput(expenses, setExpenses)}</label>
              <label>Monthly loan payment {numberInput(monthlyPayment, setMonthlyPayment)}</label>
            </div>
            <div className="result-box">
              <span>Estimated monthly cashflow</span>
              <strong>{money(cashflow)}</strong>
            </div>
          </ToolCard>

          <ToolCard
            title="Rental Yield"
            description="Compare annual rental income with the property's purchase price."
          >
            <div className="form-grid">
              <label>Purchase price {numberInput(purchasePrice, setPurchasePrice)}</label>
              <label>Monthly rental {numberInput(rental, setRental)}</label>
              <label>Monthly expenses {numberInput(expenses, setExpenses)}</label>
            </div>
            <div className="metric-grid">
              <div className="result-box"><span>Gross yield</span><strong>{grossYield.toFixed(2)}%</strong></div>
              <div className="result-box"><span>Net yield</span><strong>{netYield.toFixed(2)}%</strong></div>
            </div>
          </ToolCard>
        </ToolGroup>

        <ToolGroup
          eyebrow="Financing"
          title="Loan Checks"
          description="Estimate loan payments and understand the loan relative to property value."
        >
          <ToolCard
            title="Loan Payment"
            description="Estimate a monthly loan payment from the amount, interest rate and loan term."
          >
            <div className="form-grid">
              <label>Loan amount {numberInput(loan, setLoan)}</label>
              <label>Annual interest rate (%) {numberInput(rate, setRate, "e.g. 4")}</label>
              <label>Loan term (years) {numberInput(years, setYears, "e.g. 30")}</label>
            </div>
            <div className="result-box">
              <span>Estimated monthly payment</span>
              <strong>{money(loanPayment)}</strong>
            </div>
          </ToolCard>

          <ToolCard
            title="Loan-to-Value (LTV)"
            description="See the loan balance as a percentage of the current property value."
          >
            <div className="form-grid">
              <label>Outstanding loan {numberInput(loan, setLoan)}</label>
              <label>Property value {numberInput(propertyValue, setPropertyValue)}</label>
            </div>
            <div className="result-box">
              <span>Loan-to-value</span>
              <strong>{ltv.toFixed(2)}%</strong>
            </div>
          </ToolCard>
        </ToolGroup>

        <section className="card">
          <p className="eyebrow">From quick check to decision</p>
          <h2>Need to explore what happens next?</h2>
          <p className="muted">
            Decision Lab is for property-specific scenarios. It can use your Aequitas data to explore financing changes, what-if assumptions, loan projections and exit scenarios.
          </p>
          <a className="primary-button" href="/decision-lab">Open Decision Lab</a>
        </section>
      </div>
    </div>
  );
}
