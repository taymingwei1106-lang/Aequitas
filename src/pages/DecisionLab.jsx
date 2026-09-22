import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const CHECKINS_KEY = "aequitas-monthly-checkins";

const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const money = (value) =>
  `RM ${num(value).toLocaleString("en-MY", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const percent = (value) => `${num(value).toFixed(2)}%`;

function propertyName(property) {
  return (
    property?.projectName ||
    property?.subjectName ||
    property?.propertyName ||
    property?.name ||
    property?.title ||
    "Unnamed Property"
  );
}

function extractPropertyArray(value) {
  if (Array.isArray(value)) {
    const looksLikeProperties = value.some(
      (item) =>
        item &&
        typeof item === "object" &&
        (
          "projectName" in item ||
          "subjectName" in item ||
          "propertyName" in item ||
          "purchasePrice" in item ||
          "outstandingLoan" in item ||
          "monthlyRental" in item
        )
    );

    if (looksLikeProperties) return value;

    for (const item of value) {
      const nested = extractPropertyArray(item);
      if (nested) return nested;
    }
  }

  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      const nested = extractPropertyArray(value[key]);
      if (nested) return nested;
    }
  }

  return null;
}

function readProperties() {
  try {
    const preferredKeys = [
      "properties",
      "aequitas-properties",
      "aequitasProperties",
      "propertyData",
    ];

    for (const key of preferredKeys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const found = extractPropertyArray(JSON.parse(raw));
      if (found) return found;
    }

    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || preferredKeys.includes(key)) continue;

      try {
        const found = extractPropertyArray(
          JSON.parse(localStorage.getItem(key))
        );
        if (found) return found;
      } catch {
        // Ignore unrelated storage.
      }
    }
  } catch {
    // Ignore malformed storage.
  }

  return [];
}

function readCheckins(propertyId) {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(CHECKINS_KEY) || "[]"
    );

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item) => String(item?.propertyId) === String(propertyId)
    );
  } catch {
    return [];
  }
}

function calculateMonthlyPayment(principal, annualRate, months) {
  const P = num(principal);
  const n = num(months);
  const r = num(annualRate) / 100 / 12;

  if (!P || !n) return 0;
  if (!r) return P / n;

  return (
    P *
    (r * Math.pow(1 + r, n)) /
    (Math.pow(1 + r, n) - 1)
  );
}

function estimateRemainingMonths(principal, annualRate, payment) {
  const P = num(principal);
  const A = num(payment);
  const r = num(annualRate) / 100 / 12;

  if (!P || !A) return 0;

  if (r === 0) {
    return Math.ceil(P / A);
  }

  const interestOnly = P * r;

  if (A <= interestOnly) {
    return 0;
  }

  const months =
    -Math.log(1 - (P * r) / A) / Math.log(1 + r);

  return Number.isFinite(months) && months > 0
    ? Math.ceil(months)
    : 0;
}


function projectLoan(principal, annualRate, payment, extra = 0, months = 12, lumpSum = 0) {
  let balance = Math.max(0, num(principal) - num(lumpSum));
  const r = num(annualRate) / 100 / 12;
  const scheduled = Math.max(0, num(payment));
  const additional = Math.max(0, num(extra));
  let interestPaid = 0;
  let principalPaid = 0;

  for (let month = 0; month < months && balance > 0.01; month += 1) {
    const interest = r > 0 ? balance * r : 0;
    let actualPayment = scheduled + additional;

    if (actualPayment <= interest && r > 0) {
      return { balance, interestPaid, principalPaid, months: month, impossible: true };
    }

    actualPayment = Math.min(actualPayment, balance + interest);
    const principalComponent = Math.max(0, actualPayment - interest);
    balance = Math.max(0, balance - principalComponent);
    interestPaid += interest;
    principalPaid += principalComponent;
  }

  return {
    balance,
    interestPaid,
    principalPaid,
    months: Math.min(months, 12),
    impossible: false,
  };
}

function simulateLoan(principal, annualRate, payment, extra = 0, lumpSum = 0) {
  let balance = Math.max(0, num(principal) - num(lumpSum));
  const r = num(annualRate) / 100 / 12;
  const scheduled = num(payment);
  const additional = Math.max(0, num(extra));

  if (!balance || (!scheduled && !additional)) {
    return { months: 0, totalInterest: 0, impossible: false };
  }

  let months = 0;
  let totalInterest = 0;

  while (balance > 0.01 && months < 1200) {
    const interest = r > 0 ? balance * r : 0;
    let actualPayment = scheduled + additional;

    if (actualPayment <= interest && r > 0) {
      return { months: 0, totalInterest: 0, impossible: true };
    }

    actualPayment = Math.min(actualPayment, balance + interest);
    balance = balance + interest - actualPayment;
    totalInterest += interest;
    months += 1;
  }

  return { months, totalInterest, impossible: false };
}

const card = {
  border: "1px solid #252b3d",
  borderRadius: 18,
  padding: 24,
  background: "#111119",
};

const input = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 15px",
  borderRadius: 12,
  border: "1px solid #292e3d",
  background: "#0d0d13",
  color: "#fff",
  fontSize: 15,
  marginTop: 7,
};

function Metric({ label, value, note }) {
  return (
    <div
      style={{
        padding: 15,
        borderRadius: 14,
        background: "#171722",
        border: "1px solid #252936",
      }}
    >
      <div style={{ color: "#9295a6", fontSize: 12, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
      {note && (
        <div style={{ color: "#777b8c", fontSize: 12, marginTop: 5 }}>
          {note}
        </div>
      )}
    </div>
  );
}

function ModeCard({ active, icon, title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        borderRadius: 16,
        padding: 18,
        minHeight: 122,
        border: active ? "1px solid #596b92" : "1px solid #252936",
        background: active ? "#181c28" : "#111119",
        color: "#fff",
        cursor: "pointer",
        boxShadow: active ? "0 0 0 1px rgba(89,107,146,.12)" : "none",
      }}
    >
      <div style={{ fontSize: 21, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
      <div style={{ color: "#898d9d", fontSize: 12, lineHeight: 1.45, marginTop: 5 }}>
        {description}
      </div>
    </button>
  );
}

function Field({ label, value, onChange, step = "1", min }) {
  return (
    <label style={{ display: "block", color: "#d9dae0", fontSize: 13, fontWeight: 600 }}>
      {label}
      <input
        type="number"
        step={step}
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={input}
      />
    </label>
  );
}


function ScenarioSummary({
  data,
  whatIf,
  loan,
  rentChange,
  rentChangeMode,
  expenseChange,
  expenseChangeMode,
  rateChange,
  rateChangeMode,
  valueChange,
  valueChangeMode,
}) {
  const cashflowDelta = whatIf.cashflow - data.cashflow;
  const loanDelta = whatIf.totalLoanPayment - data.instalment;

  const hasScenarioChange =
    num(rentChange) !== 0 ||
    num(expenseChange) !== 0 ||
    num(rateChange) !== 0 ||
    num(valueChange) !== 0 ||
    num(loan?.extraRepayment) !== 0 ||
    num(loan?.lumpSum) !== 0;

  const assumptions = [];

  if (num(rentChange) !== 0) {
    assumptions.push(
      `Rent ${num(rentChange) > 0 ? "+" : ""}${num(rentChange)}${
        rentChangeMode === "fixed" ? " RM" : "%"
      }`
    );
  }

  if (num(expenseChange) !== 0) {
    assumptions.push(
      `Maintenance ${num(expenseChange) > 0 ? "+" : ""}${num(expenseChange)}${
        expenseChangeMode === "fixed" ? " RM" : "%"
      }`
    );
  }

  if (num(rateChange) !== 0) {
    assumptions.push(
      `Rate ${num(rateChange) > 0 ? "+" : ""}${num(rateChange)}${
        rateChangeMode === "points" ? " points" : "%"
      }`
    );
  }

  if (num(valueChange) !== 0) {
    assumptions.push(
      `Property value ${num(valueChange) > 0 ? "+" : ""}${num(valueChange)}${
        valueChangeMode === "fixed" ? " RM" : "%"
      }`
    );
  }

  if (num(loan?.extraRepayment) !== 0) {
    assumptions.push(
      `Extra repayment +${money(loan.extraRepayment)}/month`
    );
  }

  if (num(loan?.lumpSum) !== 0) {
    assumptions.push(`Lump sum +${money(loan.lumpSum)}`);
  }

  return (
    <section
      style={{
        marginTop: 22,
        padding: 20,
        borderRadius: 18,
        border: "1px solid #2d3b60",
        background: "#111119",
      }}
    >
      <div
        style={{
          color: "#788096",
          fontSize: 11,
          letterSpacing: 1,
        }}
      >
        SCENARIO SUMMARY
      </div>

      <h3
        style={{
          margin: "8px 0 5px",
          fontSize: 21,
        }}
      >
        Today → Scenario
      </h3>

      <p
        style={{
          color: "#9296a7",
          margin: 0,
          fontSize: 13,
        }}
      >
        A quick comparison of the current position and the assumptions
        you have entered.
      </p>

      {!hasScenarioChange ? (
        <div
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 12,
            background: "#15151e",
            color: "#858998",
            fontSize: 13,
          }}
        >
          No scenario assumptions have been changed yet.
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(190px, 1fr))",
              gap: 10,
              marginTop: 18,
            }}
          >
            <Metric
              label="Monthly cashflow"
              value={money(whatIf.cashflow)}
              note={`Current ${money(data.cashflow)} · Change ${money(cashflowDelta)}`}
            />

            <Metric
              label="Monthly loan outflow"
              value={money(whatIf.totalLoanPayment)}
              note={`Current ${money(data.instalment)} · Change ${money(loanDelta)}`}
            />

            <Metric
              label="Projected equity"
              value={money(whatIf.equity)}
              note="Uses the 12-month projected loan balance"
            />

            <Metric
              label="Loan balance after 12 months"
              value={money(whatIf.scenarioLoanBalanceAfter12Months)}
              note={`Current path: ${money(
                whatIf.baselineLoanBalanceAfter12Months
              )}`}
            />

            <Metric
              label="Property value"
              value={money(whatIf.value)}
              note={`Current ${money(data.market || data.purchase)}`}
            />
          </div>

          <div
            style={{
              marginTop: 15,
              padding: 14,
              borderRadius: 12,
              background: "#15151e",
              color: "#858998",
              fontSize: 12,
              lineHeight: 1.55,
            }}
          >
            <strong style={{ color: "#d5d6dc" }}>
              Assumptions changed:
            </strong>{" "}
            {assumptions.join(" · ")}
          </div>

          <div
            style={{
              marginTop: 10,
              color: "#737789",
              fontSize: 11,
              lineHeight: 1.5,
            }}
          >
            Loan balance is projected for 12 months using the entered rate,
            scheduled payment, extra repayment and lump sum. Projected equity
            uses the scenario property value minus that projected balance.
            Actual lender schedules may differ.
          </div>
        </>
      )}
    </section>
  );
}

export default function DecisionLab() {
  const navigate = useNavigate();

  const [properties, setProperties] = useState(() => readProperties());
  const [selectedId, setSelectedId] = useState(() => {
    try {
      return sessionStorage.getItem("aequitas-decision-lab-property") || "";
    } catch {
      return "";
    }
  });

  const [mode, setMode] = useState("health");
  const [propertyMenuOpen, setPropertyMenuOpen] = useState(false);

  const [loanRate, setLoanRate] = useState(4.2);
  const [extraRepayment, setExtraRepayment] = useState(500);
  const [lumpSum, setLumpSum] = useState(0);
  const [refiRate, setRefiRate] = useState(3.5);
  const [refiYears, setRefiYears] = useState(25);
  const [refiCost, setRefiCost] = useState(5000);
  const [rentChange, setRentChange] = useState(0);
  const [rentChangeMode, setRentChangeMode] = useState("percent");

  const [expenseChange, setExpenseChange] = useState(0);
  const [expenseChangeMode, setExpenseChangeMode] = useState("percent");

  const [rateChange, setRateChange] = useState(0);
  const [rateChangeMode, setRateChangeMode] = useState("points");

  const [valueChange, setValueChange] = useState(0);
  const [valueChangeMode, setValueChangeMode] = useState("percent");
  const [salePrice, setSalePrice] = useState(0);

  useEffect(() => {
    const latest = readProperties();
    setProperties(latest);

    if (!latest.length) {
      setSelectedId("");
      return;
    }

    let saved = "";
    try {
      saved = sessionStorage.getItem("aequitas-decision-lab-property") || "";
    } catch {}

    const exists = latest.some(
      (p, i) => String(p?.id ?? `decision-${i}`) === String(saved)
    );

    if (saved && exists) {
      setSelectedId(saved);
    } else {
      setSelectedId(String(latest[0]?.id ?? "decision-0"));
    }
  }, []);

  const normalized = useMemo(
    () =>
      properties.map((property, index) => ({
        ...property,
        __decisionId: String(property?.id ?? `decision-${index}`),
      })),
    [properties]
  );

  const property = useMemo(
    () =>
      normalized.find((p) => p.__decisionId === String(selectedId)) ||
      normalized[0] ||
      null,
    [normalized, selectedId]
  );

  useEffect(() => {
    if (!property) return;

    try {
      sessionStorage.setItem(
        "aequitas-decision-lab-property",
        property.__decisionId
      );
    } catch {}

    setSalePrice(num(property.marketValue) || num(property.purchasePrice));
  }, [property?.__decisionId]);

  const data = useMemo(() => {
    if (!property) {
      return {
        rental: 0,
        instalment: 0,
        maintenance: 0,
        loan: 0,
        purchase: 0,
        market: 0,
        cashflow: 0,
        grossYield: 0,
        netYield: 0,
        ltv: 0,
        equity: 0,
        breakEvenRent: 0,
        checkins: [],
      };
    }

    const rental = num(property.monthlyRental);
    const instalment = num(property.monthlyInstalment);
    const maintenance = num(property.maintenanceFee);
    const loan = num(property.outstandingLoan);
    const purchase = num(property.purchasePrice);
    const market = num(property.marketValue);
    const baseValue = market || purchase;

    return {
      rental,
      instalment,
      maintenance,
      loan,
      purchase,
      market,
      cashflow: rental - instalment - maintenance,
      grossYield: purchase > 0 ? (rental * 12 / purchase) * 100 : 0,
      netYield: purchase > 0
        ? (Math.max(0, rental - maintenance) * 12 / purchase) * 100
        : 0,
      ltv: baseValue > 0 ? (loan / baseValue) * 100 : 0,
      equity: baseValue - loan,
      breakEvenRent: instalment + maintenance,
      checkins: readCheckins(property.id),
    };
  }, [property]);

  const loan = useMemo(() => {
    const months = 25 * 12;
    const payment =
      data.instalment ||
      calculateMonthlyPayment(data.loan, loanRate, months);

    const base = simulateLoan(data.loan, loanRate, payment);
    const scenario = simulateLoan(
      data.loan,
      loanRate,
      payment,
      extraRepayment,
      lumpSum
    );

    return {
      payment,
      base,
      scenario,
      interestSaved:
        !base.impossible && !scenario.impossible
          ? Math.max(0, base.totalInterest - scenario.totalInterest)
          : 0,
    };
  }, [data.loan, data.instalment, loanRate, extraRepayment, lumpSum]);

  const refinance = useMemo(() => {
    const months = Math.max(1, num(refiYears) * 12);
    const newPayment = calculateMonthlyPayment(data.loan, refiRate, months);
    const currentPayment =
      data.instalment ||
      calculateMonthlyPayment(data.loan, loanRate, months);
    const saving = currentPayment - newPayment;

    return {
      currentPayment,
      newPayment,
      saving,
      breakEven: saving > 0 ? num(refiCost) / saving : 0,
    };
  }, [data.loan, data.instalment, loanRate, refiRate, refiYears, refiCost]);

  const whatIf = useMemo(() => {
    const rentAdjustment =
      rentChangeMode === "fixed"
        ? num(rentChange)
        : data.rental * (num(rentChange) / 100);

    const expenseAdjustment =
      expenseChangeMode === "fixed"
        ? num(expenseChange)
        : data.maintenance * (num(expenseChange) / 100);

    const rateAdjustment =
      rateChangeMode === "points"
        ? num(rateChange)
        : loanRate * (num(rateChange) / 100);

    const valueAdjustment =
      valueChangeMode === "fixed"
        ? num(valueChange)
        : (data.market || data.purchase) * (num(valueChange) / 100);

    const rent = Math.max(0, data.rental + rentAdjustment);
    const maintenance = Math.max(
      0,
      data.maintenance + expenseAdjustment
    );

    const currentPayment =
      data.instalment ||
      calculateMonthlyPayment(data.loan, loanRate, 25 * 12);

    /*
     * Shared Decision Lab loan state:
     * - The What If? page starts from the actual Aequitas instalment.
     * - Extra repayment entered in Loan & Financing is carried here.
     * - A rate change recalculates the scheduled payment using an
     *   estimated remaining term derived from the current payment.
     * - The extra repayment is then added to the scheduled payment,
     *   giving the investor the total monthly debt outflow.
     */
    const estimatedRemainingMonths = estimateRemainingMonths(
      data.loan,
      loanRate,
      currentPayment
    );

    const adjustedRate = Math.max(0, loanRate + rateAdjustment);

    const scheduledPayment =
      adjustedRate === loanRate
        ? currentPayment
        : calculateMonthlyPayment(
            Math.max(0, data.loan - num(lumpSum)),
            adjustedRate,
            estimatedRemainingMonths || 25 * 12
          );

    const totalLoanPayment =
      scheduledPayment + Math.max(0, num(extraRepayment));

    const cashflow = rent - totalLoanPayment - maintenance;

    const value = Math.max(
      0,
      (data.market || data.purchase) + valueAdjustment
    );

    const baselineProjection = projectLoan(
      data.loan,
      loanRate,
      currentPayment,
      0,
      12,
      0
    );

    const scenarioProjection = projectLoan(
      data.loan,
      adjustedRate,
      scheduledPayment,
      extraRepayment,
      12,
      lumpSum
    );

    const projectedEquity = value - scenarioProjection.balance;
    const equityChange = projectedEquity - data.equity;
    const propertyValueChange = value - (data.market || data.purchase);

    return {
      rent,
      maintenance,
      currentPayment,
      scheduledPayment,
      extraRepayment: Math.max(0, num(extraRepayment)),
      totalLoanPayment,
      adjustedRate,
      estimatedRemainingMonths,
      cashflow,
      cashflowChange: cashflow - data.cashflow,
      value,
      equity: projectedEquity,
      equityChange,
      propertyValueChange,
      baselineLoanBalanceAfter12Months: baselineProjection.balance,
      scenarioLoanBalanceAfter12Months: scenarioProjection.balance,
      loanBalanceReductionAfter12Months:
        baselineProjection.balance - scenarioProjection.balance,
    };
  }, [
    data,
    rentChange,
    rentChangeMode,
    expenseChange,
    expenseChangeMode,
    rateChange,
    rateChangeMode,
    valueChange,
    valueChangeMode,
    loanRate,
    extraRepayment,
    lumpSum,
  ]);

  const sell = useMemo(
    () => ({
      equity: num(salePrice) - data.loan,
      difference: num(salePrice) - data.purchase,
    }),
    [salePrice, data.loan, data.purchase]
  );

  const modeInfo = {
    health: {
      eyebrow: "UNDERSTAND",
      title: "Property Health",
      description:
        "A quick view of where this investment stands today.",
    },
    loan: {
      eyebrow: "INVESTIGATE",
      title: "Loan & Financing",
      description:
        "Explore how repayment and refinancing could change the numbers.",
    },
    whatif: {
      eyebrow: "INVESTIGATE",
      title: "What If?",
      description:
        "Change one or more assumptions and see the resulting impact.",
    },
    sell: {
      eyebrow: "INVESTIGATE",
      title: "Sell / Exit",
      description:
        "Explore the equity that could be released at different sale prices.",
    },
  };

  function selectMode(nextMode) {
    setMode(nextMode);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetMode() {
    if (mode === "loan") {
      setLoanRate(4.2);
      setExtraRepayment(500);
      setLumpSum(0);
      setRefiRate(3.5);
      setRefiYears(25);
      setRefiCost(5000);
    }

    if (mode === "whatif") {
      setRentChange(0);
      setRentChangeMode("percent");
      setExpenseChange(0);
      setExpenseChangeMode("percent");
      setRateChange(0);
      setRateChangeMode("points");
      setValueChange(0);
      setValueChangeMode("percent");

      // Loan assumptions are shared across Decision Lab modes.
      setExtraRepayment(500);
      setLumpSum(0);
      setLoanRate(4.2);
    }

    if (mode === "sell") {
      setSalePrice(num(property?.marketValue) || num(property?.purchasePrice));
    }
  }

  if (!normalized.length) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 32, color: "#fff" }}>
        <h1>Decision Lab</h1>
        <p style={{ color: "#a7a9b8" }}>
          Aequitas could not find the saved properties.
        </p>
        <button onClick={() => navigate("/portfolio")}>Back to Portfolio</button>
      </div>
    );
  }

  const info = modeInfo[mode];

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "28px 30px 70px",
        color: "#fff",
      }}
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "transparent",
          border: 0,
          color: "#9296a7",
          cursor: "pointer",
          padding: 0,
          marginBottom: 18,
        }}
      >
        ← Back
      </button>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 20,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ color: "#777c90", fontSize: 12, letterSpacing: 1.1 }}>
            DECISION LAB
          </div>
          <h1 style={{ margin: "7px 0 6px", fontSize: 32 }}>
            Explore this investment
          </h1>
          <p style={{ color: "#969aaa", margin: 0, maxWidth: 620 }}>
            Aequitas already knows the property. Choose what you want to
            understand, then change assumptions only when you need to.
          </p>
        </div>

        <div
          style={{
            minWidth: 230,
            padding: "12px 14px",
            borderRadius: 14,
            background: "#15151e",
            border: "1px solid #252936",
          }}
        >
          <div style={{ color: "#777c8e", fontSize: 11, marginBottom: 5 }}>
            CURRENT PROPERTY
          </div>
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setPropertyMenuOpen((open) => !open)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "11px 12px",
                background: "#171b26",
                border: propertyMenuOpen
                  ? "1px solid #53698f"
                  : "1px solid #292e3d",
                borderRadius: 12,
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                textAlign: "left",
                boxShadow: propertyMenuOpen
                  ? "0 0 0 3px rgba(83,105,143,.12)"
                  : "none",
              }}
            >
              <span>{propertyName(property)}</span>
              <span
                style={{
                  fontSize: 18,
                  lineHeight: 1,
                  color: "#d4d7df",
                  transform: propertyMenuOpen ? "rotate(180deg)" : "none",
                  transition: "transform .15s ease",
                }}
              >
               ⌄
              </span>
            </button>

            {propertyMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  zIndex: 20,
                  top: "calc(100% + 6px)",
                  left: 0,
                  right: 0,
                  padding: 5,
                  borderRadius: 12,
                  background: "#151923",
                  border: "1px solid #30384a",
                  boxShadow: "0 16px 35px rgba(0,0,0,.35)",
                }}
              >
                {normalized.map((p) => {
                  const active = p.__decisionId === property.__decisionId;
                  return (
                    <button
                      key={p.__decisionId}
                      type="button"
                      onClick={() => {
                        setSelectedId(p.__decisionId);
                        setPropertyMenuOpen(false);
                        try {
                          sessionStorage.setItem(
                            "aequitas-decision-lab-property",
                            p.__decisionId
                          );
                        } catch {}
                      }}
                      style={{
                        width: "100%",
                        display: "block",
                        padding: "10px 11px",
                        border: 0,
                        borderRadius: 8,
                        background: active ? "#27334a" : "transparent",
                        color: active ? "#fff" : "#c6c9d2",
                        textAlign: "left",
                        fontSize: 14,
                        cursor: "pointer",
                      }}
                    >
                      {propertyName(p)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))",
          gap: 10,
          marginTop: 26,
        }}
      >
        <ModeCard
          active={mode === "health"}
          icon="◉"
          title="Property Health"
          description="Understand the current position."
          onClick={() => selectMode("health")}
        />
        <ModeCard
          active={mode === "loan"}
          icon="↘"
          title="Loan & Financing"
          description="Explore repayment and refinancing."
          onClick={() => selectMode("loan")}
        />
        <ModeCard
          active={mode === "whatif"}
          icon="↔"
          title="What If?"
          description="Change assumptions and compare."
          onClick={() => selectMode("whatif")}
        />
        <ModeCard
          active={mode === "sell"}
          icon="→"
          title="Sell / Exit"
          description="Explore possible sale proceeds."
          onClick={() => selectMode("sell")}
        />
      </div>

      <section style={{ ...card, marginTop: 22 }}>
        <div style={{ color: "#788096", fontSize: 11, letterSpacing: 1 }}>
          {info.eyebrow}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 15,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ margin: "8px 0 5px", fontSize: 25 }}>
              {info.title}
            </h2>
            <p style={{ color: "#9296a7", margin: 0 }}>
              {info.description}
            </p>
          </div>

          {mode !== "health" && (
            <button
              onClick={resetMode}
              style={{
                background: "transparent",
                color: "#9296a7",
                border: "1px solid #292e3d",
                borderRadius: 10,
                padding: "8px 12px",
                cursor: "pointer",
              }}
            >
              Reset assumptions
            </button>
          )}
        </div>

        {mode === "health" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 10,
                marginTop: 22,
              }}
            >
              <Metric
                label="Monthly cashflow"
                value={money(data.cashflow)}
                note="Rent − loan − maintenance"
              />
              <Metric
                label="Gross rental yield"
                value={percent(data.grossYield)}
                note="Annual rent ÷ purchase price"
              />
              <Metric
                label="Net rental yield"
                value={percent(data.netYield)}
                note="After maintenance"
              />
              <Metric
                label="Equity"
                value={money(data.equity)}
                note={
                  data.market
                    ? "Market value − loan"
                    : "Using purchase price"
                }
              />
              <Metric
                label="Loan-to-value"
                value={percent(data.ltv)}
              />
              <Metric
                label="Break-even rent"
                value={money(data.breakEvenRent)}
                note="Covers loan + maintenance"
              />
            </div>

            <div
              style={{
                marginTop: 18,
                padding: 15,
                borderRadius: 13,
                background: "#15151e",
                color: "#888c9d",
                fontSize: 13,
                lineHeight: 1.55,
              }}
            >
              <strong style={{ color: "#d5d6dc" }}>
                History:
              </strong>{" "}
              {data.checkins.length} monthly check-in
              {data.checkins.length === 1 ? "" : "s"} recorded.
              Property Health describes the current position; it does not
              decide what you should do.
            </div>
          </>
        )}

        {mode === "loan" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(205px, 1fr))",
                gap: 15,
                marginTop: 22,
              }}
            >
              <Field
                label="Estimated interest rate (%)"
                value={loanRate}
                onChange={setLoanRate}
                step="0.1"
              />
              <Field
                label="Extra monthly repayment"
                value={extraRepayment}
                onChange={setExtraRepayment}
                min="0"
              />
              <Field
                label="One-time lump sum"
                value={lumpSum}
                onChange={setLumpSum}
                min="0"
              />
            <div
              style={{
                marginTop: 14,
                padding: "11px 13px",
                borderRadius: 11,
                background: "#15151e",
                color: "#858998",
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: "#d3d4da" }}>
                Shared assumption:
              </strong>{" "}
              Loan & Financing inputs are used here automatically. For example,
              if you enter RM500 extra repayment there, What If? includes that
              RM500 in the total monthly loan outflow.
            </div>

            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 10,
                marginTop: 22,
              }}
            >
              <Metric label="Current payment" value={money(loan.payment)} />
              <Metric
                label="Estimated interest"
                value={
                  loan.base.impossible ? "—" : money(loan.base.totalInterest)
                }
              />
              <Metric
                label="Interest saved"
                value={money(loan.interestSaved)}
              />
              <Metric
                label="Current time"
                value={
                  loan.base.months
                    ? `${Math.floor(loan.base.months / 12)}y ${loan.base.months % 12}m`
                    : "—"
                }
              />
              <Metric
                label="Scenario time"
                value={
                  loan.scenario.months
                    ? `${Math.floor(loan.scenario.months / 12)}y ${loan.scenario.months % 12}m`
                    : "—"
                }
              />
            </div>

            <div style={{ marginTop: 18 }}>
              <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>
                Refinance
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(190px, 1fr))",
                  gap: 15,
                }}
              >
                <Field
                  label="New rate (%)"
                  value={refiRate}
                  onChange={setRefiRate}
                  step="0.1"
                />
                <Field
                  label="Remaining years"
                  value={refiYears}
                  onChange={setRefiYears}
                  min="1"
                />
                <Field
                  label="Refinance cost"
                  value={refiCost}
                  onChange={setRefiCost}
                  min="0"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 10,
                  marginTop: 15,
                }}
              >
                <Metric
                  label="New payment"
                  value={money(refinance.newPayment)}
                />
                <Metric
                  label="Monthly difference"
                  value={money(refinance.saving)}
                />
                <Metric
                  label="Simple break-even"
                  value={
                    refinance.breakEven
                      ? `${refinance.breakEven.toFixed(1)} months`
                      : "Not reached"
                  }
                />
              </div>
            </div>

            <div
              style={{
                marginTop: 18,
                padding: 14,
                borderRadius: 12,
                background: "#15151e",
                color: "#858998",
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              These are illustrative calculations. Actual loan terms,
              interest treatment, fees and early-settlement conditions should
              be confirmed with the lender.
            </div>
          </>
        )}

        {mode === "whatif" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(205px, 1fr))",
                gap: 15,
                marginTop: 22,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      color: "#d9dae0",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    Rent change
                  </span>

                  <div
                    style={{
                      display: "flex",
                      border: "1px solid #292e3d",
                      borderRadius: 9,
                      overflow: "hidden",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setRentChangeMode("percent")}
                      style={{
                        border: 0,
                        padding: "5px 9px",
                        background:
                          rentChangeMode === "percent"
                            ? "#252d40"
                            : "transparent",
                        color:
                          rentChangeMode === "percent"
                            ? "#fff"
                            : "#858998",
                        cursor: "pointer",
                        fontSize: 11,
                      }}
                    >
                      %
                    </button>
                    <button
                      type="button"
                      onClick={() => setRentChangeMode("fixed")}
                      style={{
                        border: 0,
                        padding: "5px 9px",
                        background:
                          rentChangeMode === "fixed"
                            ? "#252d40"
                            : "transparent",
                        color:
                          rentChangeMode === "fixed"
                            ? "#fff"
                            : "#858998",
                        cursor: "pointer",
                        fontSize: 11,
                      }}
                    >
                      RM
                    </button>
                  </div>
                </div>

                <input
                  type="number"
                  step={rentChangeMode === "percent" ? "1" : "50"}
                  value={rentChange}
                  onChange={(e) => setRentChange(e.target.value)}
                  style={input}
                />

                <div
                  style={{
                    color: "#777b8c",
                    fontSize: 11,
                    marginTop: 5,
                  }}
                >
                  {rentChangeMode === "percent"
                    ? "Increase or decrease by percentage"
                    : "Increase or decrease by a fixed monthly amount"}
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      color: "#d9dae0",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    Maintenance change
                  </span>

                  <div
                    style={{
                      display: "flex",
                      border: "1px solid #292e3d",
                      borderRadius: 9,
                      overflow: "hidden",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setExpenseChangeMode("percent")}
                      style={{
                        border: 0,
                        padding: "5px 9px",
                        background:
                          expenseChangeMode === "percent"
                            ? "#252d40"
                            : "transparent",
                        color:
                          expenseChangeMode === "percent"
                            ? "#fff"
                            : "#858998",
                        cursor: "pointer",
                        fontSize: 11,
                      }}
                    >
                      %
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpenseChangeMode("fixed")}
                      style={{
                        border: 0,
                        padding: "5px 9px",
                        background:
                          expenseChangeMode === "fixed"
                            ? "#252d40"
                            : "transparent",
                        color:
                          expenseChangeMode === "fixed"
                            ? "#fff"
                            : "#858998",
                        cursor: "pointer",
                        fontSize: 11,
                      }}
                    >
                      RM
                    </button>
                  </div>
                </div>

                <input
                  type="number"
                  step={expenseChangeMode === "percent" ? "1" : "50"}
                  value={expenseChange}
                  onChange={(e) => setExpenseChange(e.target.value)}
                  style={input}
                />

                <div
                  style={{
                    color: "#777b8c",
                    fontSize: 11,
                    marginTop: 5,
                  }}
                >
                  {expenseChangeMode === "percent"
                    ? "Increase or decrease by percentage"
                    : "Increase or decrease by a fixed monthly amount"}
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      color: "#d9dae0",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    Interest-rate change
                  </span>

                  <div
                    style={{
                      display: "flex",
                      border: "1px solid #292e3d",
                      borderRadius: 9,
                      overflow: "hidden",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setRateChangeMode("points")}
                      style={{
                        border: 0,
                        padding: "5px 9px",
                        background:
                          rateChangeMode === "points"
                            ? "#252d40"
                            : "transparent",
                        color:
                          rateChangeMode === "points"
                            ? "#fff"
                            : "#858998",
                        cursor: "pointer",
                        fontSize: 11,
                      }}
                    >
                      Points
                    </button>
                    <button
                      type="button"
                      onClick={() => setRateChangeMode("fixed")}
                      style={{
                        border: 0,
                        padding: "5px 9px",
                        background:
                          rateChangeMode === "fixed"
                            ? "#252d40"
                            : "transparent",
                        color:
                          rateChangeMode === "fixed"
                            ? "#fff"
                            : "#858998",
                        cursor: "pointer",
                        fontSize: 11,
                      }}
                    >
                      %
                    </button>
                  </div>
                </div>

                <input
                  type="number"
                  step="0.1"
                  value={rateChange}
                  onChange={(e) => setRateChange(e.target.value)}
                  style={input}
                />

                <div
                  style={{
                    color: "#777b8c",
                    fontSize: 11,
                    marginTop: 5,
                  }}
                >
                  {rateChangeMode === "points"
                    ? "Example: +1 means the rate rises from 4.2% to 5.2%"
                    : "Increase or decrease the current rate by percentage"}
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      color: "#d9dae0",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    Property-value change
                  </span>

                  <div
                    style={{
                      display: "flex",
                      border: "1px solid #292e3d",
                      borderRadius: 9,
                      overflow: "hidden",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setValueChangeMode("percent")}
                      style={{
                        border: 0,
                        padding: "5px 9px",
                        background:
                          valueChangeMode === "percent"
                            ? "#252d40"
                            : "transparent",
                        color:
                          valueChangeMode === "percent"
                            ? "#fff"
                            : "#858998",
                        cursor: "pointer",
                        fontSize: 11,
                      }}
                    >
                      %
                    </button>
                    <button
                      type="button"
                      onClick={() => setValueChangeMode("fixed")}
                      style={{
                        border: 0,
                        padding: "5px 9px",
                        background:
                          valueChangeMode === "fixed"
                            ? "#252d40"
                            : "transparent",
                        color:
                          valueChangeMode === "fixed"
                            ? "#fff"
                            : "#858998",
                        cursor: "pointer",
                        fontSize: 11,
                      }}
                    >
                      RM
                    </button>
                  </div>
                </div>

                <input
                  type="number"
                  step={valueChangeMode === "percent" ? "1" : "5000"}
                  value={valueChange}
                  onChange={(e) => setValueChange(e.target.value)}
                  style={input}
                />

                <div
                  style={{
                    color: "#777b8c",
                    fontSize: 11,
                    marginTop: 5,
                  }}
                >
                  {valueChangeMode === "percent"
                    ? "Increase or decrease by percentage"
                    : "Increase or decrease by a fixed amount"}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 10,
                marginTop: 22,
              }}
            >
              <Metric label="Adjusted rent" value={money(whatIf.rent)} />
              <Metric
                label="Scheduled loan payment"
                value={money(whatIf.scheduledPayment)}
                note={
                  whatIf.adjustedRate === loanRate
                    ? "Uses the current Aequitas instalment"
                    : `Estimated at ${whatIf.adjustedRate.toFixed(2)}%`
                }
              />
              <Metric
                label="Total monthly loan outflow"
                value={money(whatIf.totalLoanPayment)}
                note={
                  whatIf.extraRepayment > 0
                    ? `Includes ${money(whatIf.extraRepayment)} extra repayment`
                    : "No extra repayment"
                }
              />
              <Metric
                label="Adjusted cashflow"
                value={money(whatIf.cashflow)}
                note={`Change: ${money(whatIf.cashflowChange)}`}
              />
              <Metric
                label="Adjusted property value"
                value={money(whatIf.value)}
              />
              <Metric
                label="Loan balance after 12 months"
                value={money(whatIf.scenarioLoanBalanceAfter12Months)}
                note={`Current path: ${money(
                  whatIf.baselineLoanBalanceAfter12Months
                )}`}
              />
              <Metric
                label="Projected equity after 12 months"
                value={money(whatIf.equity)}
                note="Scenario property value − projected loan balance"
              />
              <Metric
                label="Extra loan balance reduction"
                value={money(whatIf.loanBalanceReductionAfter12Months)}
                note="Compared with current-payment path"
              />
            </div>

            <div
              style={{
                marginTop: 18,
                padding: 15,
                borderRadius: 13,
                background: "#15151e",
                color: "#9296a7",
                fontSize: 13,
                lineHeight: 1.55,
              }}
            >
              <strong style={{ color: "#d5d6dc" }}>
                What changed?
              </strong>{" "}
              Monthly cashflow moves from{" "}
              <strong style={{ color: "#fff" }}>
                {money(data.cashflow)}
              </strong>{" "}
              to{" "}
              <strong style={{ color: "#fff" }}>
                {money(whatIf.cashflow)}
              </strong>
              . Loan outflow is{" "}
              <strong style={{ color: "#fff" }}>
                {money(whatIf.totalLoanPayment)}
              </strong>
              {whatIf.extraRepayment > 0
                ? `, including ${money(whatIf.extraRepayment)} extra repayment`
                : ""}.
              The loan balance is projected for the next 12 months:
              <strong style={{ color: "#fff" }}>
                {" "}{money(whatIf.scenarioLoanBalanceAfter12Months)}
              </strong>{" "}
              under this scenario versus{" "}
              <strong style={{ color: "#fff" }}>
                {money(whatIf.baselineLoanBalanceAfter12Months)}
              </strong>{" "}
              on the current-payment path. Projected equity then uses the
              scenario property value minus that projected balance.
            </div>
          </>
        )}

        {mode === "sell" && (
          <>
            <p
              style={{
                color: "#9296a7",
                marginTop: 22,
                marginBottom: 7,
                fontSize: 13,
              }}
            >
              Start with an estimated sale price. You can change it to test
              different outcomes.
            </p>

            <input
              type="number"
              min="0"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              style={input}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(190px, 1fr))",
                gap: 10,
                marginTop: 18,
              }}
            >
              <Metric
                label="Outstanding loan"
                value={money(data.loan)}
              />
              <Metric
                label="Gross equity after loan"
                value={money(sell.equity)}
              />
              <Metric
                label="Sale price vs purchase"
                value={money(sell.difference)}
              />
            </div>

            <div
              style={{
                marginTop: 18,
                padding: 15,
                borderRadius: 13,
                background: "#15151e",
                color: "#858998",
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              Gross equity only. Agent fees, legal costs, taxes and other
              selling costs are not included yet.
            </div>
          </>
        )}
      </section>

      <ScenarioSummary
        data={data}
        whatIf={whatIf}
        loan={{
          extraRepayment: num(extraRepayment),
          lumpSum: num(lumpSum),
        }}
        rentChange={rentChange}
        rentChangeMode={rentChangeMode}
        expenseChange={expenseChange}
        expenseChangeMode={expenseChangeMode}
        rateChange={rateChange}
        rateChangeMode={rateChangeMode}
        valueChange={valueChange}
        valueChangeMode={valueChangeMode}
      />

      <div
        style={{
          padding: 17,
          borderRadius: 14,
          background: "#101017",
          border: "1px solid #222735",
          color: "#858998",
          fontSize: 12,
          lineHeight: 1.55,
        }}
      >
        <strong style={{ color: "#d3d4da" }}>
          Aequitas approach:
        </strong>{" "}
        understand the current position first, investigate scenarios second,
        then use Advisor to interpret what the numbers may mean. Decision Lab
        does not automatically recommend buying, selling, holding or
        refinancing.
      </div>
    </div>
  );
}
