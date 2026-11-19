import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  saveProperty,
  getProperty,
  getProperties,
  updateProperty,
} from "../services/storage";
import MoneyInput from "../components/MoneyInput";

/*
 * Add / Edit Investment
 *
 *   Step 1  What you bought — name, SPA price, purchase date, value,
 *           discount and purchase costs (what the property cost)
 *   Step 2  Financing — loan, instalment, rate, cashback
 *   Step 3  Monthly flow — rent, other income, recurring expenses
 *
 * Required: project name and SPA purchase price. Everything else can be
 * added later. Amounts are stored as entered (strings); a blank field
 * means "not entered" and an entered 0 is kept as "0".
 */

const EXPENSE_TYPES = [
  { value: "maintenanceFee", label: "Maintenance fee" },
  { value: "insurance", label: "Insurance" },
  { value: "quitRent", label: "Quit rent" },
  { value: "assessmentTax", label: "Assessment tax" },
  { value: "managementFee", label: "Management fee" },
  { value: "otherExpenses", label: "Other expense" },
];

const LEGACY_EXPENSE_FIELDS = EXPENSE_TYPES.map((item) => item.value);

const COST_FIELDS = [
  ["legalFees", "Legal fees (SPA and loan agreement)", "e.g. 6,000"],
  ["stampDuty", "Stamp duty (transfer and loan agreement)", "e.g. 9,500"],
  ["renovationCost", "Renovation", "e.g. 23,000"],
  ["furnishingCost", "Furnishing", "e.g. 8,000"],
  ["miscellaneousCost", "Other purchase costs (e.g. valuation fee)", "e.g. 500"],
];

