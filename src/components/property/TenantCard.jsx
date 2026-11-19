import { useState } from "react";

import MoneyInput from "../MoneyInput";
import StatusPill from "../StatusPill";
import useFiles from "../../hooks/useFiles";
import { daysUntil, formatDate, getDocuments } from "../../utils/documents";
import { rentArrears } from "../../utils/rentLedger";
import { getMonthlyCheckins } from "../../services/monthlyCheckinStorage";
import { formatRM, toAmount } from "../../utils/propertyFinancials";
import {
  DEPOSIT_FIELDS,
  addDaysIso,
  addYearsIso,
  closeTenancy,
  depositMonths,
  depositTotal,
  getCurrentTenancy,
  getTenancies,
  newTenancyId,
  renewTenancy,
  saveTenancy,
} from "../../utils/tenancies";

/*
 * Tenant — who is renting, the tenancy period, rent and deposits held,
 * and past tenancies with how each deposit was settled.
 */

const smallButton = {
  padding: "9px 14px",
  borderRadius: 10,
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
};

const HELD_BY = [
  ["", "Not recorded"],
  ["me", "Me"],
  ["agent", "My agent"],
];

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function Field({ label, children, hint }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{label}</span>
      {children}
      {hint && <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{hint}</span>}
    </label>
  );
}

function monthsHint(value, rent) {
  const months = depositMonths(value, rent);
  return months === null ? undefined : `${months} month${months === 1 ? "" : "s"} of rent`;
}

function TenancyForm({ initial, title, submitLabel, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const setText = (key) => (event) => set(key)(event.target.value);

  function submit(event) {
    event.preventDefault();
    if (!form.tenantName.trim()) return setError("Enter the tenant's name.");
    if (!form.startDate) return setError("Enter the tenancy start date.");
    if (form.endDate && form.endDate < form.startDate) return setError("The end date is before the start date.");
    setError("");
    onSubmit({ ...form, tenantName: form.tenantName.trim() });
  }

  const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 };

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 14, marginTop: 14 }}>
      <strong>{title}</strong>
      <div style={grid}>
        <Field label="Tenant name *">
          <input value={form.tenantName} onChange={setText("tenantName")} autoComplete="off" />
        </Field>
        <Field label="Phone">
          <input type="tel" value={form.phone} onChange={setText("phone")} autoComplete="off" />
        </Field>
        <Field label="Email">
          <input type="email" value={form.email} onChange={setText("email")} autoComplete="off" />
        </Field>
      </div>
      <div style={grid}>
        <Field label="Start date *">
          <input type="date" value={form.startDate} onChange={setText("startDate")} />
        </Field>
        <Field label="End date">
          <input type="date" value={form.endDate} onChange={setText("endDate")} />
        </Field>
        <MoneyInput label="Monthly rent in the agreement" value={form.rent} onChange={set("rent")} />
        <Field label="Rent due on day">
          <input
            type="number"
            min="1"
            max="31"
            inputMode="numeric"
            value={form.rentDueDay}
            onChange={setText("rentDueDay")}
            placeholder="e.g. 7"
          />
        </Field>
      </div>
      <div style={grid}>
        <MoneyInput
          label="Security deposit"
          value={form.securityDeposit}
          onChange={set("securityDeposit")}
          hint={monthsHint(form.securityDeposit, form.rent) || "Commonly 2 months' rent"}
        />
        <MoneyInput
          label="Utility deposit"
          value={form.utilityDeposit}
          onChange={set("utilityDeposit")}
          hint={monthsHint(form.utilityDeposit, form.rent) || "Commonly half to 1 month's rent"}
        />
        <MoneyInput label="Other deposit" value={form.otherDeposit} onChange={set("otherDeposit")} hint="e.g. access cards" />
        <Field label="Deposits held by">
          <select value={form.depositHeldBy} onChange={setText("depositHeldBy")}>
            {HELD_BY.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Notes">
        <textarea
          value={form.notes}
          onChange={setText("notes")}
          rows={2}
          placeholder="e.g. agent's name, number of occupants, car park lot"
          style={{ resize: "vertical" }}
        />
      </Field>
      {error && <span style={{ color: "var(--color-danger)", fontSize: 13 }}>{error}</span>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="submit" className="primary-button" style={{ ...smallButton, width: "auto" }}>
          {submitLabel}
        </button>
        <button type="button" className="btn-secondary" style={smallButton} onClick={onCancel}>
          Cancel
        </button>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)" }}>
        Kept on this device only. Aequitas doesn&apos;t ask for IC or passport numbers; add the stamped agreement
        under Documents instead.
      </p>
    </form>
  );
}

