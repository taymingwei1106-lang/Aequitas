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
      ? "#22C55E"
      : status === "attention"
      ? "#F59E0B"
      : "#CBD5E1";

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
        background: "#171a22",
        border: "1px solid #303544",
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
  }, [property?.id]);

  /*
   * We intentionally use the exact same storage reader
   * used by MonthlyCheckinCard. This guarantees that the
   * Performance card sees the same July/August/September
   * records the investor sees in Check-in History.
   */

  if (checkins.length === 0) {
    return (
      <div
        className="card"
        style={{ marginTop: 24 }}
      >
        <p
          className="page-subtitle"
          style={{ marginBottom: 6 }}
        >
          PERFORMANCE INTELLIGENCE
        </p>

        <h3 style={{ marginTop: 0 }}>
          📈 3-Month Performance
        </h3>

        <p className="page-subtitle">
          No monthly check-ins have been recorded
          yet. Add your first check-in to start
          building an investment performance history.
        </p>
      </div>
    );
  }

  if (checkins.length < 3) {
    return (
      <div
        className="card"
        style={{ marginTop: 24 }}
      >
        <p
          className="page-subtitle"
          style={{ marginBottom: 6 }}
        >
          PERFORMANCE INTELLIGENCE
        </p>

        <h3 style={{ marginTop: 0 }}>
          📈 3-Month Performance
        </h3>

        <div
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 12,
            background: "#171a22",
            border: "1px solid #303544",
          }}
        >
          <strong>
            {checkins.length} of 3 months recorded
          </strong>

          <p
            className="page-subtitle"
            style={{
              marginBottom: 0,
              marginTop: 7,
              lineHeight: 1.55,
            }}
          >
            Aequitas needs one more monthly check-in
            before it forms a meaningful 3-month
            performance assessment.
          </p>

          <div
            style={{
              marginTop: 12,
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {checkins.map((item) => (
              <span
                key={item.id}
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "#263044",
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

  const cashflowChange =
    latestCashflow - oldestCashflow;

  const rentalChange =
    number(latest.rentalReceived) -
    number(oldest.rentalReceived);

  const loanChange =
    number(latest.outstandingLoan) -
    number(oldest.outstandingLoan);

  const latestExpenses =
    number(latest.maintenancePaid) +
    number(latest.otherExpenses);

  const oldestExpenses =
    number(oldest.maintenancePaid) +
    number(oldest.otherExpenses);

  const expenseChange =
    latestExpenses - oldestExpenses;

  const marketValueAvailable =
    hasValue(latest.marketValue) &&
    hasValue(oldest.marketValue);

  const marketValueChange =
    marketValueAvailable
      ? number(latest.marketValue) -
        number(oldest.marketValue)
      : 0;

  const cashflowStatus =
    cashflowChange > 0
      ? "improving"
      : cashflowChange < 0
      ? "attention"
      : "stable";

  const rentalStatus =
    rentalChange > 0
      ? "improving"
      : rentalChange < 0
      ? "attention"
      : "stable";

  /*
   * For debt and expenses, falling is generally
   * the favourable direction.
   */
  const loanStatus =
    loanChange < 0
      ? "improving"
      : loanChange > 0
      ? "attention"
      : "stable";

  const expenseStatus =
    expenseChange < 0
      ? "improving"
      : expenseChange > 0
      ? "attention"
      : "stable";

  const marketValueStatus =
    !marketValueAvailable
      ? "stable"
      : marketValueChange > 0
      ? "improving"
      : marketValueChange < 0
      ? "attention"
      : "stable";

  const positiveSignals = [
    cashflowStatus,
    rentalStatus,
    loanStatus,
    expenseStatus,
    marketValueStatus,
  ].filter(
    (status) => status === "improving"
  ).length;

  const attentionSignals = [
    cashflowStatus,
    rentalStatus,
    loanStatus,
    expenseStatus,
    marketValueStatus,
  ].filter(
    (status) => status === "attention"
  ).length;

  let overallStatus = "stable";

  if (
    positiveSignals >= 3 &&
    positiveSignals > attentionSignals
  ) {
    overallStatus = "improving";
  } else if (
    attentionSignals >= 3 &&
    attentionSignals > positiveSignals
  ) {
    overallStatus = "attention";
  }

  let interpretation;

  if (overallStatus === "improving") {
    interpretation =
      "The investment is showing an improving overall position across the three latest recorded months.";
  } else if (overallStatus === "attention") {
    interpretation =
      "The investment has several areas moving in an unfavourable direction. This does not automatically mean action is required, but the changes deserve review.";
  } else {
    interpretation =
      "The investment is broadly stable across the three latest recorded months. There is not yet a strong reason to change strategy based on this trend alone.";
  }

  if (
    cashflowChange > 0 &&
    Math.abs(rentalChange) <
      Math.max(
        50,
        number(oldest.rentalReceived) * 0.05
      )
  ) {
    interpretation +=
      " Cashflow improved while rental income remained broadly stable, suggesting that expense or financing movements are contributing to the change.";
  }

  return (
    <div
      className="card"
      style={{
        marginTop: 24,
        border:
          overallStatus === "improving"
            ? "1px solid #2563EB"
            : undefined,
      }}
    >
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
          <p
            className="page-subtitle"
            style={{ marginBottom: 6 }}
          >
            PERFORMANCE INTELLIGENCE
          </p>

          <h3
            style={{
              marginTop: 0,
              marginBottom: 8,
            }}
          >
            📈 3-Month Performance
          </h3>

          <p
            className="page-subtitle"
            style={{
              margin: 0,
              lineHeight: 1.55,
              maxWidth: 650,
            }}
          >
            Aequitas compares your three latest
            recorded months to identify meaningful
            changes in how this investment is
            performing.
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <div className="page-subtitle">
            Overall trend
          </div>

          <strong
            style={{
              color:
                overallStatus === "improving"
                  ? "#22C55E"
                  : overallStatus === "attention"
                  ? "#F59E0B"
                  : "#CBD5E1",
              fontSize: 20,
            }}
          >
            {overallStatus === "improving"
              ? "Improving"
              : overallStatus === "attention"
              ? "Needs attention"
              : "Stable"}
          </strong>
        </div>
      </div>

      <div
        style={{
          marginTop: 20,
          padding: 16,
          borderRadius: 12,
          background: "#171a22",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div className="page-subtitle">
              Period reviewed
            </div>

            <strong>
              {monthLabel(oldest.month)}
              {" → "}
              {monthLabel(latest.month)}
            </strong>
          </div>

          <div>
            <div className="page-subtitle">
              Cashflow movement
            </div>

            <strong
              style={{
                color:
                  cashflowChange >= 0
                    ? "#22C55E"
                    : "#F59E0B",
              }}
            >
              {signedCurrency(cashflowChange)}
            </strong>
          </div>

          <div>
            <div className="page-subtitle">
              Latest monthly cashflow
            </div>

            <strong
              style={{
                color:
                  latestCashflow >= 0
                    ? "#22C55E"
                    : "#EF4444",
              }}
            >
              {currency(latestCashflow)}
            </strong>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(180px,1fr))",
          gap: 12,
          marginTop: 16,
        }}
      >
        <TrendItem
          label="Rental income"
          status={rentalStatus}
          detail={
            rentalChange === 0
              ? "No change"
              : `${signedCurrency(
                  rentalChange
                )} over the period`
          }
        />

        <TrendItem
          label="Loan balance"
          status={loanStatus}
          detail={
            loanChange === 0
              ? "No change"
              : loanChange < 0
              ? `${currency(
                  Math.abs(loanChange)
                )} reduced`
              : `${currency(
                  loanChange
                )} increased`
          }
        />

        <TrendItem
          label="Maintenance & expenses"
          status={expenseStatus}
          detail={
            expenseChange === 0
              ? "No change"
              : expenseChange < 0
              ? `${currency(
                  Math.abs(expenseChange)
                )} lower`
              : `${currency(
                  expenseChange
                )} higher`
          }
        />

        <TrendItem
          label="Market value"
          status={marketValueStatus}
          detail={
            !marketValueAvailable
              ? "Not enough valuation data"
              : marketValueChange === 0
              ? "No change"
              : `${signedCurrency(
                  marketValueChange
                )} over the period`
          }
        />
      </div>

      <div
        style={{
          marginTop: 18,
          padding: 16,
          borderRadius: 12,
          background: "#1e293b",
        }}
      >
        <strong>
          💡 What this means
        </strong>

        <p
          style={{
            marginBottom: 0,
            lineHeight: 1.6,
          }}
        >
          {interpretation}
        </p>
      </div>

      <p
        className="page-subtitle"
        style={{
          marginTop: 14,
          marginBottom: 0,
          fontSize: 12,
        }}
      >
        Based only on your recorded monthly
        check-ins. This trend describes performance;
        it does not automatically mean you should
        buy, sell or refinance.
      </p>
    </div>
  );
}