const EMPTY_FORM = {
  projectName: "",
  purchasePrice: "",
  purchaseDate: "",
  purchaseDiscount: "",
  marketValue: "",
  renovationCost: "",
  legalFees: "",
  stampDuty: "",
  furnishingCost: "",
  miscellaneousCost: "",
  originalLoanAmount: "",
  outstandingLoan: "",
  monthlyInstalment: "",
  interestRate: "",
  lender: "",
  loanCashback: "",
  cashbackSource: "",
  monthlyRental: "",
};

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function createExpense(type = "otherExpenses", amount = "", remarks = "") {
  return {
    id: `expense-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    amount,
    remarks,
  };
}

function buildExpenseRows(property) {
  if (Array.isArray(property.monthlyExpenseItems)) {
    return property.monthlyExpenseItems.map((item, index) => ({
      id: item.id || `expense-${index}`,
      type: item.type || "otherExpenses",
      amount: item.amount ?? "",
      remarks: item.remarks || "",
    }));
  }

  return LEGACY_EXPENSE_FIELDS.reduce((rows, field) => {
    const amount = property[field];
    if (amount !== "" && amount !== null && amount !== undefined && Number(amount) !== 0) {
      rows.push(createExpense(field, String(amount), ""));
    }
    return rows;
  }, []);
}

// Keep an entered 0 as "0": blank means "not entered".
const asText = (value) => (value === null || value === undefined ? "" : String(value));

function TextField({ label, value, onChange, placeholder, hint, error, required, type = "text", name }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
        {label}
        {required && <span style={{ color: "var(--color-danger)" }}> *</span>}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
        style={{ borderColor: error ? "var(--color-danger)" : undefined }}
      />
      {error ? (
        <span style={{ fontSize: 12, color: "var(--color-danger)" }}>{error}</span>
      ) : (
        hint && <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{hint}</span>
      )}
    </label>
  );
}

function Panel({ title, children }) {
  return (
    <div
      style={{
        border: "1px solid var(--color-border-strong)",
        borderRadius: 12,
        padding: 14,
        background: "var(--color-surface-sunken)",
        display: "grid",
        gap: 12,
      }}
    >
      {title && <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>}
      {children}
    </div>
  );
}

function Note({ children }) {
  return (
    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--color-text-secondary)" }}>
      {children}
    </p>
  );
}

export default function PropertyWizard() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);

  const [searchParams] = useSearchParams();
  // Links such as /property/123/edit?step=2 open a specific step.
  const [step, setStep] = useState(() => {
    const requested = Number(searchParams.get("step"));
    return editing && [1, 2, 3].includes(requested) ? requested : 1;
  });
  const [form, setForm] = useState(EMPTY_FORM);
  const [expenseRows, setExpenseRows] = useState([
    createExpense("maintenanceFee", "", "Monthly maintenance fee"),
  ]);
  const [otherIncome, setOtherIncome] = useState("");
  const [otherIncomeRemarks, setOtherIncomeRemarks] = useState("");
  const [errors, setErrors] = useState({});
  const [costsOpen, setCostsOpen] = useState(false);

  useEffect(() => {
    if (!editing) return;
    const property = getProperty(id);
    if (!property) return;

    setForm({
      ...Object.fromEntries(Object.keys(EMPTY_FORM).map((key) => [key, asText(property[key])])),
      projectName: property.projectName || "",
      lender: property.lender || "",
      cashbackSource: property.cashbackSource || "",
    });
    setExpenseRows(buildExpenseRows(property));
    setOtherIncome(asText(property.monthlyOtherIncome));
    setOtherIncomeRemarks(property.monthlyOtherIncomeRemarks || "");
    setCostsOpen(COST_FIELDS.some(([key]) => asText(property[key]) !== ""));
  }, [editing, id]);

  const set = (key) => (value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  function updateExpense(expenseId, field, value) {
    setExpenseRows((rows) => rows.map((row) => (row.id === expenseId ? { ...row, [field]: value } : row)));
  }

  const monthlyExpenses = useMemo(
    () => expenseRows.reduce((total, row) => total + toNumber(row.amount), 0),
    [expenseRows]
  );

  const estimatedMonthlyResult =
    toNumber(form.monthlyRental) + toNumber(otherIncome) - toNumber(form.monthlyInstalment) - monthlyExpenses;

  const duplicateName = useMemo(() => {
    const name = form.projectName.trim().toLowerCase();
    if (!name) return false;
    return getProperties().some(
      (p) => String(p.projectName || "").trim().toLowerCase() === name && String(p.id) !== String(id)
    );
  }, [form.projectName, id]);

  function validateRequired() {
    const next = {};
    if (!form.projectName.trim()) next.projectName = "Enter a name so you can find this property.";
    if (!(toNumber(form.purchasePrice) > 0)) next.purchasePrice = "Enter the purchase price from the SPA.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const softWarnings = [];
  if (form.monthlyRental === "") softWarnings.push("monthly rent");
  if (toNumber(form.outstandingLoan) > 0 && form.monthlyInstalment === "") softWarnings.push("monthly loan instalment");

  function goNext() {
    if (step === 1 && !validateRequired()) return;
    setStep((current) => Math.min(3, current + 1));
  }

  function handleSubmit(event) {
    event.preventDefault();

    // Only step 3 saves; a submit from an earlier step just moves on.
    if (step < 3) {
      goNext();
      return;
    }

    if (!validateRequired()) {
      setStep(1);
      return;
    }

    const expenseItems = expenseRows
      .filter((row) => row.amount !== "" && toNumber(row.amount) !== 0)
      .map(({ id: expenseId, type, amount, remarks }) => ({
        id: expenseId,
        type,
        amount: toNumber(amount),
        remarks: remarks || "",
      }));

    const legacyTotals = LEGACY_EXPENSE_FIELDS.reduce((totals, field) => {
      totals[field] = expenseItems
        .filter((item) => item.type === field)
        .reduce((sum, item) => sum + item.amount, 0);
      return totals;
    }, {});

    // Remember when the interest rate was last changed, for freshness reminders.
    const previousRate = editing ? asText(getProperty(id)?.interestRate) : "";
    const rateChanged = form.interestRate !== "" && form.interestRate !== previousRate;

    const propertyData = {
      ...form,
      ...(rateChanged ? { interestRateUpdatedAt: new Date().toISOString() } : {}),
      projectName: form.projectName.trim(),
      monthlyOtherIncome: otherIncome,
      monthlyOtherIncomeRemarks: otherIncomeRemarks,
      monthlyExpenseItems: expenseItems,
      ...legacyTotals,
    };

    if (editing) {
      updateProperty(id, propertyData);
      navigate(`/property/${id}`);
    } else {
      const newId = saveProperty(propertyData);
      navigate(`/property/${newId}?tab=monthly&added=1`);
    }
  }

  const steps = [
    { number: 1, label: "What you bought" },
    { number: 2, label: "Financing" },
    { number: 3, label: "Monthly flow" },
  ];

  const showSameAsOriginal =
    form.originalLoanAmount !== "" && form.outstandingLoan === "";

  return (
    <div>
      <section className="page-header">
        <p className="page-subtitle">Investment Onboarding</p>
        <h1 className="page-title">{editing ? "Edit Investment" : "Add Investment"}</h1>
        <p className="page-subtitle">
          Only the name and purchase price are required. Everything else can be added later.
        </p>
      </section>

      <div className="card form-card">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 24 }}>
          {steps.map((item) => {
            const active = step === item.number;
            const completed = step > item.number;
            return (
              <button
                key={item.number}
                type="button"
                onClick={() => {
                  if (item.number > 1 && step === 1 && !validateRequired()) return;
                  setStep(item.number);
                }}
                aria-current={active ? "step" : undefined}
                style={{
                  border: active ? "1px solid var(--color-primary)" : "1px solid transparent",
                  borderRadius: 10,
                  padding: "12px 10px",
                  background: active || completed ? "var(--color-surface-elevated)" : "var(--color-surface)",
                  color: "inherit",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: 11, opacity: 0.65, textTransform: "uppercase" }}>Step {item.number}</div>
                <strong>{item.label}</strong>
              </button>
            );
          })}
        </div>

        <div
          style={{
            height: 6,
            background: "var(--color-surface-elevated)",
            borderRadius: 999,
            overflow: "hidden",
            marginBottom: 26,
          }}
        >
          <div
            style={{
              width: `${(step / 3) * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg,var(--color-primary),var(--color-link))",
              transition: "width 180ms ease",
            }}
          />
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {step === 1 && (
            <section style={{ display: "grid", gap: 14 }}>
              <h3 style={{ margin: 0 }}>What you bought</h3>

              <TextField
                label="Project name"
                name="projectName"
                required
                value={form.projectName}
                onChange={set("projectName")}
                placeholder="e.g. The Era, Unit A-12-3"
                error={errors.projectName}
                hint={duplicateName ? "You already have a property with this name." : undefined}
              />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
                <MoneyInput
                  label="SPA purchase price"
                  name="purchasePrice"
                  required
                  value={form.purchasePrice}
                  onChange={set("purchasePrice")}
                  placeholder="e.g. 450,000"
                  error={errors.purchasePrice}
                />
                <TextField
                  label="Purchase date (SPA date)"
                  name="purchaseDate"
                  type="date"
                  value={form.purchaseDate}
                  onChange={set("purchaseDate")}
                  hint="Used for RPGT holding period and your timeline."
                />
              </div>

              <MoneyInput
                label="Current market value"
                name="marketValue"
                value={form.marketValue}
                onChange={set("marketValue")}
                placeholder="e.g. 480,000"
                hint="Leave empty if you bought recently or don't have a valuation yet."
              />

              <Panel title="Purchase discount or rebate">
                <Note>
                  Optional. A developer discount or rebate deducted from the SPA price. Leave empty if the SPA price
                  above is already the price after the rebate, so it isn&apos;t counted twice.
                </Note>
                <MoneyInput
                  label="Discount / rebate"
                  name="purchaseDiscount"
                  value={form.purchaseDiscount}
                  onChange={set("purchaseDiscount")}
                  placeholder="e.g. 20,000"
                />
              </Panel>

              <details open={costsOpen} onToggle={(event) => setCostsOpen(event.currentTarget.open)}>
                <summary style={{ cursor: "pointer", fontWeight: 700 }}>Purchase costs (optional)</summary>
                <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                  <Note>
                    Used for the Investment Breakdown: what the property cost and how much of your own money is in
                    it. Enter 0 for anything that doesn&apos;t apply.
                  </Note>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
                    {COST_FIELDS.map(([key, label, placeholder]) => (
                      <MoneyInput
                        key={key}
                        name={key}
                        label={label}
                        value={form[key]}
                        onChange={set(key)}
                        placeholder={placeholder}
                      />
                    ))}
                  </div>
                </div>
              </details>
            </section>
          )}

          {step === 2 && (
            <section style={{ display: "grid", gap: 14 }}>
              <h3 style={{ margin: 0 }}>Financing</h3>
              <Note>Leave this step empty if the property was bought without a loan.</Note>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
                <MoneyInput
                  label="Original loan amount"
                  name="originalLoanAmount"
                  value={form.originalLoanAmount}
                  onChange={set("originalLoanAmount")}
                  placeholder="e.g. 405,000"
                  hint="As approved in the letter of offer."
                />
                <div style={{ display: "grid", gap: 6 }}>
                  <MoneyInput
                    label="Outstanding loan today"
                    name="outstandingLoan"
                    value={form.outstandingLoan}
                    onChange={set("outstandingLoan")}
                    placeholder="e.g. 398,500"
                    hint="From your latest loan statement."
                  />
                  {showSameAsOriginal && (
                    <button
                      type="button"
                      onClick={() => set("outstandingLoan")(form.originalLoanAmount)}
                      style={{
                        justifySelf: "start",
                        background: "transparent",
                        border: "none",
                        color: "var(--color-link)",
                        cursor: "pointer",
                        padding: 0,
                        fontSize: 13,
                      }}
                    >
                      Just bought? Use the original loan amount
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
                <MoneyInput
                  label="Monthly instalment"
                  name="monthlyInstalment"
                  value={form.monthlyInstalment}
                  onChange={set("monthlyInstalment")}
                  placeholder="e.g. 1,969"
                />
                <MoneyInput
                  label="Interest rate (% a year)"
                  name="interestRate"
                  prefix="%"
                  value={form.interestRate}
                  onChange={set("interestRate")}
                  placeholder="e.g. 4.15"
                  hint="Recommended: enables loan checks and real projections."
                />
              </div>

              <TextField
                label="Bank / lender (optional)"
                name="lender"
                value={form.lender}
                onChange={set("lender")}
                placeholder="e.g. Maybank"
              />

              <Panel title="Cashback received">
                <Note>
                  Optional. Money paid back to you by the developer or the bank. It reduces the cash you have in the
                  property, not the purchase price. If the rebate was deducted from the price instead, record it as a
                  purchase discount in step 1.
                </Note>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
                  <MoneyInput
                    label="Cashback received"
                    name="loanCashback"
                    value={form.loanCashback}
                    onChange={set("loanCashback")}
                    placeholder="e.g. 18,000"
                  />
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Cashback from</span>
                    <select
                      name="cashbackSource"
                      value={form.cashbackSource}
                      onChange={(event) => set("cashbackSource")(event.target.value)}
                    >
                      <option value="">Not specified</option>
                      <option value="developer">Developer</option>
                      <option value="bank">Bank</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                </div>
              </Panel>
            </section>
          )}

          {step === 3 && (
            <section style={{ display: "grid", gap: 14 }}>
              <h3 style={{ margin: 0 }}>Monthly flow</h3>
              <Note>Your normal monthly amounts. Actual months are recorded later in Monthly Check-in.</Note>

              <Panel>
                <div style={{ fontSize: 12, opacity: 0.7 }}>MONEY IN</div>
                <MoneyInput
                  label="Monthly rent"
                  name="monthlyRental"
                  value={form.monthlyRental}
                  onChange={set("monthlyRental")}
                  placeholder="e.g. 2,300"
                />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10 }}>
                  <MoneyInput
                    label="Other monthly income (optional)"
                    value={otherIncome}
                    onChange={setOtherIncome}
                    placeholder="e.g. 150"
                  />
                  <TextField
                    label="What is it for?"
                    value={otherIncomeRemarks}
                    onChange={setOtherIncomeRemarks}
                    placeholder="e.g. car park rental"
                  />
                </div>

                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>MONEY OUT</div>
                <div
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: "var(--color-surface-elevated)",
                  }}
                >
                  <strong>− RM {toNumber(form.monthlyInstalment).toLocaleString("en-MY")}</strong>
                  <div style={{ fontSize: 12, opacity: 0.7, marginTop: 3 }}>Loan instalment (from step 2)</div>
                </div>

                {expenseRows.map((row) => (
                  <div
                    key={row.id}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      background: "var(--color-surface-elevated)",
                      display: "grid",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(140px,1fr) minmax(130px,170px) auto",
                        gap: 10,
                        alignItems: "end",
                      }}
                    >
                      <label style={{ display: "grid", gap: 6 }}>
                        <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Expense</span>
                        <select value={row.type} onChange={(e) => updateExpense(row.id, "type", e.target.value)}>
                          {EXPENSE_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <MoneyInput
                        label="Monthly amount"
                        value={row.amount}
                        onChange={(value) => updateExpense(row.id, "amount", value)}
                        placeholder="e.g. 273.70"
                      />
                      <button
                        type="button"
                        onClick={() => setExpenseRows((rows) => rows.filter((r) => r.id !== row.id))}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "inherit",
                          cursor: "pointer",
                          padding: "12px 4px",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      placeholder="Remarks (optional), e.g. includes sinking fund"
                      value={row.remarks}
                      onChange={(e) => updateExpense(row.id, "remarks", e.target.value)}
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setExpenseRows((rows) => [...rows, createExpense()])}
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 10,
                    border: "1px dashed var(--color-border-strong)",
                    background: "transparent",
                    color: "inherit",
                    cursor: "pointer",
                  }}
                >
                  + Add expense
                </button>

                <div
                  style={{
                    paddingTop: 14,
                    borderTop: "1px solid var(--color-border-strong)",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <span>Estimated monthly cashflow</span>
                  <strong
                    style={{
                      color: estimatedMonthlyResult >= 0 ? "var(--color-success)" : "var(--color-negative)",
                    }}
                  >
                    RM {Math.round(estimatedMonthlyResult).toLocaleString("en-MY")}
                  </strong>
                </div>
              </Panel>

              {softWarnings.length > 0 && (
                <div
                  role="status"
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid var(--color-warning-border)",
                    background: "var(--color-warning-soft)",
                    fontSize: 13,
                    lineHeight: 1.55,
                  }}
                >
                  No {softWarnings.join(" or ")} entered yet. You can save now and add{" "}
                  {softWarnings.length === 1 ? "it" : "them"} later, but cashflow will be incomplete until you do.
                </div>
              )}
            </section>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 28 }}>
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(1, current - 1))}
              disabled={step === 1}
              style={{
                padding: "12px 18px",
                borderRadius: 10,
                border: "1px solid var(--color-border-strong)",
                background: "transparent",
                color: "inherit",
                cursor: step === 1 ? "default" : "pointer",
                opacity: step === 1 ? 0.35 : 1,
              }}
            >
              Back
            </button>

            {/*
              Distinct keys matter: without them React reuses the same
              <button> and switches its type to "submit" during the click on
              step 2, which submits the form immediately and skips step 3.
            */}
            {step < 3 ? (
              <button key="continue" type="button" className="primary-button" onClick={goNext}>
                Continue
              </button>
            ) : (
              <button key="save" type="submit" className="primary-button">
                {editing ? "Save Changes" : "Save Investment"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