function EndForm({ tenancy, onSubmit, onCancel }) {
  const total = depositTotal(tenancy);
  const [date, setDate] = useState(tenancy.endDate && tenancy.endDate <= todayIso() ? tenancy.endDate : todayIso());
  const [returned, setReturned] = useState(total ? String(total) : "");
  const [deductionNote, setDeductionNote] = useState("");
  const deducted = Math.max(0, total - (toAmount(returned) ?? 0));

  function submit(event) {
    event.preventDefault();
    onSubmit({
      date,
      reason: "moved-out",
      returned,
      deducted: total ? String(Math.round(deducted * 100) / 100) : "",
      deductionNote: deductionNote.trim(),
    });
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12, marginTop: 14 }}>
      <strong>Record move-out</strong>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
        <Field label="Moved out on">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </Field>
        <MoneyInput
          label="Deposit returned to tenant"
          value={returned}
          onChange={setReturned}
          hint={total ? `Deposits held: ${formatRM(total, 2)}` : "No deposits were recorded"}
        />
      </div>
      {total > 0 && deducted > 0 && (
        <Field label={`Kept from the deposit: ${formatRM(deducted, 2)}. What for?`}>
          <input
            value={deductionNote}
            onChange={(e) => setDeductionNote(e.target.value)}
            placeholder="e.g. unpaid utilities, repainting"
          />
        </Field>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="submit" className="primary-button" style={{ ...smallButton, width: "auto" }}>
          Save move-out
        </button>
        <button type="button" className="btn-secondary" style={smallButton} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function emptyForm(property, legacy) {
  return {
    id: newTenancyId(),
    tenantName: "",
    phone: "",
    email: "",
    startDate: legacy.startDate || "",
    endDate: legacy.endDate || "",
    rent: property.monthlyRental ? String(property.monthlyRental) : "",
    rentDueDay: "",
    securityDeposit: "",
    utilityDeposit: "",
    otherDeposit: "",
    depositHeldBy: "",
    notes: "",
    status: "current",
  };
}

export default function TenantCard({ property, onSaved }) {
  const [mode, setMode] = useState(null); // "add" | "edit" | "renew" | "end"
  const [showHistory, setShowHistory] = useState(false);
  const { files } = useFiles(property.id);

  const tenancies = getTenancies(property);
  const owed = rentArrears(getMonthlyCheckins(property.id));
  const current = getCurrentTenancy(property);
  const past = tenancies.filter((t) => t.status === "ended");
  const legacy = getDocuments(property).tenancy || {};
  const hasLegacyDates = !tenancies.length && (legacy.startDate || legacy.endDate);
  const agreementFiles = files.filter((f) => f.docType === "tenancy" || f.docType === "tenancyStamp").length;

  function done() {
    setMode(null);
    onSaved?.();
  }

  const days = current?.endDate ? daysUntil(current.endDate) : null;
  const pill =
    !current
      ? { tone: "neutral", text: "No tenant" }
      : days === null
      ? { tone: "positive", text: "Tenanted" }
      : days < 0
      ? { tone: "negative", text: "Past end date" }
      : days <= 60
      ? { tone: "caution", text: `Ends in ${days} days` }
      : { tone: "positive", text: "Tenanted" };

  const rentDiffers =
    current &&
    toAmount(current.rent) !== null &&
    toAmount(property.monthlyRental) !== null &&
    Math.abs(toAmount(current.rent) - toAmount(property.monthlyRental)) >= 1;

  return (
    <div id="tenant" className="card" style={{ marginTop: 24, scrollMarginTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <div className="card-label">TENANT</div>
          <h3 style={{ margin: "6px 0 0" }}>🔑 Tenant and deposits</h3>
        </div>
        <StatusPill tone={pill.tone}>{pill.text}</StatusPill>
      </div>

      {current && mode !== "edit" && (
        <div style={{ marginTop: 16, display: "grid", gap: 14 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{current.tenantName}</div>
            <div style={{ fontSize: 14, color: "var(--color-text-secondary)", marginTop: 4, display: "flex", gap: 14, flexWrap: "wrap" }}>
              {current.phone && <a href={`tel:${current.phone.replace(/\s/g, "")}`}>{current.phone}</a>}
              {current.phone && (
                <a href={`https://wa.me/${current.phone.replace(/[^0-9]/g, "").replace(/^0/, "60")}`} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              )}
              {current.email && <a href={`mailto:${current.email}`}>{current.email}</a>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
            <div>
              <div className="card-label">Tenancy</div>
              <div style={{ marginTop: 4, fontWeight: 600 }}>
                {formatDate(current.startDate)}
                {current.endDate ? ` to ${formatDate(current.endDate)}` : ", no end date"}
              </div>
            </div>
            <div>
              <div className="card-label">Rent</div>
              <div style={{ marginTop: 4, fontWeight: 600 }}>
                {toAmount(current.rent) !== null ? formatRM(toAmount(current.rent), 2) : "Not recorded"}
                {current.rentDueDay && (
                  <span style={{ fontWeight: 400, color: "var(--color-text-secondary)" }}> · due on day {current.rentDueDay}</span>
                )}
              </div>
            </div>
            <div>
              <div className="card-label">Deposits held</div>
              <div style={{ marginTop: 4, fontWeight: 600 }}>
                {depositTotal(current) > 0 ? formatRM(depositTotal(current), 2) : "None recorded"}
                {current.depositHeldBy && (
                  <span style={{ fontWeight: 400, color: "var(--color-text-secondary)" }}>
                    {" "}
                    · held by {current.depositHeldBy === "me" ? "you" : "your agent"}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
                {DEPOSIT_FIELDS.filter(([key]) => toAmount(current[key]))
                  .map(([key, label]) => {
                    const months = depositMonths(current[key], current.rent);
                    return `${label.replace(" deposit", "")} ${formatRM(toAmount(current[key]), 2)}${months ? ` (${months} mo)` : ""}`;
                  })
                  .join(" · ")}
              </div>
            </div>
          </div>

          {owed.owed > 0 && (
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-warning)" }}>
              Rent owed: {formatRM(owed.owed, 2)} (unpaid since {owed.sinceLabel}), from your check-ins.
            </div>
          )}

          {current.notes && (
            <div style={{ fontSize: 14, color: "var(--color-text-secondary)", whiteSpace: "pre-wrap" }}>{current.notes}</div>
          )}

          {rentDiffers && (
            <div style={{ fontSize: 13, color: "var(--color-warning)" }}>
              The agreement rent differs from the expected rent on the property record (
              {formatRM(toAmount(property.monthlyRental), 2)}), which cashflow uses. Update it in Edit property if the rent
              changed.
            </div>
          )}

          <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
            {agreementFiles > 0 ? (
              <a href="#documents">
                Tenancy agreement: {agreementFiles} file{agreementFiles === 1 ? "" : "s"} in Documents
              </a>
            ) : (
              <a href="#documents">Add the signed and stamped agreement in Documents</a>
            )}
          </div>

          {mode === null && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" className="btn-secondary" style={smallButton} onClick={() => setMode("edit")}>
                Edit
              </button>
              <button type="button" className="btn-secondary" style={smallButton} onClick={() => setMode("renew")}>
                Renew tenancy
              </button>
              <button type="button" className="btn-secondary" style={smallButton} onClick={() => setMode("end")}>
                Tenant moved out
              </button>
            </div>
          )}
        </div>
      )}

      {!current && mode === null && (
        <div style={{ marginTop: 12 }}>
          <p className="page-subtitle" style={{ margin: "0 0 12px" }}>
            {hasLegacyDates
              ? `Tenancy dates on record: ${legacy.startDate ? formatDate(legacy.startDate) : "?"} to ${
                  legacy.endDate ? formatDate(legacy.endDate) : "?"
                }. Add the tenant's details and deposits.`
              : past.length
              ? "Vacant. Add the next tenant when the unit is let."
              : "Record who is renting, the tenancy dates and the deposits you hold."}
          </p>
          <button type="button" className="primary-button" style={{ ...smallButton, width: "auto" }} onClick={() => setMode("add")}>
            Add tenant
          </button>
        </div>
      )}

      {mode === "add" && (
        <TenancyForm
          title="New tenant"
          submitLabel="Save tenant"
          initial={emptyForm(property, hasLegacyDates ? legacy : {})}
          onCancel={() => setMode(null)}
          onSubmit={(t) => {
            saveTenancy(property, t);
            done();
          }}
        />
      )}

      {mode === "edit" && current && (
        <TenancyForm
          title="Edit tenant"
          submitLabel="Save changes"
          initial={{
            ...emptyForm(property, {}),
            ...Object.fromEntries(Object.entries(current).map(([k, v]) => [k, v ?? ""])),
          }}
          onCancel={() => setMode(null)}
          onSubmit={(t) => {
            saveTenancy(property, t);
            done();
          }}
        />
      )}

      {mode === "renew" && current && (
        <TenancyForm
          title={`Renew with ${current.tenantName}`}
          submitLabel="Save renewal"
          initial={{
            ...emptyForm(property, {}),
            ...Object.fromEntries(Object.entries(current).map(([k, v]) => [k, v ?? ""])),
            id: newTenancyId(),
            status: "current",
            closing: undefined,
            renewedFrom: undefined,
            startDate: current.endDate ? addDaysIso(current.endDate, 1) : todayIso(),
            endDate: current.endDate ? addYearsIso(current.endDate, 1) : "",
          }}
          onCancel={() => setMode(null)}
          onSubmit={(t) => {
            renewTenancy(property, current.id, t);
            done();
          }}
        />
      )}

      {mode === "end" && current && (
        <EndForm
          tenancy={current}
          onCancel={() => setMode(null)}
          onSubmit={(closing) => {
            closeTenancy(property, current.id, closing);
            done();
          }}
        />
      )}

      {past.length > 0 && (
        <div style={{ marginTop: 16, borderTop: "1px solid var(--color-border)", paddingTop: 12 }}>
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            aria-expanded={showHistory}
            style={{ background: "none", border: "none", padding: 0, color: "var(--color-link)", fontWeight: 600, cursor: "pointer" }}
          >
            {showHistory ? "Hide" : "Show"} past tenancies ({past.length})
          </button>
          {showHistory && (
            <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
              {past.map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: "var(--color-surface-sunken)",
                    border: "1px solid var(--color-border)",
                    fontSize: 13,
                  }}
                >
                  <strong>{t.tenantName}</strong>{" "}
                  <span style={{ color: "var(--color-text-secondary)" }}>
                    {formatDate(t.startDate)} to {formatDate(t.closing?.date || t.endDate)}
                  </span>
                  <div style={{ color: "var(--color-text-secondary)", marginTop: 4 }}>
                    {t.closing?.reason === "renewed"
                      ? "Renewed; deposits carried forward."
                      : `Moved out. Deposit returned ${
                          toAmount(t.closing?.returned) !== null ? formatRM(toAmount(t.closing.returned), 2) : "not recorded"
                        }${
                          toAmount(t.closing?.deducted) ? `, kept ${formatRM(toAmount(t.closing.deducted), 2)}` : ""
                        }${t.closing?.deductionNote ? ` (${t.closing.deductionNote})` : ""}.`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
