import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getProperties } from "../services/storage";
import MoneyInput from "../components/MoneyInput";
import { analyseLoan } from "../utils/loanEngine";
import { calculateAcquisition } from "../utils/acquisitionEngine";
import {
  formatMonth,
  formatRM,
  getCurrentValue,
  getMonthlyExpenses,
  toAmount,
} from "../utils/propertyFinancials";

/*
 * Investor Tools — quick calculators
 *
 * All calculators share one set of inputs, so a figure typed once (or
 * filled from a property) is available to every tool. Nothing here changes
 * the property records.
 *
 * Tax & fee rules (verify before relying on them; see Investor Guides):
 * - Tenancy stamp duty: Stamp Act 1949 Item 49 as amended by Finance Act
 *   2024, effective 1 Jan 2025 — RM1 / RM3 / RM5 / RM7 per RM250 of annual
 *   rent by tenancy length, RM10 minimum, no RM2,400 exemption.
 * - RPGT (Part I: Malaysian citizens & PRs): 30% within 3 years, 20% in the
 *   4th, 15% in the 5th, 0% from the 6th; exemption of RM10,000 or 10% of
 *   the chargeable gain, whichever is greater; buyer retains 3% of price.
 */

const GROUPS = [
  {
    title: "Income",
    tools: [
      ["cashflow", "Cashflow", "Monthly result after costs"],
      ["yield", "Rental yield", "Rent compared with price"],
      ["breakeven", "Break-even rent", "Rent needed to cover costs"],
    ],
  },
  {
    title: "Financing",
    tools: [
      ["payment", "Loan payment", "Instalment for a new loan"],
      ["loancheck", "Loan check", "Interest, principal and term"],
      ["ltv", "Loan-to-value", "Loan compared with value"],
    ],
  },
  {
    title: "Tax & fees",
    tools: [
      ["stamp", "Tenancy stamp duty", "Duty on a tenancy agreement"],
      ["rpgt", "RPGT estimate", "Tax on a sale (citizens & PRs)"],
    ],
  },
];

const TENANCY_BANDS = [
  { id: "1", label: "1 year or less", rate: 1 },
  { id: "3", label: "Over 1 year, up to 3 years", rate: 3 },
  { id: "5", label: "Over 3 years, up to 5 years", rate: 5 },
  { id: "6", label: "Over 5 years", rate: 7 },
];

const EMPTY = {
  rent: "",
  otherIncome: "",
  expenses: "",
  instalment: "",
  price: "",
  value: "",
  balance: "",
  rate: "",
  newLoan: "",
  years: "",
  target: "",
  tenancyBand: "3",
  copies: "1",
  salePrice: "",
  acquisitionPrice: "",
  enhancement: "",
  saleCosts: "",
  acquiredOn: "",
  soldOn: "",
};

const n = (value) => toAmount(value) ?? 0;

function Result({ label, value, tone, note }) {
  return (
    <div className="result-box" style={{ display: "grid", gap: 4 }}>
      <span>{label}</span>
      <strong
        style={{
          fontSize: 22,
          color:
            tone === "positive"
              ? "var(--color-success)"
              : tone === "negative"
              ? "var(--color-negative)"
              : "inherit",
        }}
      >
        {value}
      </strong>
      {note && <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{note}</span>}
    </div>
  );
}

function Grid({ children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
        gap: 14,
        marginTop: 14,
      }}
    >
      {children}
    </div>
  );
}

function Explain({ children }) {
  return (
    <p style={{ margin: "12px 0 0", fontSize: 13, lineHeight: 1.55, color: "var(--color-text-muted)" }}>
      {children}
    </p>
  );
}

