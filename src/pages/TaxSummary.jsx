import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Card from "../components/Card";
import MoneyInput from "../components/MoneyInput";
import { getProperties } from "../services/storage";
import { formatRM } from "../utils/propertyFinancials";
import {
  ENTERED_FIELDS,
  NOT_DEDUCTIBLE,
  buildTaxSummary,
  defaultTaxYear,
  getEnteredFigures,
  saveEnteredFigure,
  taxSummarySheets,
} from "../utils/taxSummary";
import { buildWorkbook, downloadBlob } from "../utils/xlsxWriter";

/*
 * Tax summary — rental income and deductible expenses for one year,
 * per property, with an Excel export for filing or the tax agent.
 */

function Figure({ label, value, color, note }) {
  return (
    <div>
      <div className="card-label">{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6, color: color || "inherit" }}>{value}</div>
      {note && <div style={{ fontSize: 12, marginTop: 4, color: "var(--color-text-muted)" }}>{note}</div>}
    </div>
  );
}

function money(value) {
  return value === null || value === undefined ? "Not recorded" : formatRM(value, 2);
}

function PropertyTaxCard({ row, year, onChange }) {
  const entered = getEnteredFigures(row.property, year);
  const [open, setOpen] = useState(row.missing.length > 0);

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
        <div>
          <h3 style={{ margin: 0 }}>{row.name}</h3>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 4 }}>
            {row.monthsRecorded} of 12 months recorded
            {row.monthsRecorded > 0 && ` (${row.monthRange})`}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="card-label">Net rental income</div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              marginTop: 4,
              color: row.net === null ? "inherit" : row.net >= 0 ? "var(--color-success)" : "var(--color-negative)",
            }}
          >
            {row.net === null ? "No rent recorded" : formatRM(row.net, 2)}
          </div>
        </div>
      </div>

      <table style={{ width: "100%", marginTop: 16, borderCollapse: "collapse", fontSize: 14 }}>
        <tbody>
          <tr>
            <td style={{ padding: "8px 0", fontWeight: 600 }}>Gross rent received</td>
            <td style={{ padding: "8px 0", textAlign: "right", fontWeight: 600, whiteSpace: "nowrap" }}>
              {money(row.grossRent)}
            </td>
          </tr>
          {row.lines.map((line) => (
            <tr key={line.key} style={{ borderTop: "1px solid var(--color-border)" }}>
              <td style={{ padding: "8px 0" }}>
                Less {line.label.charAt(0).toLowerCase() + line.label.slice(1)}
                <div
                  style={{
                    fontSize: 12,
                    color: line.amount === null || line.incomplete ? "var(--color-warning)" : "var(--color-text-muted)",
                  }}
                >
                  {line.source}
                </div>
              </td>
              <td style={{ padding: "8px 0", textAlign: "right", whiteSpace: "nowrap" }}>
                {line.amount === null ? "—" : `(${formatRM(line.amount, 2)})`}
              </td>
            </tr>
          ))}
          <tr style={{ borderTop: "2px solid var(--color-border-strong)" }}>
            <td style={{ padding: "10px 0", fontWeight: 700 }}>Net rental income</td>
            <td style={{ padding: "10px 0", textAlign: "right", fontWeight: 700, whiteSpace: "nowrap" }}>
              {money(row.net)}
            </td>
          </tr>
        </tbody>
      </table>

      {row.missing.length > 0 && (
        <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--color-warning)" }}>
          Still to complete: {row.missing.join(", ")}.
        </p>
      )}

      <button
        type="button"
        className="btn-secondary"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, fontWeight: 600, cursor: "pointer" }}
      >
        {open ? "Hide figures to enter" : "Enter interest, insurance and repairs"}
      </button>

      {open && (
        <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
          {ENTERED_FIELDS.map((field) => (
            <div key={field.key} style={{ display: "grid", gap: 6 }}>
              <MoneyInput
                label={`${field.label} for ${year}`}
                value={entered[field.key] ?? ""}
                onChange={(value) => {
                  saveEnteredFigure(row.property, year, field.key, value);
                  onChange();
                }}
                hint={field.hint}
              />
              {field.key === "loanInterest" &&
                (row.interestEstimate !== null ? (
                  <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
                    Estimate from your recorded balances and interest rate: {formatRM(row.interestEstimate, 2)} for{" "}
                    {row.interestEstimateMonths} month{row.interestEstimateMonths === 1 ? "" : "s"}.{" "}
                    <button
                      type="button"
                      onClick={() => {
                        saveEnteredFigure(row.property, year, "loanInterest", String(row.interestEstimate));
                        onChange();
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        color: "var(--color-link)",
                        fontWeight: 600,
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Use estimate
                    </button>{" "}
                    The bank statement figure is better.
                  </div>
                ) : (
                  !row.hasRate && (
                    <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                      Add the interest rate in{" "}
                      <Link to={`/property/${row.property.id}/edit?step=2`}>Edit property</Link> to see an estimate.
                    </div>
                  )
                ))}
            </div>
          ))}

          {row.otherExpenses.length > 0 && (
            <div
              style={{
                padding: 12,
                borderRadius: 10,
                background: "var(--color-surface-sunken)",
                border: "1px solid var(--color-border)",
                fontSize: 13,
              }}
            >
              <strong>Other expenses in your check-ins</strong>
              <p style={{ margin: "4px 0 8px", color: "var(--color-text-secondary)" }}>
                Add the ones that are repairs, renewal or rent-collection costs to the line above.
              </p>
              {row.otherExpenses.map((item) => (
                <div key={item.month} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <span>
                    {new Date(`${item.month}-01T00:00:00`).toLocaleDateString("en-MY", { month: "short", year: "numeric" })}
                    {item.note && `: ${item.note}`}
                  </span>
                  <span>{formatRM(item.amount, 2)}</span>
                </div>
              ))}
            </div>
          )}

          <Link to={`/property/${row.property.id}?tab=monthly#yearly-bills`} style={{ fontSize: 13 }}>
            Mark quit rent and assessment tax paid in Yearly bills
          </Link>
        </div>
      )}
    </Card>
  );
}

