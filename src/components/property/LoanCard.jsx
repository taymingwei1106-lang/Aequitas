import { useMemo } from "react";
import { Link } from "react-router-dom";

import { analyseLoan } from "../../utils/loanEngine";
import { getMonthlyCheckins } from "../../services/monthlyCheckinStorage";
import { formatMonth, formatRM } from "../../utils/propertyFinancials";

/*
 * Loan — how each instalment splits between interest and principal, when
 * the loan should be repaid at the current instalment, and whether the
 * recorded check-in balances fit the interest rate.
 */

const USUAL_MAX_TENURE_MONTHS = 35 * 12;

const REVIEW_LABEL = {
  consistent: { text: "Fits", color: "var(--color-success)" },
  unchanged: { text: "Unchanged (likely carried forward)", color: "var(--color-warning)" },
  higher: { text: "Higher than expected", color: "var(--color-negative)" },
  lower: { text: "Lower than expected", color: "var(--color-warning)" },
};

function duration(months) {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years) parts.push(`${years} year${years === 1 ? "" : "s"}`);
  if (rest) parts.push(`${rest} month${rest === 1 ? "" : "s"}`);
  return parts.join(" ") || "less than a month";
}

export default function LoanCard({ property }) {
  const loan = useMemo(
    () => analyseLoan(property, getMonthlyCheckins(property?.id)),
    [property]
  );

  if (!loan.hasRate) {
    return (
      <div className="card">
        <h3 style={{ marginTop: 0 }}>🏦 Loan</h3>
        <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Outstanding loan</span>
            <strong>{formatRM(loan.balance, 2)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Monthly instalment</span>
            <strong>{formatRM(loan.instalment)}</strong>
          </div>
        </div>
        <p className="page-subtitle" style={{ marginTop: 0 }}>
          Add your interest rate to see how much of each instalment is interest,
          when the loan should be fully repaid, and whether your recorded
          balances add up.
        </p>
        <Link to={`/property/${property.id}/edit`}>
          <button
            type="button"
            className="btn-secondary"
            style={{
              padding: "12px 18px",
              borderRadius: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Add interest rate
          </button>
        </Link>
      </div>
    );
  }

  if (!loan.ready) {
    return (
      <div className="card">
        <h3 style={{ marginTop: 0 }}>🏦 Loan</h3>
        <p className="page-subtitle" style={{ margin: 0 }}>
          An interest rate of {loan.rate}% is recorded, but the outstanding loan
          or monthly instalment is missing, so the loan can't be analysed yet.
        </p>
      </div>
    );
  }

  const principalShare = Math.max(0, 1 - loan.interestShare);
  const recentReview = loan.review.slice(-4).reverse();

  return (
    <div className="card" style={{ display: "grid", gap: 18 }}>
      <div>
        <h3 style={{ margin: 0 }}>🏦 Loan</h3>
        <p className="page-subtitle" style={{ margin: "6px 0 0" }}>
          {loan.lender ? `${loan.lender} · ` : ""}
          {loan.rate}% a year · {formatRM(loan.balance, 2)} outstanding
        </p>
      </div>

      <div>
        <div className="card-label">EACH {formatRM(loan.instalment)} INSTALMENT</div>
        {loan.repaying ? (
          <>
            <div
              style={{
                display: "flex",
                height: 12,
                borderRadius: 999,
                overflow: "hidden",
                margin: "10px 0 8px",
                background: "var(--color-surface-elevated)",
              }}
              aria-hidden="true"
            >
              <div style={{ width: `${loan.interestShare * 100}%`, background: "var(--color-warning)" }} />
              <div style={{ width: `${principalShare * 100}%`, background: "var(--color-success)" }} />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                fontSize: 14,
              }}
            >
              <span>
                <span style={{ color: "var(--color-warning)" }}>■</span> Interest{" "}
                <strong>{formatRM(loan.interest)}</strong>
              </span>
              <span>
                <span style={{ color: "var(--color-success)" }}>■</span> Reduces loan{" "}
                <strong>{formatRM(loan.principal)}</strong>
              </span>
            </div>
          </>
        ) : (
          <p style={{ color: "var(--color-negative)", margin: "8px 0 0" }}>
            The monthly interest (about {formatRM(loan.interest)}) is more than
            the instalment, so the balance is not going down.
          </p>
        )}
      </div>

      {loan.remainingMonths !== null && (
        <div>
          <div className="card-label">AT THE CURRENT INSTALMENT</div>
          <p style={{ margin: "8px 0 0", lineHeight: 1.55 }}>
            Fully repaid in about <strong>{duration(loan.remainingMonths)}</strong>{" "}
            (around {formatMonth(loan.payoffMonth)}), with roughly{" "}
            {formatRM(loan.remainingInterest)} of interest still to pay.
          </p>
          {loan.remainingMonths > USUAL_MAX_TENURE_MONTHS && (
            <p className="page-subtitle" style={{ margin: "8px 0 0", fontSize: 13 }}>
              That is longer than the usual 35-year maximum for a housing loan.
              If your actual remaining tenure is shorter, the interest rate or
              balance on record may not be right.
            </p>
          )}
        </div>
      )}

      <div>
        <div className="card-label">NEXT CHECK-IN</div>
        <p style={{ margin: "8px 0 0", lineHeight: 1.55 }}>
          If the next instalment is paid as usual, the balance for{" "}
          {formatMonth(loan.nextExpected.month)} should be about{" "}
          <strong>{formatRM(loan.nextExpected.balance)}</strong> (from{" "}
          {formatRM(loan.nextExpected.from, 2)}
          {loan.nextExpected.fromMonth
            ? ` in ${formatMonth(loan.nextExpected.fromMonth)}`
            : ""}
          ).
        </p>
      </div>

      {recentReview.length > 0 && (
        <details>
          <summary style={{ cursor: "pointer", fontWeight: 600 }}>
            Do recorded balances fit {loan.rate}%?
          </summary>
          <div style={{ overflowX: "auto", marginTop: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr className="page-subtitle" style={{ textAlign: "right" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>Month</th>
                  <th style={{ padding: "6px 8px" }}>Recorded</th>
                  <th style={{ padding: "6px 8px" }}>Expected</th>
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {recentReview.map((row) => {
                  const label = REVIEW_LABEL[row.status];
                  return (
                    <tr key={row.month} style={{ borderTop: "1px solid var(--color-border-strong)", textAlign: "right" }}>
                      <td style={{ textAlign: "left", padding: 8 }}>{formatMonth(row.month)}</td>
                      <td style={{ padding: 8 }}>{formatRM(row.actual, 2)}</td>
                      <td style={{ padding: 8 }}>{formatRM(row.expected)}</td>
                      <td style={{ textAlign: "left", padding: 8, color: label.color }}>
                        {label.text}
                        {(row.status === "higher" || row.status === "lower") &&
                          ` by ${formatRM(Math.abs(row.difference))}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="page-subtitle" style={{ fontSize: 12, margin: "10px 0 0" }}>
            Expected balances use the previous recorded balance, the instalment
            paid and {loan.rate}% ÷ 12 each month. Banks usually charge interest
            daily, so differences up to {formatRM(loan.tolerance)} count as a fit.
          </p>
        </details>
      )}
    </div>
  );
}