function holdingRate(acquiredOn, soldOn) {
  if (!acquiredOn || !soldOn) return null;
  const a = new Date(`${acquiredOn}T00:00:00`);
  const d = new Date(`${soldOn}T00:00:00`);
  if (!(d > a)) return null;
  const after = (years) => new Date(a.getFullYear() + years, a.getMonth(), a.getDate());
  if (d < after(3)) return { rate: 30, label: "within 3 years" };
  if (d < after(4)) return { rate: 20, label: "in the 4th year" };
  if (d < after(5)) return { rate: 15, label: "in the 5th year" };
  return { rate: 0, label: "in the 6th year or later" };
}

export default function InvestorTools() {
  const [properties] = useState(() => getProperties());
  const [tool, setTool] = useState("cashflow");
  const [v, setV] = useState(EMPTY);
  const [filledFrom, setFilledFrom] = useState("");

  const set = (key) => (value) => setV((current) => ({ ...current, [key]: value }));

  function fillFrom(id) {
    const property = properties.find((p) => String(p.id) === String(id));
    if (!property) return;
    const acquisition = calculateAcquisition(property);
    const text = (value) => (value === null || value === undefined ? "" : String(value));

    setV((current) => ({
      ...current,
      rent: text(toAmount(property.monthlyRental)),
      otherIncome: text(toAmount(property.monthlyOtherIncome)),
      expenses: text(getMonthlyExpenses(property)),
      instalment: text(toAmount(property.monthlyInstalment)),
      price: text(toAmount(property.purchasePrice)),
      value: text(getCurrentValue(property).value || ""),
      balance: text(toAmount(property.outstandingLoan)),
      rate: text(toAmount(property.interestRate)),
      acquisitionPrice: text(acquisition.totalAcquisitionCost),
      enhancement: text(toAmount(property.renovationCost)),
    }));
    setFilledFrom(property.projectName || "property");
  }

  /* ---- calculations ---- */
  const cashflow = n(v.rent) + n(v.otherIncome) - n(v.expenses) - n(v.instalment);
  const grossYield = n(v.price) ? ((n(v.rent) * 12) / n(v.price)) * 100 : null;
  const netYield = n(v.price)
    ? (((n(v.rent) + n(v.otherIncome) - n(v.expenses)) * 12) / n(v.price)) * 100
    : null;
  const breakEvenRent = n(v.instalment) + n(v.expenses) - n(v.otherIncome) + n(v.target);

  const newLoanPayment = useMemo(() => {
    const principal = n(v.newLoan);
    const months = n(v.years) * 12;
    const r = n(v.rate) / 100 / 12;
    if (!principal || !months) return null;
    if (!r) return principal / months;
    return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  }, [v.newLoan, v.years, v.rate]);

  const loanCheck = analyseLoan(
    { interestRate: v.rate, outstandingLoan: v.balance, monthlyInstalment: v.instalment },
    []
  );

  const ltv = n(v.value) ? (n(v.balance) / n(v.value)) * 100 : null;

  const band = TENANCY_BANDS.find((b) => b.id === v.tenancyBand) || TENANCY_BANDS[1];
  const annualRent = n(v.rent) * 12;
  const blocks = Math.ceil(annualRent / 250);
  const stampDuty = annualRent > 0 ? Math.max(10, blocks * band.rate) : null;
  const extraCopies = Math.max(0, Math.floor(n(v.copies)) - 1) * 10;

  const rpgtHolding = holdingRate(v.acquiredOn, v.soldOn);
  const gain = n(v.salePrice) - n(v.saleCosts) - (n(v.acquisitionPrice) + n(v.enhancement));
  const exemption = gain > 0 ? Math.max(10000, gain * 0.1) : 0;
  const chargeable = Math.max(0, gain - exemption);
  const rpgt = rpgtHolding ? chargeable * (rpgtHolding.rate / 100) : null;
  const retention = n(v.salePrice) * 0.03;

  /* ---- tool panels ---- */
  const panels = {
    cashflow: (
      <>
        <Grid>
          <MoneyInput label="Monthly rent" value={v.rent} onChange={set("rent")} />
          <MoneyInput label="Other monthly income" value={v.otherIncome} onChange={set("otherIncome")} />
          <MoneyInput label="Monthly expenses (excl. instalment)" value={v.expenses} onChange={set("expenses")} />
          <MoneyInput label="Monthly loan instalment" value={v.instalment} onChange={set("instalment")} />
        </Grid>
        <Grid>
          <Result
            label="Monthly cashflow"
            value={formatRM(cashflow, 2)}
            tone={cashflow >= 0 ? "positive" : "negative"}
            note={`${formatRM(cashflow * 12)} a year`}
          />
        </Grid>
        <Explain>Rent + other income − expenses − instalment. The same formula Aequitas uses for your properties.</Explain>
      </>
    ),

    yield: (
      <>
        <Grid>
          <MoneyInput label="Purchase price" value={v.price} onChange={set("price")} />
          <MoneyInput label="Monthly rent" value={v.rent} onChange={set("rent")} />
          <MoneyInput label="Other monthly income" value={v.otherIncome} onChange={set("otherIncome")} />
          <MoneyInput label="Monthly expenses (excl. instalment)" value={v.expenses} onChange={set("expenses")} />
        </Grid>
        <Grid>
          <Result label="Gross yield" value={grossYield === null ? "—" : `${grossYield.toFixed(2)}%`} note="Annual rent ÷ price" />
          <Result label="Net yield" value={netYield === null ? "—" : `${netYield.toFixed(2)}%`} note="(Rent + other income − expenses) × 12 ÷ price" />
        </Grid>
        <Explain>Yields ignore the loan. To see the effect of financing, use Cashflow.</Explain>
      </>
    ),

    breakeven: (
      <>
        <Grid>
          <MoneyInput label="Monthly loan instalment" value={v.instalment} onChange={set("instalment")} />
          <MoneyInput label="Monthly expenses (excl. instalment)" value={v.expenses} onChange={set("expenses")} />
          <MoneyInput label="Other monthly income" value={v.otherIncome} onChange={set("otherIncome")} />
          <MoneyInput label="Target monthly cashflow" value={v.target} onChange={set("target")} hint="Leave empty to break even" />
        </Grid>
        <Grid>
          <Result label="Rent needed" value={formatRM(breakEvenRent, 2)} note={n(v.target) ? `For ${formatRM(n(v.target))} a month` : "To break even"} />
          {n(v.rent) > 0 && (
            <Result
              label="Compared with current rent"
              value={`${n(v.rent) - breakEvenRent >= 0 ? "+" : "−"}${formatRM(Math.abs(n(v.rent) - breakEvenRent), 2)}`}
              tone={n(v.rent) - breakEvenRent >= 0 ? "positive" : "negative"}
              note={`Current rent ${formatRM(n(v.rent))}`}
            />
          )}
        </Grid>
        <Explain>Instalment + expenses − other income + target cashflow.</Explain>
      </>
    ),

    payment: (
      <>
        <Grid>
          <MoneyInput label="Loan amount" value={v.newLoan} onChange={set("newLoan")} />
          <MoneyInput label="Interest rate (% a year)" value={v.rate} onChange={set("rate")} prefix="%" placeholder="e.g. 4.15" />
          <MoneyInput label="Loan term (years)" value={v.years} onChange={set("years")} prefix="" placeholder="e.g. 35" />
        </Grid>
        <Grid>
          <Result label="Monthly instalment" value={newLoanPayment === null ? "—" : formatRM(newLoanPayment, 2)} />
          {newLoanPayment !== null && (
            <Result
              label="Total interest over the term"
              value={formatRM(newLoanPayment * n(v.years) * 12 - n(v.newLoan))}
              note={`${formatRM(newLoanPayment * n(v.years) * 12)} paid in total`}
            />
          )}
        </Grid>
        <Explain>Standard monthly-rest calculation. Your bank's figure may differ slightly.</Explain>
      </>
    ),

    loancheck: (
      <>
        <Grid>
          <MoneyInput label="Outstanding loan" value={v.balance} onChange={set("balance")} />
          <MoneyInput label="Interest rate (% a year)" value={v.rate} onChange={set("rate")} prefix="%" placeholder="e.g. 4.15" />
          <MoneyInput label="Monthly instalment" value={v.instalment} onChange={set("instalment")} />
        </Grid>
        {loanCheck.ready ? (
          <>
            <Grid>
              <Result label="Interest this month" value={formatRM(loanCheck.interest, 2)} />
              <Result
                label="Reduces the loan"
                value={loanCheck.repaying ? formatRM(loanCheck.principal, 2) : "Nothing"}
                tone={loanCheck.repaying ? "positive" : "negative"}
              />
              <Result
                label="Repaid in"
                value={
                  loanCheck.remainingMonths === null
                    ? "Never at this instalment"
                    : `${Math.floor(loanCheck.remainingMonths / 12)} yrs ${loanCheck.remainingMonths % 12} mths`
                }
                note={loanCheck.payoffMonth ? `Around ${formatMonth(loanCheck.payoffMonth)}` : null}
              />
            </Grid>
            <Explain>
              Interest estimated as balance × rate ÷ 12. Banks usually charge daily, so expect small differences
              from your statement.
            </Explain>
          </>
        ) : (
          <Explain>Enter the outstanding loan, interest rate and instalment.</Explain>
        )}
      </>
    ),

    ltv: (
      <>
        <Grid>
          <MoneyInput label="Outstanding loan" value={v.balance} onChange={set("balance")} />
          <MoneyInput label="Property value" value={v.value} onChange={set("value")} />
        </Grid>
        <Grid>
          <Result label="Loan-to-value" value={ltv === null ? "—" : `${ltv.toFixed(1)}%`} />
          {ltv !== null && <Result label="Equity" value={formatRM(n(v.value) - n(v.balance))} />}
        </Grid>
        <Explain>Aequitas flags 90% and above as high leverage, and above 100% as the loan exceeding the value.</Explain>
      </>
    ),

    stamp: (
      <>
        <Grid>
          <MoneyInput label="Monthly rent" value={v.rent} onChange={set("rent")} />
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Tenancy length</span>
            <select value={v.tenancyBand} onChange={(e) => set("tenancyBand")(e.target.value)}>
              {TENANCY_BANDS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label} (RM{b.rate} per RM250)
                </option>
              ))}
            </select>
          </label>
          <MoneyInput label="Stamped copies" value={v.copies} onChange={set("copies")} prefix="" hint="Each copy after the first is RM10" />
        </Grid>
        <Grid>
          <Result
            label="Stamp duty"
            value={stampDuty === null ? "—" : formatRM(stampDuty + extraCopies)}
            note={
              stampDuty === null
                ? null
                : `${formatRM(annualRent)} a year → ${blocks} × RM250 blocks × RM${band.rate}` +
                  (extraCopies ? ` + ${formatRM(extraCopies)} for copies` : "")
            }
          />
        </Grid>
        <Explain>
          Rates from 1 January 2025 (Finance Act 2024), minimum RM10. From 2026, tenancies are self-assessed and
          paid through e-Duti Setem on MyTax. Confirm the rate there before paying. See the Investor Guides
          for the full process.
        </Explain>
      </>
    ),

    rpgt: (
      <>
        <Grid>
          <MoneyInput label="Selling price" value={v.salePrice} onChange={set("salePrice")} />
          <MoneyInput label="Selling costs (agent, legal)" value={v.saleCosts} onChange={set("saleCosts")} />
          <MoneyInput
            label="Acquisition price"
            value={v.acquisitionPrice}
            onChange={set("acquisitionPrice")}
            hint="Purchase price plus legal fees and stamp duty on purchase"
          />
          <MoneyInput label="Enhancement costs" value={v.enhancement} onChange={set("enhancement")} hint="e.g. renovation that added value" />
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Acquisition date (SPA)</span>
            <input type="date" value={v.acquiredOn} onChange={(e) => set("acquiredOn")(e.target.value)} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Disposal date (sale SPA)</span>
            <input type="date" value={v.soldOn} onChange={(e) => set("soldOn")(e.target.value)} />
          </label>
        </Grid>
        <Grid>
          <Result label="Gain" value={formatRM(gain)} tone={gain >= 0 ? undefined : "negative"} />
          <Result
            label="Estimated RPGT"
            value={rpgt === null ? "Enter both dates" : formatRM(rpgt)}
            note={
              rpgtHolding
                ? `${rpgtHolding.rate}% (disposed ${rpgtHolding.label}) on ${formatRM(chargeable)} after a ${formatRM(exemption)} exemption`
                : null
            }
          />
          {n(v.salePrice) > 0 && (
            <Result label="Buyer's 3% retention" value={formatRM(retention)} note="Held back and paid to LHDN; offset against your RPGT" />
          )}
        </Grid>
        <Explain>
          For individual Malaysian citizens and permanent residents only. Does not apply the once-in-a-lifetime
          private residence exemption or other reliefs. An estimate for planning; your lawyer files the actual
          RPGT return within 60 days of the sale.
        </Explain>
      </>
    ),
  };

  const activeTitle = GROUPS.flatMap((g) => g.tools).find(([id]) => id === tool)?.[1];

  return (
    <div className="page">
      <div className="page-header">
        <p className="eyebrow">Aequitas Investor Tools</p>
        <h1>Quick Calculators</h1>
        <p className="muted">
          Quick estimates that don&apos;t change your property records. To test a decision on one of your
          properties in depth, use Decision Lab.
        </p>
      </div>

      <div className="stack">
        {properties.length > 0 && (
          <section
            className="card"
            style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}
          >
            <div style={{ flex: "1 1 260px" }}>
              <strong>Fill from a property</strong>
              <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 4 }}>
                {filledFrom
                  ? `Figures loaded from ${filledFrom}. Edit freely; the property isn't changed.`
                  : "Load your property's figures into every calculator."}
              </div>
            </div>
            <select
              value=""
              onChange={(event) => fillFrom(event.target.value)}
              aria-label="Fill calculators from a property"
              style={{ flex: "0 1 240px" }}
            >
              <option value="">Choose a property…</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectName || "Unnamed property"}
                </option>
              ))}
            </select>
          </section>
        )}

        <section className="card">
          <h2 style={{ marginTop: 0 }}>What do you want to calculate?</h2>
          <div style={{ display: "grid", gap: 16 }}>
            {GROUPS.map((group) => (
              <div key={group.title}>
                <p className="eyebrow" style={{ margin: "0 0 8px" }}>{group.title}</p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                    gap: 10,
                  }}
                >
                  {group.tools.map(([id, title, description]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTool(id)}
                      aria-pressed={tool === id}
                      style={{
                        textAlign: "left",
                        padding: 14,
                        borderRadius: 12,
                        border:
                          tool === id
                            ? "1px solid var(--color-primary)"
                            : "1px solid var(--color-border)",
                        background: tool === id ? "var(--color-primary-soft)" : "transparent",
                        color: "inherit",
                        cursor: "pointer",
                      }}
                    >
                      <strong style={{ display: "block", marginBottom: 4 }}>{title}</strong>
                      <span className="muted" style={{ fontSize: "0.85rem" }}>{description}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h2 style={{ marginTop: 0 }}>{activeTitle}</h2>
          {panels[tool]}
        </section>

        <section className="card">
          <p className="eyebrow">From quick check to decision</p>
          <h2>Need to explore what happens next?</h2>
          <p className="muted">
            Decision Lab uses your property&apos;s data to explore financing changes, what-if assumptions, loan
            projections and exit scenarios.
          </p>
          <Link to="/decision-lab" className="primary-button" style={{ display: "inline-block", width: "auto" }}>
            Open Decision Lab
          </Link>
        </section>
      </div>
    </div>
  );
}
