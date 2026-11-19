import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import { getProperty } from "../services/storage";
import { getMonthlyCheckins } from "../services/monthlyCheckinStorage";
import { calculateAcquisition } from "../utils/acquisitionEngine";
import { assessProperty } from "../utils/assessmentEngine";
import { formatDate, getDocuments } from "../utils/documents";
import {
  formatMonth,
  formatRM,
  getCheckinCashflow,
  getMonthlyCashflow,
  toAmount,
} from "../utils/propertyFinancials";
import { getBillsForYear } from "../utils/yearlyBills";
import { DOCUMENT_TYPES } from "../utils/documents";
import { depositTotal, getCurrentTenancy, getTenancyDates } from "../utils/tenancies";
import useFiles from "../hooks/useFiles";

/*
 * Property report — one A4 page (two for long histories) to save as PDF
 * or print, for a bank, a partner or your own records.
 *
 * Uses a fixed light "paper" palette so it prints the same whatever the
 * app theme. "Save as PDF" opens the browser's print dialog, which every
 * browser can turn into a PDF (on iPhone: Share → Print → pinch out, or
 * Save to Files).
 */

const ink = "#111827";
const soft = "#4B5563";
const faint = "#9CA3AF";
const line = "#E5E7EB";
const good = "#15803D";
const bad = "#C2410C";

function rm(value, decimals = 0) {
  return value === null || value === undefined ? "Not recorded" : formatRM(value, decimals);
}

function Row({ label, value, strong, note }) {
  return (
    <tr style={{ borderTop: `1px solid ${line}` }}>
      <td style={{ padding: "6px 0", color: strong ? ink : soft, fontWeight: strong ? 700 : 400 }}>
        {label}
        {note && <div style={{ fontSize: 10.5, color: faint }}>{note}</div>}
      </td>
      <td style={{ padding: "6px 0", textAlign: "right", fontWeight: strong ? 700 : 500, whiteSpace: "nowrap" }}>
        {value}
      </td>
    </tr>
  );
}

function Section({ title, children, canBreak = false }) {
  return (
    <section className={canBreak ? undefined : "report-section"} style={{ marginTop: 22 }}>
      <h2 style={{ fontSize: 13, margin: "0 0 6px", color: ink, fontWeight: 700 }}>{title}</h2>
      {children}
    </section>
  );
}

function Table({ children }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
      <tbody>{children}</tbody>
    </table>
  );
}

