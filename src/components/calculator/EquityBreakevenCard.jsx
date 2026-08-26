import { useState } from "react";

import formatCurrency from "../../utils/formatCurrency";
import CalculatorActions from "./CalculatorActions";
import PropertySelector from "../financial/PropertySelector";

const DEFAULT_FORM = {
  purchasePrice: "",
  currentValue: "",
  outstandingLoan: "",
  renovationCost: "",
  legalFees: "",
  stampDuty: "",
  agentCommission: "3",
};

export default function EquityBreakevenCard() {
  const [draft, setDraft] = useState(DEFAULT_FORM);

  const [result, setResult] = useState(null);

  const [selectedProperty, setSelectedProperty] = useState("");

  const properties = JSON.parse(
    localStorage.getItem("properties") || "[]"
  );

  function update(field, value) {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function loadProperty(id) {
    setSelectedProperty(id);

    const property = properties.find(
      (p) => String(p.id) === String(id)
    );

    if (!property) return;

    setDraft({
      purchasePrice:
        property.purchasePrice?.toString() ?? "",

      currentValue:
        property.currentValue?.toString() ??
        property.purchasePrice?.toString() ??
        "",

      outstandingLoan:
        property.loanBalance?.toString() ?? "",

      renovationCost:
        property.renovationCost?.toString() ?? "",

      legalFees: "",

      stampDuty: "",

      agentCommission: "3",
    });
  }

  function calculate() {
    const purchasePrice =
      Number(draft.purchasePrice.replace(/,/g, "")) || 0;

    const currentValue =
      Number(draft.currentValue.replace(/,/g, "")) || 0;

    const outstandingLoan =
      Number(draft.outstandingLoan.replace(/,/g, "")) || 0;

    const renovationCost =
      Number(draft.renovationCost.replace(/,/g, "")) || 0;

    const legalFees =
      Number(draft.legalFees.replace(/,/g, "")) || 0;

    const stampDuty =
      Number(draft.stampDuty.replace(/,/g, "")) || 0;

    const commissionRate =
      Number(draft.agentCommission) || 0;

    const commission =
      currentValue * (commissionRate / 100);

    const sellingCosts =
      commission + legalFees;

    const totalInvestment =
      purchasePrice +
      renovationCost +
      stampDuty +
      legalFees;

    const currentEquity =
      currentValue - outstandingLoan;

    const netSaleProceeds =
      currentValue -
      outstandingLoan -
      sellingCosts;

    const profit =
      netSaleProceeds -
      (
        purchasePrice +
        renovationCost +
        stampDuty
      );

    const breakEvenPrice =
      (
        purchasePrice +
        renovationCost +
        stampDuty +
        legalFees +
        outstandingLoan
      ) /
      (1 - commissionRate / 100);

    setResult({
      commission,
      sellingCosts,
      totalInvestment,
      currentEquity,
      netSaleProceeds,
      profit,
      breakEvenPrice,
    });
  }

  function reset() {
    setDraft(DEFAULT_FORM);
    setResult(null);
    setSelectedProperty("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      calculate();
    }
  }

  return (
    <div>

      <PropertySelector
        properties={properties}
        value={selectedProperty}
        onChange={loadProperty}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(260px,1fr))",
          gap: 20,
        }}
      >
                <div>
          <label className="page-subtitle">
            Purchase Price (RM)
          </label>

          <input
            type="text"
            inputMode="decimal"
            value={draft.purchasePrice}
            onChange={(e) =>
              update("purchasePrice", e.target.value)
            }
            onKeyDown={handleKeyDown}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label className="page-subtitle">
            Current Market Value (RM)
          </label>

          <input
            type="text"
            inputMode="decimal"
            value={draft.currentValue}
            onChange={(e) =>
              update("currentValue", e.target.value)
            }
            onKeyDown={handleKeyDown}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label className="page-subtitle">
            Outstanding Loan (RM)
          </label>

          <input
            type="text"
            inputMode="decimal"
            value={draft.outstandingLoan}
            onChange={(e) =>
              update("outstandingLoan", e.target.value)
            }
            onKeyDown={handleKeyDown}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label className="page-subtitle">
            Renovation Cost (RM)
          </label>

          <input
            type="text"
            inputMode="decimal"
            value={draft.renovationCost}
            onChange={(e) =>
              update("renovationCost", e.target.value)
            }
            onKeyDown={handleKeyDown}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label className="page-subtitle">
            Legal Fees (RM)
          </label>

          <input
            type="text"
            inputMode="decimal"
            value={draft.legalFees}
            onChange={(e) =>
              update("legalFees", e.target.value)
            }
            onKeyDown={handleKeyDown}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label className="page-subtitle">
            Stamp Duty (RM)
          </label>

          <input
            type="text"
            inputMode="decimal"
            value={draft.stampDuty}
            onChange={(e) =>
              update("stampDuty", e.target.value)
            }
            onKeyDown={handleKeyDown}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label className="page-subtitle">
            Agent Commission (%)
          </label>

          <input
            type="number"
            step="0.1"
            min="0"
            value={draft.agentCommission}
            onChange={(e) =>
              update("agentCommission", e.target.value)
            }
            onKeyDown={handleKeyDown}
            style={{ width: "100%" }}
          />
        </div>

      </div>

      <div
        style={{
          marginTop: 24,
        }}
      >
        <CalculatorActions
          onCalculate={calculate}
          onReset={reset}
        />
      </div>

      {result && (
        <>
    <div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: 18,
    marginTop: 30,
  }}
