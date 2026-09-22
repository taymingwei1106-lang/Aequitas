import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  saveProperty,
  getProperty,
  updateProperty,
} from "../services/storage";

const EXPENSE_TYPES = [
  { value: "maintenanceFee", label: "Maintenance fee" },
  { value: "insurance", label: "Insurance" },
  { value: "quitRent", label: "Quit rent" },
  { value: "assessmentTax", label: "Assessment tax" },
  { value: "managementFee", label: "Management fee" },
  { value: "otherExpenses", label: "Other expense" },
];

const LEGACY_EXPENSE_FIELDS = EXPENSE_TYPES.map((item) => item.value);

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

    if (
      amount !== "" &&
      amount !== null &&
      amount !== undefined &&
      Number(amount) !== 0
    ) {
      rows.push(createExpense(field, amount, ""));
    }

    return rows;
  }, []);
}

export default function PropertyWizard() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);

  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    projectName: "",
    purchasePrice: "",
    marketValue: "",
    outstandingLoan: "",
    monthlyRental: "",
    monthlyInstalment: "",
    renovationCost: "",
    legalFees: "",
    stampDuty: "",
    furnishingCost: "",
  });

  const [expenseRows, setExpenseRows] = useState([]);
  const [otherIncome, setOtherIncome] = useState("");
  const [otherIncomeRemarks, setOtherIncomeRemarks] = useState("");

  useEffect(() => {
    if (!editing) return;

    const property = getProperty(id);
    if (!property) return;

    setForm({
      projectName: property.projectName || "",
      purchasePrice: property.purchasePrice || "",
      marketValue: property.marketValue || "",
      outstandingLoan: property.outstandingLoan || "",
      monthlyRental: property.monthlyRental || "",
      monthlyInstalment: property.monthlyInstalment || "",
      renovationCost: property.renovationCost || "",
      legalFees: property.legalFees || "",
      stampDuty: property.stampDuty || "",
      furnishingCost: property.furnishingCost || "",
    });

    setExpenseRows(buildExpenseRows(property));
    setOtherIncome(property.monthlyOtherIncome || "");
    setOtherIncomeRemarks(property.monthlyOtherIncomeRemarks || "");
  }, [editing, id]);

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function addExpense() {
    setExpenseRows((rows) => [...rows, createExpense()]);
  }

  function updateExpense(expenseId, field, value) {
    setExpenseRows((rows) =>
      rows.map((row) =>
        row.id === expenseId ? { ...row, [field]: value } : row
      )
    );
  }

  function removeExpense(expenseId) {
    setExpenseRows((rows) => rows.filter((row) => row.id !== expenseId));
  }

  const monthlyExpenses = useMemo(
    () => expenseRows.reduce((total, row) => total + toNumber(row.amount), 0),
    [expenseRows]
  );

  const estimatedMonthlyResult =
    toNumber(form.monthlyRental) +
    toNumber(otherIncome) -
    toNumber(form.monthlyInstalment) -
    monthlyExpenses;

  function handleSubmit(e) {
    e.preventDefault();

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

    const propertyData = {
      ...form,
      monthlyOtherIncome: otherIncome,
      monthlyOtherIncomeRemarks: otherIncomeRemarks,
      monthlyExpenseItems: expenseItems,
      ...legacyTotals,
    };

    if (editing) {
      updateProperty(id, propertyData);
      navigate(`/property/${id}`);
    } else {
      saveProperty(propertyData);
      navigate("/portfolio");
    }
  }

  const steps = [
    { number: 1, label: "Investment" },
    { number: 2, label: "Financing" },
    { number: 3, label: "Monthly Flow" },
  ];

  return (
    <div>
      <section className="page-header">
        <p className="page-subtitle">Investment Onboarding</p>

        <h1 className="page-title">
          {editing ? "Edit Investment" : "Add Investment"}
        </h1>

        <p className="page-subtitle">
          A few simple steps. Aequitas will handle the calculations.
        </p>
      </section>

      <div className="card form-card">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
            marginBottom: 24,
          }}
        >
          {steps.map((item) => {
            const active = step === item.number;
            const completed = step > item.number;

            return (
              <button
                key={item.number}
                type="button"
                onClick={() => setStep(item.number)}
                style={{
                  border: "none",
                  borderRadius: 10,
                  padding: "12px 8px",
                  background: active || completed ? "#24334f" : "#17171f",
                  color: "inherit",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    opacity: 0.65,
                    textTransform: "uppercase",
                  }}
                >
                  Step {item.number}
                </div>

                <strong>{item.label}</strong>
              </button>
            );
          })}
        </div>

        <div
          style={{
            height: 6,
            background: "#23232d",
            borderRadius: 999,
            overflow: "hidden",
            marginBottom: 26,
          }}
        >
          <div
            style={{
              width: `${(step / 3) * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg,#4f8cff,#68b8ff)",
              transition: "width 180ms ease",
            }}
          />
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <section>
              <h3 style={{ marginTop: 0 }}>Investment Information</h3>

              <p className="page-subtitle">
                Start with the property itself. You can add more detail later.
              </p>

              <div style={{ display: "grid", gap: 14 }}>
                <input
                  name="projectName"
                  placeholder="Project Name"
                  value={form.projectName}
                  onChange={handleChange}
                />

                <input
                  name="purchasePrice"
                  type="number"
                  placeholder="Purchase Price (RM)"
                  value={form.purchasePrice}
                  onChange={handleChange}
                />

                <input
                  name="marketValue"
                  type="number"
                  placeholder="Current Market Value (RM)"
                  value={form.marketValue}
                  onChange={handleChange}
                />
              </div>
            </section>
          )}

          {step === 2 && (
            <section>
              <h3 style={{ marginTop: 0 }}>Financing</h3>

              <p className="page-subtitle">
                Just tell Aequitas what you still owe and what you normally pay
                the bank each month.
              </p>

              <div style={{ display: "grid", gap: 14 }}>
                <input
                  name="outstandingLoan"
                  type="number"
                  placeholder="Outstanding Loan (RM)"
                  value={form.outstandingLoan}
                  onChange={handleChange}
                />

                <input
                  name="monthlyInstalment"
                  type="number"
                  placeholder="Monthly Loan Payment (RM)"
                  value={form.monthlyInstalment}
                  onChange={handleChange}
                />
              </div>

              <div
                style={{
                  marginTop: 18,
                  padding: 14,
                  borderRadius: 10,
                  background: "#111827",
                  border: "1px solid #273244",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                You do not need to enter interest calculations here. Aequitas
                can use the loan information for later analysis.
              </div>
            </section>
          )}

          {step === 3 && (
            <section>
              <h3 style={{ marginTop: 0 }}>Monthly Money Flow</h3>

              <p className="page-subtitle">
                Only enter what actually applies. Leave everything else alone.
              </p>

              <div
                style={{
                  padding: 16,
                  borderRadius: 12,
                  background: "#111827",
                  border: "1px solid #273244",
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 10 }}>
                  MONEY IN
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  <input
                    name="monthlyRental"
                    type="number"
                    placeholder="+ Rental received (RM)"
                    value={form.monthlyRental}
                    onChange={handleChange}
                  />

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <input
                      type="number"
                      placeholder="+ Other income (optional)"
                      value={otherIncome}
                      onChange={(e) => setOtherIncome(e.target.value)}
                    />

                    <input
                      placeholder="What was it for? (optional)"
                      value={otherIncomeRemarks}
                      onChange={(e) =>
                        setOtherIncomeRemarks(e.target.value)
                      }
                    />
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.7,
                    margin: "20px 0 10px",
                  }}
                >
                  MONEY OUT
                </div>

                <div style={{ display: "grid", gap: 12 }}>
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      background: "#171e2a",
                    }}
                  >
                    <strong>
                      − RM {toNumber(form.monthlyInstalment).toLocaleString()}
                    </strong>

                    <div
                      style={{
                        fontSize: 12,
                        opacity: 0.7,
                        marginTop: 3,
                      }}
                    >
                      Loan payment
                    </div>
                  </div>

                  {expenseRows.map((row) => (
                    <div
                      key={row.id}
                      style={{
                        padding: 12,
                        borderRadius: 10,
                        background: "#171e2a",
                        display: "grid",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 130px auto",
                          gap: 10,
                          alignItems: "center",
                        }}
                      >
                        <select
                          value={row.type}
                          onChange={(e) =>
                            updateExpense(row.id, "type", e.target.value)
                          }
                        >
                          {EXPENSE_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>

                        <input
                          type="number"
                          placeholder="Amount (RM)"
                          value={row.amount}
                          onChange={(e) =>
                            updateExpense(row.id, "amount", e.target.value)
                          }
                        />

                        <button
                          type="button"
                          onClick={() => removeExpense(row.id)}
                          style={{
                            border: "none",
                            background: "transparent",
                            color: "inherit",
                            cursor: "pointer",
                            padding: "8px 4px",
                          }}
                        >
                          Remove
                        </button>
                      </div>

                      <input
                        placeholder="Remarks — e.g. monthly maintenance fee"
                        value={row.remarks}
                        onChange={(e) =>
                          updateExpense(row.id, "remarks", e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addExpense}
                  style={{
                    width: "100%",
                    padding: 12,
                    marginTop: 12,
                    borderRadius: 10,
                    border: "1px dashed #53627a",
                    background: "transparent",
                    color: "inherit",
                    cursor: "pointer",
                  }}
                >
                  − Add expense
                </button>

                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 14,
                    borderTop: "1px solid #273244",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <span>Estimated monthly result</span>

                  <strong>
                    RM {Math.round(estimatedMonthlyResult).toLocaleString()}
                  </strong>
                </div>
              </div>

              <p className="page-subtitle" style={{ marginTop: 10 }}>
                These are normal monthly amounts. Actual month-by-month changes
                can be recorded later in Monthly Check-in.
              </p>

              <details style={{ marginTop: 20 }}>
                <summary style={{ cursor: "pointer", fontWeight: 700 }}>
                  Optional acquisition costs
                </summary>

                <p className="page-subtitle" style={{ marginTop: 10 }}>
                  Only use these if you want Aequitas to understand the
                  property's original acquisition cost.
                </p>

                <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
                  <input
                    name="renovationCost"
                    type="number"
                    placeholder="Renovation Cost (RM)"
                    value={form.renovationCost}
                    onChange={handleChange}
                  />

                  <input
                    name="legalFees"
                    type="number"
                    placeholder="Legal Fees (RM)"
                    value={form.legalFees}
                    onChange={handleChange}
                  />

                  <input
                    name="stampDuty"
                    type="number"
                    placeholder="Stamp Duty (RM)"
                    value={form.stampDuty}
                    onChange={handleChange}
                  />

                  <input
                    name="furnishingCost"
                    type="number"
                    placeholder="Furnishing Cost (RM)"
                    value={form.furnishingCost}
                    onChange={handleChange}
                  />
                </div>
              </details>
            </section>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              marginTop: 28,
            }}
          >
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(1, current - 1))}
              disabled={step === 1}
              style={{
                padding: "12px 18px",
                borderRadius: 10,
                border: "1px solid #39465b",
                background: "transparent",
                color: "inherit",
                cursor: step === 1 ? "default" : "pointer",
                opacity: step === 1 ? 0.35 : 1,
              }}
            >
              Back
            </button>

            {step < 3 ? (
              <button
                type="button"
                className="primary-button"
                onClick={() => setStep((current) => Math.min(3, current + 1))}
              >
                Continue
              </button>
            ) : (
              <button type="submit" className="primary-button">
                {editing ? "Save Changes" : "Save Investment"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
