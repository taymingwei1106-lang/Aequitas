import { useMemo } from "react";
import { getMonthlyCheckins } from "../../services/monthlyCheckinStorage";

function number(value) {
  return Number(value) || 0;
}

function hasValue(value) {
  return value !== "" && value !== null && value !== undefined;
}

function currency(value) {
  const amount = number(value);

  return `RM ${amount.toLocaleString("en-MY", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function signedCurrency(value) {
  const amount = number(value);

  if (amount > 0) return `+${currency(amount)}`;
  if (amount < 0) return `-${currency(Math.abs(amount))}`;

  return currency(0);
}

function monthLabel(month) {
  if (!month) return "";

  const [year, monthNumber] = String(month).split("-");

  return new Date(
    Number(year),
    Number(monthNumber) - 1,
    1
  ).toLocaleDateString("en-MY", {
    month: "short",
    year: "numeric",
  });
}

function cashflow(item) {
  return (
    number(item?.rentalReceived) -
    number(item?.loanInstalment) -
    number(item?.maintenancePaid) -
    number(item?.otherExpenses)
  );
}

function TrendItem({
  label,
  status,
  detail,
}) {
  const color =
    status === "improving"
      ? "var(--color-success)"
      : status === "attention"
      ? "var(--color-warning)"
      : "var(--color-text-secondary)";

  const title =
    status === "improving"
      ? "Improving"
      : status === "attention"
      ? "Needs attention"
      : "Stable";

  return (
    <div
      style={{
        padding: 14,
        borderRadius: 10,
        background: "var(--color-surface)",
        border: "1px solid var(--color-border-strong)",
      }}
    >
      <div
        className="page-subtitle"
        style={{ marginBottom: 6 }}
      >
        {label}
      </div>

      <strong
        style={{
          color,
          fontSize: 14,
        }}
      >
        {title}
      </strong>

      <div
        className="page-subtitle"
        style={{
          marginTop: 5,
          fontSize: 12,
        }}
      >
        {detail}
      </div>
    </div>
  );
}

export default function PerformanceTrendCard({
  property,
}) {
  const checkins = useMemo(() => {
    if (!property?.id) return [];

    return getMonthlyCheckins(property.id);
  }, [property]); // re-read after a check-in is saved (property object is refreshed)

  if (checkins.length === 0) {
    return (
      <div className="card" style={{ marginTop: 24 }}>
        <p className="page-subtitle" style={{ marginBottom: 6 }}>
          PERFORMANCE INTELLIGENCE
        </p>
        <h3 style={{ marginTop: 0 }}>📈 Performance</h3>
        <p className="page-subtitle">
          No monthly check-ins have been recorded yet. Add your first check-in
          to start building an investment performance history.
        </p>
      </div>
    );
  }

  if (checkins.length < 3) {
    return (
      <div className="card" style={{ marginTop: 24 }}>
        <p className="page-subtitle" style={{ marginBottom: 6 }}>
          PERFORMANCE INTELLIGENCE
        </p>
        <h3 style={{ marginTop: 0 }}>📈 Building performance history</h3>
        <div
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 12,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border-strong)",
          }}
        >
          <strong>{checkins.length} of 3 months recorded</strong>
          <p className="page-subtitle" style={{ marginBottom: 0, marginTop: 7, lineHeight: 1.55 }}>
            Aequitas needs one more monthly check-in before it forms a meaningful
            3-month performance assessment.
          </p>
          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {checkins.map((item) => (
              <span
                key={item.id}
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "var(--color-surface-elevated)",
                  fontSize: 12,
                }}
              >
                ✓ {monthLabel(item.month)}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const latest = checkins[0];
  const oldest = checkins[2];

  const latestCashflow = cashflow(latest);
  const oldestCashflow = cashflow(oldest);
  const cashflowChange = latestCashflow - oldestCashflow;

  const rentalChange =
    number(latest.rentalReceived) - number(oldest.rentalReceived);

  const loanChange =
    number(latest.outstandingLoan) - number(oldest.outstandingLoan);

  const latestExpenses =
    number(latest.maintenancePaid) + number(latest.otherExpenses);
  const oldestExpenses =
    number(oldest.maintenancePaid) + number(oldest.otherExpenses);
  const expenseChange = latestExpenses - oldestExpenses;

  const marketValueAvailable =
    hasValue(latest.marketValue) && hasValue(oldest.marketValue);
  const marketValueChange = marketValueAvailable
    ? number(latest.marketValue) - number(oldest.marketValue)
    : 0;

  const cashflowStatus =
    cashflowChange > 0 ? "improving" : cashflowChange < 0 ? "attention" : "stable";
  const rentalStatus =
    rentalChange > 0 ? "improving" : rentalChange < 0 ? "attention" : "stable";
  const loanStatus =
    loanChange < 0 ? "improving" : loanChange > 0 ? "attention" : "stable";
  const expenseStatus =
    expenseChange < 0 ? "improving" : expenseChange > 0 ? "attention" : "stable";
  const marketValueStatus = !marketValueAvailable
    ? "stable"
    : marketValueChange > 0
    ? "improving"
    : marketValueChange < 0
    ? "attention"
    : "stable";

  const signals = [cashflowStatus, rentalStatus, loanStatus, expenseStatus, marketValueStatus];
  const positiveSignals = signals.filter((status) => status === "improving").length;
  const attentionSignals = signals.filter((status) => status === "attention").length;

  let overallStatus = "stable";
  if (positiveSignals >= 3 && positiveSignals > attentionSignals) {
    overallStatus = "improving";
  } else if (attentionSignals >= 3 && attentionSignals > positiveSignals) {
    overallStatus = "attention";
  }

  const statusMeta = {
    improving: { label: "Improving", color: "var(--color-success)" },
    attention: { label: "Needs attention", color: "var(--color-warning)" },
    stable: { label: "Stable", color: "var(--color-text)" },
  }[overallStatus];

  let interpretation;
  if (overallStatus === "improving") {
    interpretation =
      "The investment is showing an improving overall position across the three latest recorded months.";
  } else if (overallStatus === "attention") {
    interpretation =
      "Several areas are moving in an unfavourable direction. This does not automatically mean action is required, but the changes deserve review.";
  } else {
    interpretation =
      "The investment is broadly stable across the three latest recorded months. There is not yet a strong reason to change strategy based on this trend alone.";
  }

  if (
    cashflowChange > 0 &&
    Math.abs(rentalChange) < Math.max(50, number(oldest.rentalReceived) * 0.05)
  ) {
    interpretation +=
      " Cashflow improved while rental income remained broadly stable, suggesting that expense or financing movements are contributing to the change.";
  }

  const movementItems = [
    {
      label: "Rental income",
      status: rentalStatus,
      detail:
        rentalChange === 0
          ? "No change"
          : `${signedCurrency(rentalChange)} over the period`,
    },
    {
      label: "Loan balance",
      status: loanStatus,
      detail:
        loanChange === 0
          ? "No change"
          : loanChange < 0
          ? `${currency(Math.abs(loanChange))} reduced`
          : `${currency(loanChange)} increased`,
    },
    {
      label: "Maintenance & expenses",
      status: expenseStatus,
      detail:
        expenseChange === 0
          ? "No change"
          : expenseChange < 0
          ? `${currency(Math.abs(expenseChange))} lower`
          : `${currency(expenseChange)} higher`,
    },
    {
      label: "Market value",
      status: marketValueStatus,
      detail: !marketValueAvailable
        ? "Not enough valuation data"
        : marketValueChange === 0
        ? "No change"
        : `${signedCurrency(marketValueChange)} over the period`,
    },
  ];

  return (
    <div className="card" style={{ marginTop: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <p className="page-subtitle" style={{ marginBottom: 6 }}>
            PERFORMANCE INTELLIGENCE
          </p>
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>📈 What is changing?</h3>
          <p className="page-subtitle" style={{ margin: 0, lineHeight: 1.55, maxWidth: 650 }}>
            Aequitas compares your three latest recorded months to show the
            investment result first, then the movements driving it.
          </p>
        </div>

        <div
          style={{
            minWidth: 130,
            padding: "12px 14px",
            borderRadius: 12,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border-strong)",
          }}
        >
          <div className="page-subtitle">Overall trend</div>
          <strong style={{ color: statusMeta.color, fontSize: 18 }}>
            {statusMeta.label}
          </strong>
        </div>
      </div>

      <div
        style={{
          marginTop: 20,
          padding: 18,
          borderRadius: 14,
          background: "var(--color-surface)",
          border: "1px solid var(--color-border-strong)",
        }}
      >
        <div className="page-subtitle">KEY RESULT</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
            gap: 18,
            marginTop: 8,
          }}
        >
          <div>
            <div className="page-subtitle">Latest monthly cashflow</div>
            <strong
              style={{
                fontSize: 26,
                color: latestCashflow >= 0 ? "var(--color-success)" : "var(--color-danger)",
              }}
            >
              {currency(latestCashflow)}
            </strong>
          </div>
          <div>
            <div className="page-subtitle">Change over 3 months</div>
            <strong
              style={{
                fontSize: 20,
                color: cashflowChange >= 0 ? "var(--color-success)" : "var(--color-warning)",
              }}
            >
              {signedCurrency(cashflowChange)}
            </strong>
          </div>
          <div>
            <div className="page-subtitle">Period reviewed</div>
            <strong>
              {monthLabel(oldest.month)} → {monthLabel(latest.month)}
            </strong>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <div className="page-subtitle" style={{ marginBottom: 10 }}>
          WHAT CHANGED
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 10,
          }}
        >
          {movementItems.map((item) => (
            <div
              key={item.label}
              style={{
                padding: 14,
                borderRadius: 10,
                background: "var(--color-surface)",
                border: "1px solid var(--color-border-strong)",
              }}
            >
              <div className="page-subtitle" style={{ marginBottom: 6 }}>
                {item.label}
              </div>
              <strong
                style={{
                  color:
                    item.status === "improving"
                      ? "var(--color-success)"
                      : item.status === "attention"
                      ? "var(--color-warning)"
                      : "var(--color-text)",
                  fontSize: 14,
                }}
              >
                {item.status === "improving"
                  ? "Improving"
                  : item.status === "attention"
                  ? "Needs attention"
                  : "Stable"}
              </strong>
              <div className="page-subtitle" style={{ marginTop: 5, fontSize: 12 }}>
                {item.detail}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: 20,
          padding: 16,
          borderRadius: 12,
          background: "var(--color-surface-elevated)",
        }}
      >
        <div className="page-subtitle" style={{ marginBottom: 6 }}>
          WHY THIS MATTERS
        </div>
        <strong>{statusMeta.label}</strong>
        <p style={{ marginBottom: 0, lineHeight: 1.6 }}>
          {interpretation}
        </p>
      </div>

      <p
        className="page-subtitle"
        style={{ marginTop: 14, marginBottom: 0, fontSize: 12 }}
      >
        Based only on your recorded monthly check-ins. This describes performance
        and movement; it does not automatically mean you should buy, sell or refinance.
      </p>
    </div>
  );
}
