import { useState } from "react";

import MoneyInput from "../MoneyInput";
import { rentStatus } from "../../utils/rentLedger";
import { toAmount } from "../../utils/propertyFinancials";

/*
 * Under "Rent received" in the monthly check-in: what was due, whether it
 * was paid in full, on time or late, and what the tenant owes overall.
 * Shows one line by default; the details open only when needed.
 */

const STATE_COLOR = {
  positive: "var(--color-success)",
  caution: "var(--color-warning)",
  negative: "var(--color-danger)",
  neutral: "var(--color-text-secondary)",
};

function currency(value) {
  const number = Number(value) || 0;
  const decimals = Number.isInteger(Math.round(number * 100) / 100) ? 0 : 2;
  return `RM ${number.toLocaleString("en-MY", { minimumFractionDigits: decimals, maximumFractionDigits: 2 })}`;
}

const chip = (active) => ({
  padding: "6px 12px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  border: `1px solid ${active ? "var(--color-primary)" : "var(--color-border-strong)"}`,
  background: active ? "var(--color-primary-soft)" : "transparent",
  color: "var(--color-text)",
});

const linkButton = {
  background: "none",
  border: "none",
  padding: 0,
  color: "var(--color-link)",
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
};

export default function RentTracking({ form, setField, arrears, dueSource }) {
  const [editingDue, setEditingDue] = useState(false);
  const due = toAmount(form.rentDue);
  const status = rentStatus(form);
  const received = toAmount(form.rentalReceived) ?? 0;

  if (due === null && !editingDue) {
    return (
      <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
        Rent due isn&apos;t tracked for this month.{" "}
        <button type="button" style={linkButton} onClick={() => setEditingDue(true)}>
          Track it
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {editingDue ? (
        <div style={{ display: "grid", gap: 6 }}>
          <MoneyInput
            label="Rent due this month"
            value={form.rentDue}
            onChange={setField("rentDue")}
            hint="Enter 0 if the unit was vacant"
          />
          <button type="button" style={{ ...linkButton, justifySelf: "start" }} onClick={() => setEditingDue(false)}>
            Done
          </button>
        </div>
      ) : (
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
          Due {currency(due)}
          {dueSource ? ` (${dueSource})` : ""}.{" "}
          <span style={{ fontWeight: 700, color: STATE_COLOR[status.tone] }}>{status.label}.</span>{" "}
          <button type="button" style={linkButton} onClick={() => setEditingDue(true)}>
            Change
          </button>
        </div>
      )}

      {received > 0 && due !== 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "var(--color-text-secondary)", marginRight: 2 }}>Arrived</span>
          <button
            type="button"
            style={chip(form.rentTiming === "on-time")}
            aria-pressed={form.rentTiming === "on-time"}
            onClick={() => setField("rentTiming")(form.rentTiming === "on-time" ? "" : "on-time")}
          >
            On time
          </button>
          <button
            type="button"
            style={chip(form.rentTiming === "late")}
            aria-pressed={form.rentTiming === "late"}
            onClick={() => setField("rentTiming")(form.rentTiming === "late" ? "" : "late")}
          >
            Late
          </button>
          {form.rentTiming === "late" && (
            <input
              type="date"
              value={form.rentReceivedOn}
              onChange={(e) => setField("rentReceivedOn")(e.target.value)}
              aria-label="Date the rent arrived"
              style={{ width: "auto", padding: "6px 10px", fontSize: 13 }}
            />
          )}
        </div>
      )}

      {arrears.owed > 0 && (
        <div
          style={{
            padding: "8px 10px",
            borderRadius: 8,
            fontSize: 13,
            background: "var(--color-warning-soft, rgba(245,158,11,0.12))",
            color: "var(--color-warning)",
            fontWeight: 600,
          }}
        >
          Tenant owes {currency(arrears.owed)} in total{arrears.sinceLabel ? `, since ${arrears.sinceLabel}` : ""}. Record
          catch-up payments as rent received in the month they arrive.
        </div>
      )}
    </div>
  );
}
