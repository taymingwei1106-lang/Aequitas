import { Link } from "react-router-dom";

import CalculatorSection from "../components/calculator/CalculatorSection";
import LoanPayoffCard from "../components/calculator/LoanPayoffCard";
import EquityBreakevenCard from "../components/calculator/EquityBreakevenCard";

export default function PropertyCalculator() {

  return (

    <div className="page-container">

      <Link
        to="/home"
        className="page-subtitle"
      >
        ← Back to Home
      </Link>

      <section className="page-header">

        <p className="page-subtitle">

          Professional Investor Tools

        </p>

        <h1 className="page-title">

          🧮 Property Financial Toolkit

        </h1>

        <p className="page-subtitle">

          Calculate, analyse and plan your property investments with professional financial tools.

        </p>

      </section>

      <div
        className="card"
        style={{
          marginBottom: 24,
        }}
      >

        <h3
          style={{
            marginTop: 0,
          }}
        >

          Available Tools

        </h3>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
          }}
        >

          <span>🏦 Loan Payoff</span>

          <span>💰 Equity & Breakeven</span>

          <span style={{ opacity: 0.5 }}>
            📈 Refinance (Coming Soon)
          </span>

          <span style={{ opacity: 0.5 }}>
            🏠 Rental Yield
          </span>

          <span style={{ opacity: 0.5 }}>
            💸 Cashflow
          </span>

          <span style={{ opacity: 0.5 }}>
            📊 Capital Growth
          </span>

          <span style={{ opacity: 0.5 }}>
            🎯 Sell vs Hold
          </span>

        </div>

      </div>

      <CalculatorSection
        title="Loan Payoff Calculator"
        emoji="🏦"
        defaultOpen
      >

        <LoanPayoffCard />

      </CalculatorSection>

      <CalculatorSection
        title="Equity & Breakeven Calculator"
        emoji="💰"
      >

        <EquityBreakevenCard />

      </CalculatorSection>

    </div>

  );

}