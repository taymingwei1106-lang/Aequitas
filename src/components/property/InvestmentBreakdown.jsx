import { useMemo } from "react";
import { Link } from "react-router-dom";

import { calculateAcquisition } from "../../utils/acquisitionEngine";
import { formatRM } from "../../utils/propertyFinancials";

/*
 * Investment Breakdown
 *
 *   1. What the property cost
 *   2. How it was paid for (loan, own cash, cashback)
 *   3. What that cash earns (cash-on-cash return)
 *
 * Fields left blank are shown as "Not entered", never as RM 0, and totals
 * that depend on them are marked incomplete.
 */

const CORE_COST_FIELDS = ["legalFees", "stampDuty", "renovationCost", "furnishingCost"];

function Row({ label, value, sign, strong, tone, muted, note }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        alignItems: "baseline",
        paddingTop: strong ? 10 : 0,
        borderTop: strong ? "1px solid var(--color-border-strong)" : "none",
      }}
    >
      <span style={{ color: muted ? "var(--color-text-secondary)" : "inherit" }}>
        {sign && (
          <span style={{ display: "inline-block", width: 16, color: "var(--color-text-secondary)" }}>
            {sign}
          </span>
        )}
        {label}
        {note && (
          <span className="page-subtitle" style={{ fontSize: 12 }}>
            {" "}
            {note}
          </span>
        )}
      </span>
      <strong
        style={{
          textAlign: "right",
          fontWeight: strong ? 700 : 600,
          color: muted ? "var(--color-text-secondary)" : tone || "inherit",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

function amountOrMissing(value) {
  return value === null ? "Not entered" : formatRM(value, 2);
}

function Section({ title, children }) {
  return (
    <section style={{ display: "grid", gap: 10 }}>
      <div className="card-label">{title}</div>
      {children}
    </section>
  );
}

export default function InvestmentBreakdown({ property }) {
  const a = useMemo(() => calculateAcquisition(property), [property]);
  const v = a.values;

  const costsIncomplete = CORE_COST_FIELDS.some((key) => v[key] === null);
  const incompleteNote = costsIncomplete ? "(incomplete)" : null;

  const optionalLine = (key, label, sign = "+") =>
    v[key] === null ? (
      <Row sign={sign} label={label} value="Not entered" muted />
    ) : v[key] > 0 ? (
      <Row sign={sign} label={label} value={formatRM(v[key], 2)} />
    ) : null;

  const coreMissing = a.missing.filter((m) =>
    [...CORE_COST_FIELDS, "purchasePrice", "originalLoanAmount"].includes(m.key)
  );

  return (
    <div className="card" style={{ display: "grid", gap: 22 }}>
      <div>
        <h3 style={{ margin: 0 }}>🏗️ Investment Breakdown</h3>
        <p className="page-subtitle" style={{ margin: "6px 0 0" }}>
          What the property cost, how it was paid for, and how much of your own
          money is in it.
        </p>
      </div>

      {!a.hasPrice ? (
        <p className="page-subtitle" style={{ margin: 0 }}>
          Add the SPA purchase price to see the breakdown.
        </p>
      ) : (
        <>
          <Section title="WHAT THE PROPERTY COST">
            <Row label="SPA purchase price" value={formatRM(v.purchasePrice, 2)} />
            {v.purchaseDiscount > 0 && (
              <>
                <Row
                  sign="−"
                  label="Purchase discount / rebate"
                  value={formatRM(v.purchaseDiscount, 2)}
                  tone="var(--color-success)"
                />
                <Row
                  strong
                  label="Net purchase price"
                  value={formatRM(a.netPurchasePrice, 2)}
                />
              </>
            )}
            {optionalLine("legalFees", "Legal fees")}
            {optionalLine("stampDuty", "Stamp duty")}
            {v.miscellaneousCost > 0 &&
              optionalLine("miscellaneousCost", "Other acquisition costs")}
            {optionalLine("renovationCost", "Renovation")}
            {optionalLine("furnishingCost", "Furnishing")}
            <Row
              strong
              label="Total cost"
              note={incompleteNote}
              value={formatRM(a.totalCost, 2)}
            />
          </Section>

          <Section title="HOW IT WAS PAID FOR">
            <Row label="Total cost" note={incompleteNote} value={formatRM(a.totalCost, 2)} />
            <Row
              sign="−"
              label="Original loan amount"
              value={amountOrMissing(v.originalLoanAmount)}
              muted={v.originalLoanAmount === null}
            />
            {a.ownCash !== null && (
              <Row strong label="Your own cash put in" value={formatRM(a.ownCash, 2)} />
            )}
            {a.cashback > 0 && (
              <Row
                sign="−"
                label="Cashback received"
                note={a.cashbackSource ? `(${a.cashbackSource})` : null}
                value={formatRM(a.cashback, 2)}
                tone="var(--color-success)"
              />
            )}
            {a.netCashInvested !== null ? (
              <>
                <Row
                  strong
                  label="Net cash invested"
                  note={incompleteNote}
                  value={formatRM(a.netCashInvested, 2)}
                  tone={a.netCashInvested < 0 ? "var(--color-success)" : undefined}
                />
                {a.netCashInvested < 0 && (
                  <p className="page-subtitle" style={{ margin: 0, fontSize: 13 }}>
                    You received about {formatRM(Math.abs(a.netCashInvested))} more
                    back than you put in. The property is fully financed by the
                    loan, so all of its risk sits with the loan.
                  </p>
                )}
              </>
            ) : (
              <p className="page-subtitle" style={{ margin: 0, fontSize: 13 }}>
                Add the original loan amount (the amount approved and drawn,
                not today&apos;s balance) to see how much of your own money is
                in this property.
              </p>
            )}
          </Section>

          <Section title="WHAT THAT CASH EARNS">
            {a.cashOnCash !== null ? (
              <>
                <Row
                  label="Cash-on-cash return"
                  value={`${a.cashOnCash.toFixed(1)}% a year`}
                  tone={a.cashOnCash >= 0 ? "var(--color-success)" : "var(--color-negative)"}
                />
                <p className="page-subtitle" style={{ margin: 0, fontSize: 12 }}>
                  Annual cashflow of {formatRM(a.annualCashflow)} ÷ net cash
                  invested of {formatRM(a.netCashInvested)}. Excludes any change
                  in the property&apos;s value.
                </p>
              </>
            ) : (
              <p className="page-subtitle" style={{ margin: 0, fontSize: 13 }}>
                {a.cashOnCashNote}
              </p>
            )}
          </Section>
        </>
      )}

      {a.checks.length > 0 && (
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid var(--color-warning-border)",
            background: "rgba(245,158,11,0.08)",
          }}
        >
          <div className="card-label">CHECK THESE FIGURES</div>
          <ul className="page-subtitle" style={{ margin: "8px 0 0", paddingLeft: 20, lineHeight: 1.55 }}>
            {a.checks.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </div>
      )}

      {coreMissing.length > 0 && (
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid var(--color-border-strong)",
            background: "var(--color-surface-sunken)",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 13 }}>
            Not entered yet: {coreMissing.map((m) => m.label.toLowerCase()).join(", ")}
          </div>
          <p className="page-subtitle" style={{ margin: "6px 0 10px", fontSize: 13 }}>
            Take these from your SPA, loan offer and lawyer&apos;s bills. Enter 0
            for anything that doesn&apos;t apply, so Aequitas knows it isn&apos;t
            missing.
          </p>
          <Link to={`/property/${property.id}/edit`}>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: "10px 16px", borderRadius: 12, fontWeight: 600, cursor: "pointer" }}
            >
              Add details
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