>

                      <div className="dashboard-card">
              <div className="page-subtitle">
                Current Equity
              </div>

              <h2>
                {formatCurrency(result.currentEquity)}
              </h2>
            </div>

            <div className="dashboard-card">
              <div className="page-subtitle">
                Net Sale Proceeds
              </div>

              <h2>
                {formatCurrency(result.netSaleProceeds)}
              </h2>
            </div>

            <div className="dashboard-card">
              <div className="page-subtitle">
                Break-even Price
              </div>

              <h2>
                {formatCurrency(result.breakEvenPrice)}
              </h2>
            </div>

            <div className="dashboard-card">
              <div className="page-subtitle">
                Profit / Loss
              </div>

              <h2
                style={{
                  color:
                    result.profit >= 0
                      ? "#16a34a"
                      : "#dc2626",
                }}
              >
                {formatCurrency(result.profit)}
              </h2>
            </div>

            <div className="dashboard-card">
              <div className="page-subtitle">
                Selling Costs
              </div>

              <h2>
                {formatCurrency(result.sellingCosts)}
              </h2>
            </div>

            <div className="dashboard-card">
              <div className="page-subtitle">
                Total Investment
              </div>

              <h2>
                {formatCurrency(result.totalInvestment)}
              </h2>
            </div>

          </div>

          <div
            className="dashboard-card"
            style={{
              marginTop: 30,
            }}
          >
            <h3>
              🤖 AI Insight
            </h3>

            {result.profit > 100000 && (
              <p>
                🟢 Excellent exit opportunity.
                Selling this property today
                generates a strong estimated
                profit after transaction costs.
                Consider recycling the released
                equity into your next
                acquisition.
              </p>
            )}

            {result.profit > 0 &&
              result.profit <= 100000 && (
                <p>
                  🟡 The property is profitable,
                  but selling costs reduce the
                  overall gain. Waiting for
                  additional capital
                  appreciation may improve
                  long-term returns.
                </p>
              )}

            {result.profit <= 0 && (
              <p>
                🔴 Selling today is likely to
                realise a loss. Unless cash flow
                or liquidity is required,
                holding the property may be the
                better financial decision until
                market value improves.
              </p>
            )}
          </div>
                  </>
      )}

    </div>
  );
}