export default function PropertyReport() {
  const { id } = useParams();
  const property = getProperty(id);
  const { files } = useFiles(id);

  useEffect(() => {
    const previous = document.title;
    if (property) document.title = `${property.projectName || "Property"} report`;
    return () => {
      document.title = previous;
    };
  }, [property]);

  if (!property) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Property not found.</h2>
        <Link to="/portfolio">← Back to Portfolio</Link>
      </div>
    );
  }

  const today = new Date();
  const assessment = assessProperty(property, today);
  const { figures, loan } = assessment;
  const acq = calculateAcquisition(property);
  const flow = getMonthlyCashflow(property);
  const missingKeys = new Set(acq.missing.map((m) => m.key));
  const costKeys = ["legalFees", "stampDuty", "miscellaneousCost"];
  const improvementKeys = ["renovationCost", "furnishingCost"];
  const costsRecorded = costKeys.some((key) => !missingKeys.has(key));
  const improvementsRecorded = improvementKeys.some((key) => !missingKeys.has(key));
  const costsMissing = acq.missing
    .filter((m) => [...costKeys, ...improvementKeys].includes(m.key))
    .map((m) => m.label);
  const docs = getDocuments(property);
  const tenancy = getTenancyDates(property);
  const tenant = getCurrentTenancy(property);
  const onFile = DOCUMENT_TYPES.map((type) => ({
    label: type.label,
    count: files.filter((f) => f.docType === type.id).length,
    original: Boolean(docs[type.id]?.have),
  })).filter((d) => d.count || d.original);
  const bills = getBillsForYear(property, today.getFullYear(), today);
  const checkins = getMonthlyCheckins(property.id)
    .filter((c) => c?.month)
    .sort((a, b) => String(b.month).localeCompare(String(a.month)))
    .slice(0, 12);
  const name = property.projectName || "Unnamed property";
  const valueNote =
    figures.valueSource === "market"
      ? "Market value recorded by owner"
      : figures.valueSource === "purchase"
      ? "No valuation recorded: purchase price used"
      : "";

  const keyFigures = [
    { label: "Current value", value: rm(figures.value), note: valueNote },
    { label: "Outstanding loan", value: rm(figures.loan) },
    { label: "Equity", value: rm(figures.equity) },
    {
      label: "Monthly cashflow",
      value: rm(flow.cashflow),
      color: flow.cashflow >= 0 ? good : bad,
      note: "Expected, from the property record",
    },
  ];

  return (
    <div className="report-page-wrap">
      <div className="no-print report-toolbar">
        <Link to={`/property/${id}`}>← Back to property</Link>
        <button type="button" className="primary-button" style={{ width: "auto" }} onClick={() => window.print()}>
          Save as PDF
        </button>
      </div>
      <p className="no-print report-hint">
        In the print window, choose <strong>Save as PDF</strong> as the printer. On iPhone, tap Share, then Print,
        then Share again to save the PDF.
      </p>

      <article className="report-paper" style={{ color: ink }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: soft, fontWeight: 600 }}>Property report</div>
            <h1 style={{ fontSize: 26, margin: "4px 0 2px", letterSpacing: -0.4 }}>{name}</h1>
            <div style={{ fontSize: 12, color: soft }}>
              {property.purchaseDate ? `Purchased ${formatDate(property.purchaseDate)}` : "Purchase date not recorded"}
              {property.lender ? ` · Financed by ${property.lender}` : ""}
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: 11, color: soft }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
              <img src="/icons/icon-48.png" alt="" width={20} height={20} style={{ borderRadius: 5 }} />
              <strong style={{ color: ink, fontSize: 13 }}>Aequitas</strong>
            </div>
            <div style={{ marginTop: 4 }}>
              As of {today.toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}
            </div>
            <div style={{ marginTop: 2 }}>Status: {assessment.statusMeta.label}</div>
          </div>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
            marginTop: 18,
            padding: "12px 14px",
            border: `1px solid ${line}`,
            borderRadius: 10,
            background: "#F9FAFB",
          }}
        >
          {keyFigures.map((f) => (
            <div key={f.label}>
              <div style={{ fontSize: 10.5, color: soft }}>{f.label}</div>
              <div style={{ fontSize: 17, fontWeight: 700, marginTop: 3, color: f.color || ink }}>{f.value}</div>
              {f.note && <div style={{ fontSize: 9.5, color: faint, marginTop: 2 }}>{f.note}</div>}
            </div>
          ))}
        </div>

        <div className="report-columns">
          <div>
            <Section title="What it cost">
              <Table>
                <Row label="SPA purchase price" value={rm(acq.values.purchasePrice)} />
                {acq.values.purchaseDiscount ? (
                  <Row label="Less discount / rebate" value={`(${rm(acq.values.purchaseDiscount)})`} />
                ) : null}
                <Row
                  label="Legal, stamp duty and other costs"
                  value={costsRecorded ? rm(acq.acquisitionCosts) : "Not recorded"}
                />
                <Row
                  label="Renovation and furnishing"
                  value={improvementsRecorded ? rm(acq.improvementCosts) : "Not recorded"}
                />
                <Row
                  label="Total cost"
                  value={rm(acq.totalCost)}
                  strong
                  note={costsMissing.length ? `Leaves out ${costsMissing.join(", ").toLowerCase()} (not recorded)` : undefined}
                />
                <Row label="Original loan" value={rm(acq.values.originalLoanAmount)} />
                {acq.cashback ? <Row label="Cashback received" value={`(${rm(acq.cashback)})`} /> : null}
                <Row
                  label="Net cash invested"
                  value={acq.netCashInvested === null ? "Needs original loan" : rm(acq.netCashInvested)}
                  strong
                />
                <Row
                  label="Cash-on-cash return"
                  value={acq.cashOnCash === null ? "—" : `${acq.cashOnCash.toFixed(1)}% a year`}
                  note={acq.cashOnCash === null ? acq.cashOnCashNote : "Expected annual cashflow ÷ net cash invested"}
                />
              </Table>
            </Section>

            <Section title="Expected monthly cashflow">
              <Table>
                <Row label="Rent" value={rm(flow.rental, 2)} />
                {flow.otherIncome ? <Row label="Other income" value={rm(flow.otherIncome, 2)} /> : null}
                <Row label="Loan instalment" value={`(${rm(flow.instalment, 2)})`} />
                <Row label="Maintenance and other expenses" value={`(${rm(flow.expenses, 2)})`} />
                <Row label="Net cashflow" value={rm(flow.cashflow, 2)} strong />
                {figures.grossYield !== null && (
                  <Row label="Gross rental yield" value={`${figures.grossYield.toFixed(2)}%`} note="Annual rent ÷ purchase price" />
                )}
              </Table>
            </Section>
          </div>

          <div>
            <Section title="Loan">
              <Table>
                <Row label="Outstanding balance" value={rm(figures.loan, 2)} />
                <Row label="Monthly instalment" value={rm(loan?.instalment ?? toAmount(property.monthlyInstalment), 2)} />
                <Row
                  label="Interest rate"
                  value={loan?.hasRate ? `${loan.rate}% a year` : "Not recorded"}
                />
                {loan?.ready && (
                  <>
                    <Row
                      label="This month: interest / principal"
                      value={`${rm(loan.interest)} / ${rm(Math.max(0, loan.principal))}`}
                      note="Estimated at rate ÷ 12"
                    />
                    <Row
                      label="Expected payoff"
                      value={loan.payoffMonth ? formatMonth(loan.payoffMonth) : "Not repaying at this instalment"}
                    />
                  </>
                )}
                <Row
                  label="Loan to value"
                  value={figures.ltv === null ? "—" : `${(figures.ltv * 100).toFixed(1)}%`}
                />
              </Table>
            </Section>

            <Section title="Assessment">
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, lineHeight: 1.55, color: soft }}>
                {assessment.areas.map((area) => (
                  <li key={area.key}>
                    <strong style={{ color: ink }}>{area.title}:</strong> {area.text}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Dates">
              <Table>
                <Row
                  label="Tenancy"
                  value={
                    tenancy.ended
                      ? "Vacant"
                      : tenancy.endDate
                      ? `Until ${formatDate(tenancy.endDate)}`
                      : tenancy.startDate
                      ? `From ${formatDate(tenancy.startDate)}`
                      : "Not recorded"
                  }
                />
                {tenant && toAmount(tenant.rent) !== null && (
                  <Row label="Rent in tenancy agreement" value={formatRM(toAmount(tenant.rent), 2)} />
                )}
                {tenant && depositTotal(tenant) > 0 && (
                  <Row label="Tenant deposits held" value={formatRM(depositTotal(tenant), 2)} />
                )}
                <Row
                  label="Insurance expires"
                  value={docs.insurance?.expiryDate ? formatDate(docs.insurance.expiryDate) : "Not recorded"}
                />
                {bills.map((bill) => (
                  <Row
                    key={bill.id}
                    label={`${bill.label} ${bill.year}`}
                    value={
                      bill.status === "paid"
                        ? `Paid${bill.paidAmount !== null ? ` ${formatRM(bill.paidAmount, 2)}` : ""}`
                        : bill.status === "na"
                        ? "Not applicable"
                        : bill.status === "before-purchase"
                        ? "Before purchase"
                        : bill.status === "not-marked"
                        ? "Not marked paid"
                        : `Due ${formatDate(bill.dueDate)}`
                    }
                  />
                ))}
              </Table>
            </Section>
          </div>
        </div>

        {onFile.length > 0 && (
          <Section title="Documents on file">
            <div style={{ fontSize: 12, color: soft, lineHeight: 1.6 }}>
              {onFile
                .map((d) =>
                  d.count
                    ? `${d.label} (${d.count} file${d.count === 1 ? "" : "s"})`
                    : `${d.label} (original held)`
                )
                .join(" · ")}
            </div>
          </Section>
        )}

        <Section canBreak title={checkins.length ? `Recorded months (latest ${checkins.length})` : "Recorded months"}>
          {checkins.length === 0 ? (
            <p style={{ fontSize: 12, color: soft, margin: 0 }}>No monthly check-ins recorded yet.</p>
          ) : (
            <table className="report-months" style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
              <thead>
                <tr style={{ color: soft, textAlign: "right" }}>
                  <th style={{ textAlign: "left", fontWeight: 600, padding: "4px 0" }}>Month</th>
                  <th style={{ fontWeight: 600 }}>Rent</th>
                  <th style={{ fontWeight: 600 }}>Instalment</th>
                  <th style={{ fontWeight: 600 }}>Maintenance</th>
                  <th style={{ fontWeight: 600 }}>Other</th>
                  <th style={{ fontWeight: 600 }}>Cashflow</th>
                  <th style={{ fontWeight: 600 }}>Loan balance</th>
                </tr>
              </thead>
              <tbody>
                {checkins.map((c) => {
                  const cash = getCheckinCashflow(c);
                  const cell = (field) => {
                    const v = toAmount(c[field]);
                    return v === null ? "—" : formatRM(v, 2).replace("RM ", "");
                  };
                  return (
                    <tr key={c.month} style={{ borderTop: `1px solid ${line}`, textAlign: "right" }}>
                      <td style={{ textAlign: "left", padding: "5px 0" }}>{formatMonth(c.month)}</td>
                      <td>{cell("rentalReceived")}</td>
                      <td>{cell("loanInstalment")}</td>
                      <td>{cell("maintenancePaid")}</td>
                      <td>{cell("otherExpenses")}</td>
                      <td style={{ fontWeight: 600, color: cash >= 0 ? good : bad }}>
                        {formatRM(cash, 2).replace("RM ", "")}
                      </td>
                      <td>{cell("outstandingLoan")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <div style={{ fontSize: 10, color: faint, marginTop: 4 }}>Amounts in RM.</div>
        </Section>

        <footer style={{ marginTop: 24, paddingTop: 10, borderTop: `1px solid ${line}`, fontSize: 10, color: faint }}>
          Prepared with Aequitas from figures recorded by the owner. Not a valuation and not financial advice.
        </footer>
      </article>
    </div>
  );
}