export default function TaxSummary() {
  const [version, setVersion] = useState(0);
  const [year, setYear] = useState(() => defaultTaxYear());
  const thisYear = new Date().getFullYear();

  // Re-read after each edit so every figure comes from storage.
  const properties = useMemo(() => getProperties(), [version]); // eslint-disable-line react-hooks/exhaustive-deps
  const summary = useMemo(() => buildTaxSummary(properties, year), [properties, year]);

  function exportExcel() {
    const blob = buildWorkbook(taxSummarySheets(summary));
    downloadBlob(blob, `Aequitas_Rental-Income_${year}.xlsx`);
  }

  return (
    <div>
      <section className="page-header">
        <Link to="/portfolio" className="page-subtitle">
          ← Back to Portfolio
        </Link>
        <h1 className="page-title" style={{ marginTop: 12 }}>
          Tax summary
        </h1>
        <p className="page-subtitle">
          Rental income and deductible expenses for one year, for your Form BE or your tax agent.
        </p>
      </section>

      {properties.length === 0 ? (
        <Card>
          <h2>No properties yet</h2>
          <p className="page-subtitle">Add a property and record monthly check-ins to build a tax summary.</p>
        </Card>
      ) : (
        <>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              aria-label="Tax year"
              style={{ width: "auto" }}
            >
              {[thisYear, thisYear - 1, thisYear - 2, thisYear - 3].map((y) => (
                <option key={y} value={y}>
                  Year {y}
                  {y === thisYear ? " (in progress)" : ""}
                </option>
              ))}
            </select>
            <button type="button" className="primary-button" style={{ width: "auto" }} onClick={exportExcel}>
              Download Excel
            </button>
          </div>

          <Card>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 20 }}>
              <Figure label="Gross rent received" value={formatRM(summary.grossRent, 2)} />
              <Figure label="Deductions" value={formatRM(summary.deductions, 2)} />
              <Figure
                label="Net rental income"
                value={formatRM(summary.profit, 2)}
                color="var(--color-success)"
                note={summary.losses.length ? "Profitable properties only" : undefined}
              />
            </div>
            {(summary.losses.length > 0 || summary.noData.length > 0) && (
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 14,
                  borderTop: "1px solid var(--color-border)",
                  fontSize: 13,
                  color: "var(--color-text-secondary)",
                  display: "grid",
                  gap: 6,
                }}
              >
                {summary.losses.length > 0 && (
                  <div>
                    Loss in {year}: {summary.losses.map((r) => `${r.name} (${formatRM(r.net, 2)})`).join(", ")}. A rental
                    loss can&apos;t be carried forward or set against your salary. Ask your tax agent whether it can offset
                    another property&apos;s profit.
                  </div>
                )}
                {summary.noData.length > 0 && (
                  <div>No check-ins in {year}: {summary.noData.map((r) => r.name).join(", ")}.</div>
                )}
              </div>
            )}
          </Card>

          <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
            {summary.rows.map((row) => (
              <PropertyTaxCard
                key={`${row.property.id}-${year}`}
                row={row}
                year={year}
                onChange={() => setVersion((v) => v + 1)}
              />
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
          <Card>
            <h3 style={{ marginTop: 0 }}>What can&apos;t be deducted</h3>
            <ul className="page-subtitle" style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7 }}>
              {NOT_DEDUCTIBLE.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="page-subtitle" style={{ fontSize: 13, marginBottom: 0 }}>
              Based on LHDN Public Ruling 12/2018 for rental income under section 4(d). This organises your records; it
              isn&apos;t tax advice, so check it with your tax agent before filing.{" "}
              <Link to="/guides">Investor guides</Link>
            </p>
          </Card>
          </div>
        </>
      )}
    </div>
  );
}
