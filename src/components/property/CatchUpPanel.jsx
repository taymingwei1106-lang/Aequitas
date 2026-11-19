import { useState } from "react";

import MoneyInput from "../MoneyInput";
import { saveMonthlyCheckin } from "../../services/monthlyCheckinStorage";

/*
 * Catch up several missed months in one go.
 *
 * Rent, instalment and maintenance start from the last recorded month (the
 * investor changes what was different); other expenses and the loan balance
 * start blank, because copying them would invent figures. Months can be
 * left out and recorded later.
 */

function formatMonth(month, style = "long") {
  const [year, m] = month.split("-");
  return new Date(Number(year), Number(m) - 1, 1).toLocaleDateString("en-MY", { month: style, year: "numeric" });
}

export default function CatchUpPanel({ property, months, lastRecorded, rentDue, onDone, onCancel }) {
  const [rows, setRows] = useState(() =>
    months.map((month) => ({
      month,
      include: true,
      rentalReceived: lastRecorded?.rentalReceived ?? property?.monthlyRental ?? "",
      loanInstalment: lastRecorded?.loanInstalment ?? property?.monthlyInstalment ?? "",
      maintenancePaid: lastRecorded?.maintenancePaid ?? property?.maintenanceFee ?? "",
      otherExpenses: "",
      outstandingLoan: "",
    }))
  );
  const [error, setError] = useState("");

  const set = (index, field) => (value) =>
    setRows((list) => list.map((row, i) => (i === index ? { ...row, [field]: value } : row)));

  const chosen = rows.filter((row) => row.include);

  function save() {
    setError("");
    try {
      chosen.forEach((row) =>
        saveMonthlyCheckin({
          propertyId: property.id,
          month: row.month,
          rentalReceived: row.rentalReceived,
          loanInstalment: row.loanInstalment,
          maintenancePaid: row.maintenancePaid,
          otherExpenses: row.otherExpenses,
          outstandingLoan: row.outstandingLoan,
          marketValue: "",
          note: "",
          rentDue,
          rentTiming: "",
          rentReceivedOn: "",
        })
      );
      onDone(chosen.length);
    } catch (e) {
      setError(e?.message || "The months couldn't be saved.");
    }
  }

  return (
    <div
      style={{
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        border: "1px solid var(--color-primary)",
        background: "var(--color-primary-soft)",
        display: "grid",
        gap: 14,
      }}
    >
      <div>
        <strong>Catch up {months.length} months</strong>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 4, lineHeight: 1.5 }}>
          Filled from {lastRecorded ? formatMonth(lastRecorded.month) : "the property record"}: change only what was
          different. Add a loan balance for any month you have one for; untick a month to leave it for later.
        </div>
      </div>

      {rows.map((row, index) => (
        <div
          key={row.month}
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            opacity: row.include ? 1 : 0.55,
            display: "grid",
            gap: 10,
          }}
        >
          <label style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 700, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={row.include}
              onChange={(e) => set(index, "include")(e.target.checked)}
              style={{ width: 18, height: 18 }}
            />
            {formatMonth(row.month)}
          </label>
          {row.include && (
            <div className="catchup-grid">
              <MoneyInput label="Rent received" value={row.rentalReceived} onChange={set(index, "rentalReceived")} />
              <MoneyInput label="Instalment" value={row.loanInstalment} onChange={set(index, "loanInstalment")} />
              <MoneyInput label="Maintenance" value={row.maintenancePaid} onChange={set(index, "maintenancePaid")} />
              <MoneyInput label="Other" value={row.otherExpenses} onChange={set(index, "otherExpenses")} />
              <MoneyInput label="Loan balance" value={row.outstandingLoan} onChange={set(index, "outstandingLoan")} />
            </div>
          )}
        </div>
      ))}

      {error && <div style={{ fontSize: 13, color: "var(--color-danger)" }}>{error}</div>}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          className="primary-button"
          style={{ width: "auto" }}
          onClick={save}
          disabled={chosen.length === 0}
        >
          Save {chosen.length} month{chosen.length === 1 ? "" : "s"}
        </button>
        <button
          type="button"
          className="btn-secondary"
          style={{ padding: "12px 16px", borderRadius: 14, fontWeight: 600, cursor: "pointer" }}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
