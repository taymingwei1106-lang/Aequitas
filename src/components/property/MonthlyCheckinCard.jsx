import { useMemo, useState } from "react";

import MoneyInput from "../MoneyInput";
import StatusPill from "../StatusPill";
import FreshnessPanel from "./FreshnessPanel";
import RentTracking from "./RentTracking";
import CatchUpPanel from "./CatchUpPanel";
import { expectedRentDue, rentArrears, rentStatus } from "../../utils/rentLedger";
import { getCurrentTenancy } from "../../utils/tenancies";
import {
  getMonthlyCheckin,
  getMonthlyCheckins,
  saveMonthlyCheckin,
} from "../../services/monthlyCheckinStorage";

/*
 * Monthly check-in: what actually happened in one month.
 *
 * - A new month starts from the previous check-in (rent, instalment, loan
 *   balance, market value carry forward; maintenance, other expenses and
 *   the note start blank), or from the property record if there is none.
 * - A month already recorded loads exactly as saved.
 * - Saving updates the property's loan balance and market value from this
 *   month (see services/monthlyCheckinStorage.js).
 * - Optional extras appear only when useful: "Same as last month" for a
 *   quiet month, a catch-up panel when two or more months are missing,
 *   rent due / paid tracking, and a year-so-far line.
 */

const EMPTY_FORM = {
  rentalReceived: "",
  loanInstalment: "",
  maintenancePaid: "",
  otherExpenses: "",
  outstandingLoan: "",
  marketValue: "",
  note: "",
  rentDue: "",
  rentTiming: "",
  rentReceivedOn: "",
};

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function shiftMonth(month, delta) {
  const [year, m] = month.split("-").map(Number);
  const d = new Date(year, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(month, style = "long") {
  if (!month) return "";
  const [year, m] = month.split("-");
  return new Date(Number(year), Number(m) - 1, 1).toLocaleDateString("en-MY", {
    month: style,
    year: "numeric",
  });
}

function currency(value) {
  const number = Number(value) || 0;
  // Whole ringgit without decimals; anything with sen shows both digits (RM 92.70).
  const decimals = Number.isInteger(Math.round(number * 100) / 100) ? 0 : 2;
  return `RM ${number.toLocaleString("en-MY", { minimumFractionDigits: decimals, maximumFractionDigits: 2 })}`;
}

function signedCurrency(value) {
  const number = Number(value) || 0;
  if (number > 0) return `+${currency(number)}`;
  if (number < 0) return `−${currency(Math.abs(number))}`;
  return currency(0);
}

const blank = (v) => v === "" || v === null || v === undefined;

function moneyOut(item) {
  return (Number(item?.loanInstalment) || 0) + (Number(item?.maintenancePaid) || 0) + (Number(item?.otherExpenses) || 0);
}

function resultFor(item) {
  if (!item) return 0;
  return (Number(item.rentalReceived) || 0) - moneyOut(item);
}

/*
 * One "compared with last month" figure. `goodWhen` says which direction
 * is good news: rent and value rising are good; loan balance and costs
 * rising are not.
 */
function Delta({ label, current, previous, goodWhen }) {
  let text;
  let color = "var(--color-text-muted)";

  if (blank(current) || blank(previous)) {
    text = "Not recorded";
  } else {
    const change = (Number(current) || 0) - (Number(previous) || 0);
    if (Math.abs(change) < 0.005) {
      text = "Same";
    } else {
      const good = goodWhen === "up" ? change > 0 : change < 0;
      color = good ? "var(--color-success)" : "var(--color-warning)";
      text = `${change > 0 ? "▲" : "▼"} ${currency(Math.abs(change))}`;
    }
  }

  return (
    <div>
      <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2, color }}>{text}</div>
    </div>
  );
}

function Panel({ title, children, span }) {
  return (
    <fieldset
      style={{
        margin: 0,
        padding: 16,
        borderRadius: 12,
        border: "1px solid var(--color-border)",
        background: "var(--color-surface-sunken)",
        display: "grid",
        gap: 12,
        alignContent: "start",
        gridColumn: span ? "1 / -1" : undefined,
        minWidth: 0,
      }}
    >
      <legend style={{ padding: 0, fontSize: 13, fontWeight: 700, float: "left", width: "100%" }}>{title}</legend>
      {children}
    </fieldset>
  );
}

const linkButton = {
  background: "none",
  border: "none",
  padding: 0,
  color: "var(--color-link)",
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
};

const arrowButton = {
  width: 40,
  height: 44,
  borderRadius: 10,
  border: "1px solid var(--color-border-strong)",
  background: "var(--color-surface)",
  color: "var(--color-text)",
  fontSize: 18,
  cursor: "pointer",
};

export default function MonthlyCheckinCard({ property, onSaved }) {
  const currentMonth = getCurrentMonth();
  const propertyId = property?.id;

  /* The form for a month: as saved, or carried forward for a new month. */
  function buildForm(month) {
    if (!propertyId) return EMPTY_FORM;
    const existing = getMonthlyCheckin(propertyId, month);
    const previous = getMonthlyCheckins(propertyId).find((item) => item.month < month);
    const source = existing || previous;

    return {
      rentalReceived: source?.rentalReceived ?? property?.monthlyRental ?? "",
      loanInstalment: source?.loanInstalment ?? property?.monthlyInstalment ?? "",
      maintenancePaid: existing?.maintenancePaid ?? "",
      otherExpenses: existing?.otherExpenses ?? "",
      outstandingLoan: source?.outstandingLoan ?? property?.outstandingLoan ?? "",
      marketValue: source?.marketValue ?? property?.marketValue ?? "",
      note: existing?.note ?? "",
      // A month already saved keeps what it had (older months: not tracked).
      rentDue: existing ? existing.rentDue ?? "" : expectedRentDue(property),
      rentTiming: existing?.rentTiming ?? "",
      rentReceivedOn: existing?.rentReceivedOn ?? "",
    };
  }

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [form, setForm] = useState(() => buildForm(currentMonth));
  const [savedMessage, setSavedMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [checkins, setCheckins] = useState(() => (propertyId ? getMonthlyCheckins(propertyId) : []));
  const [showHistory, setShowHistory] = useState(false);

  function refreshHistory() {
    if (!propertyId) return;
    setCheckins(getMonthlyCheckins(propertyId));
  }

  function changeMonth(month) {
    if (!month) return;
    setSelectedMonth(month);
    setForm(buildForm(month));
    setSavedMessage("");
    setErrorMessage("");
  }

  const existingCheckin = useMemo(
    () => checkins.find((item) => item.month === selectedMonth) || null,
    [checkins, selectedMonth]
  );
  const previousCheckin = useMemo(
    () => checkins.find((item) => item.month < selectedMonth) || null,
    [checkins, selectedMonth]
  );

  const totalOut = moneyOut(form);
  const currentResult = (Number(form.rentalReceived) || 0) - totalOut;

  // Rent owed including what's on screen for this month.
  const arrears = useMemo(
    () => rentArrears([...checkins.filter((c) => c.month !== selectedMonth), { ...form, month: selectedMonth }]),
    [checkins, form, selectedMonth]
  );

  const tenant = getCurrentTenancy(property);
  const dueSource =
    form.rentDue === "" || existingCheckin
      ? ""
      : tenant && Number(tenant.rent) === Number(form.rentDue)
      ? "tenancy agreement"
      : Number(property?.monthlyRental) === Number(form.rentDue)
      ? "expected rent"
      : "";

  // Months not recorded between the first check-in and this month.
  const missingMonths = useMemo(() => {
    if (!checkins.length) return [];
    const recorded = new Set(checkins.map((c) => c.month));
    const first = checkins[checkins.length - 1].month;
    const list = [];
    for (let m = first; m <= currentMonth; m = shiftMonth(m, 1)) {
      if (!recorded.has(m)) list.push(m);
    }
    return list.slice(-12);
  }, [checkins, currentMonth]);
  const [catchingUp, setCatchingUp] = useState(false);

  const selectedYear = selectedMonth.slice(0, 4);
  const yearSoFar = useMemo(() => {
    const months = checkins.filter((c) => c.month.startsWith(`${selectedYear}-`));
    if (!months.length) return null;
    const rentIn = months.reduce((t, c) => t + (Number(c.rentalReceived) || 0), 0);
    const out = months.reduce((t, c) => t + moneyOut(c), 0);
    return { count: months.length, rentIn, out, net: rentIn - out };
  }, [checkins, selectedYear]);

  function setField(name) {
    return (value) => {
      setForm((prev) => ({ ...prev, [name]: value }));
      setSavedMessage("");
    };
  }

  function useExpectedFigures() {
    setForm((prev) => ({
      ...prev,
      rentalReceived: blank(property?.monthlyRental) ? prev.rentalReceived : String(property.monthlyRental),
      loanInstalment: blank(property?.monthlyInstalment) ? prev.loanInstalment : String(property.monthlyInstalment),
      maintenancePaid: blank(property?.maintenanceFee) ? prev.maintenancePaid : String(property.maintenanceFee),
    }));
    setSavedMessage("");
  }

  /* A quiet month: same rent, instalment and maintenance as the month before. */
  function saveSameAsPrevious() {
    if (!previousCheckin) return;
    setErrorMessage("");
    const due = expectedRentDue(property);
    const received = previousCheckin.rentalReceived ?? "";
    try {
      saveMonthlyCheckin({
        propertyId,
        month: selectedMonth,
        rentalReceived: received,
        loanInstalment: previousCheckin.loanInstalment ?? "",
        maintenancePaid: previousCheckin.maintenancePaid ?? "",
        otherExpenses: "",
        outstandingLoan: "",
        marketValue: "",
        note: "",
        rentDue: due,
        rentTiming: due !== "" && Number(received) >= Number(due) && Number(due) > 0 ? "on-time" : "",
        rentReceivedOn: "",
      });
      refreshHistory();
      setForm(buildForm(selectedMonth));
      setSavedMessage(
        `${formatMonth(selectedMonth)} saved. Add the loan balance when you next check your bank app.`
      );
      onSaved?.();
    } catch (error) {
      setErrorMessage(error?.message || "Unable to save the check-in.");
    }
  }

  function handleSave(event) {
    event.preventDefault();
    setErrorMessage("");
    try {
      saveMonthlyCheckin({ propertyId, month: selectedMonth, ...form });
      refreshHistory();
      setSavedMessage(`${formatMonth(selectedMonth)} saved.`);
      onSaved?.();
    } catch (error) {
      setErrorMessage(error?.message || "Unable to save the check-in.");
    }
  }

  const origin = existingCheckin
    ? `Recorded${
        existingCheckin.updatedAt
          ? ` on ${new Date(existingCheckin.updatedAt).toLocaleDateString("en-MY", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}`
          : ""
      }. Editing updates this month.`
    : previousCheckin
    ? `Figures carried forward from ${formatMonth(previousCheckin.month)}. Change only what was different.`
    : "Starting from the expected figures on the property record.";

  const hasExpected = !blank(property?.monthlyRental) || !blank(property?.monthlyInstalment) || !blank(property?.maintenanceFee);
  const futureMonth = selectedMonth > currentMonth;

  return (
    <div id="checkin" className="card" style={{ marginTop: 0, scrollMarginTop: 24 }}>
      {/* Header: month and status */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <div className="card-label">MONTHLY CHECK-IN</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
            <h3 style={{ margin: 0 }}>📝 {formatMonth(selectedMonth)}</h3>
            <StatusPill tone={existingCheckin ? "positive" : "neutral"}>
              {existingCheckin ? "Recorded" : "Not recorded yet"}
            </StatusPill>
          </div>
        </div>

        <div className="checkin-month-nav">
          <button
            type="button"
            style={arrowButton}
            onClick={() => changeMonth(shiftMonth(selectedMonth, -1))}
            aria-label="Previous month"
          >
            ‹
          </button>
          <input
            type="month"
            value={selectedMonth}
            onChange={(event) => changeMonth(event.target.value)}
            aria-label="Check-in month"
          />
          <button
            type="button"
            style={{ ...arrowButton, opacity: selectedMonth >= currentMonth ? 0.4 : 1 }}
            onClick={() => changeMonth(shiftMonth(selectedMonth, 1))}
            disabled={selectedMonth >= currentMonth}
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </div>

      {/* How up to date the property is */}
      <FreshnessPanel property={property} />

      {/* Several months missing: offer to catch up in one go */}
      {missingMonths.length >= 2 && !catchingUp && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid var(--color-warning-border)",
            background: "var(--color-warning-soft)",
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            fontSize: 14,
          }}
        >
          <span>
            {missingMonths.length} months not recorded:{" "}
            {missingMonths.map((m) => formatMonth(m, "short")).join(", ")}.
          </span>
          <button type="button" className="btn-secondary" style={{ padding: "8px 14px", borderRadius: 10, fontWeight: 600, cursor: "pointer" }} onClick={() => setCatchingUp(true)}>
            Catch up
          </button>
        </div>
      )}
      {catchingUp && (
        <CatchUpPanel
          property={property}
          months={missingMonths}
          lastRecorded={checkins.find((c) => c.month < missingMonths[0]) || checkins[0]}
          rentDue={expectedRentDue(property)}
          onCancel={() => setCatchingUp(false)}
          onDone={(count) => {
            setCatchingUp(false);
            refreshHistory();
            setForm(buildForm(selectedMonth));
            setSavedMessage(`${count} month${count === 1 ? "" : "s"} saved.`);
            onSaved?.();
          }}
        />
      )}

      {/* A quiet month: one tap */}
      {!existingCheckin && previousCheckin && !futureMonth && !catchingUp && (
        <div
          style={{
            marginTop: 16,
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid var(--color-border-strong)",
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5, flex: "1 1 260px" }}>
            <strong style={{ color: "var(--color-text)", fontSize: 14 }}>Nothing unusual this month?</strong>
            <br />
            Saves rent {currency(previousCheckin.rentalReceived)}, instalment {currency(previousCheckin.loanInstalment)} and
            maintenance {currency(previousCheckin.maintenancePaid)}, as in {formatMonth(previousCheckin.month, "short")}.
            The loan balance is left for you to add.
          </div>
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: "10px 16px", borderRadius: 12, fontWeight: 600, cursor: "pointer" }}
            onClick={saveSameAsPrevious}
          >
            Same as {formatMonth(previousCheckin.month, "short").split(" ")[0]}
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} style={{ display: "grid", gap: 14, marginTop: 18 }}>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
          {origin}
          {hasExpected && (
            <>
              {" "}
              <button type="button" style={linkButton} onClick={useExpectedFigures}>
                Use expected figures
              </button>
            </>
          )}
          {futureMonth && (
            <div style={{ color: "var(--color-warning)", marginTop: 4 }}>
              This month hasn&apos;t ended yet. Record it once the figures are known.
            </div>
          )}
        </div>

        <div className="checkin-grid">
          <Panel title="Money in">
            <MoneyInput
              label="Rent received"
              value={form.rentalReceived}
              onChange={setField("rentalReceived")}
              name="rentalReceived"
              hint="All rent money that arrived this month"
            />
            <RentTracking form={form} setField={setField} arrears={arrears} dueSource={dueSource} />
          </Panel>

          <Panel title="Money out">
            <MoneyInput label="Loan instalment paid" value={form.loanInstalment} onChange={setField("loanInstalment")} name="loanInstalment" />
            <MoneyInput
              label="Maintenance and repairs"
              value={form.maintenancePaid}
              onChange={setField("maintenancePaid")}
              name="maintenancePaid"
              hint="Maintenance fee, sinking fund, repairs"
            />
            <MoneyInput
              label="Other expenses"
              value={form.otherExpenses}
              onChange={setField("otherExpenses")}
              name="otherExpenses"
              hint="Add a note below saying what it was for"
            />
          </Panel>

          <Panel title="Position at month end" span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
              <MoneyInput
                label="Outstanding loan"
                value={form.outstandingLoan}
                onChange={setField("outstandingLoan")}
                name="outstandingLoan"
                hint="From your bank app or statement"
              />
              <MoneyInput
                label="Market value (optional)"
                value={form.marketValue}
                onChange={setField("marketValue")}
                name="marketValue"
                hint="From a bank valuation or recent sales nearby"
              />
            </div>
          </Panel>
        </div>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Note (optional)</span>
          <textarea
            name="note"
            rows="2"
            placeholder="e.g. aircon repair, tenant paid late, rent increased"
            value={form.note}
            onChange={(event) => setField("note")(event.target.value)}
            style={{ width: "100%", resize: "vertical" }}
          />
        </label>

        {/* Result and save */}
        <div className="checkin-footer">
          <div>
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Cashflow this month</div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                marginTop: 2,
                color: currentResult >= 0 ? "var(--color-success)" : "var(--color-danger)",
              }}
            >
              {signedCurrency(currentResult)}
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
              {currency(form.rentalReceived)} in − {currency(totalOut)} out
            </div>
          </div>
          <button type="submit" className="primary-button checkin-save">
            {existingCheckin ? `Update ${formatMonth(selectedMonth)}` : `Save ${formatMonth(selectedMonth)}`}
          </button>
        </div>

        {savedMessage && (
          <div
            role="status"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              background: "var(--color-success-soft)",
              color: "var(--color-success)",
              fontSize: 14,
            }}
          >
            ✓ {savedMessage}
          </div>
        )}
        {errorMessage && (
          <div role="alert" style={{ fontSize: 14, color: "var(--color-danger)" }}>
            {errorMessage}
          </div>
        )}
      </form>

      {/* Compared with the month before */}
      {previousCheckin && (
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--color-border)" }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Compared with {formatMonth(previousCheckin.month)}</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))",
              gap: 12,
              marginTop: 10,
            }}
          >
            <Delta label="Cashflow" current={currentResult} previous={resultFor(previousCheckin)} goodWhen="up" />
            <Delta label="Rent" current={form.rentalReceived} previous={previousCheckin.rentalReceived} goodWhen="up" />
            <Delta label="Money out" current={totalOut} previous={moneyOut(previousCheckin)} goodWhen="down" />
            <Delta label="Loan balance" current={form.outstandingLoan} previous={previousCheckin.outstandingLoan} goodWhen="down" />
            <Delta label="Market value" current={form.marketValue} previous={previousCheckin.marketValue} goodWhen="up" />
          </div>
        </div>
      )}

      {/* History */}
      <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--color-border)" }}>
        {yearSoFar && (
          <div style={{ fontSize: 13, marginBottom: 10, lineHeight: 1.6 }}>
            <strong>{selectedYear} so far</strong>
            <span style={{ color: "var(--color-text-secondary)" }}>
              {" "}
              ({yearSoFar.count} month{yearSoFar.count === 1 ? "" : "s"}): rent {currency(yearSoFar.rentIn)} in,{" "}
              {currency(yearSoFar.out)} out, net{" "}
            </span>
            <strong style={{ color: yearSoFar.net >= 0 ? "var(--color-success)" : "var(--color-danger)" }}>
              {signedCurrency(yearSoFar.net)}
            </strong>
          </div>
        )}
        {checkins.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>No months recorded yet.</div>
        ) : (
          <>
            <button
              type="button"
              style={{ ...linkButton, textAlign: "left" }}
              onClick={() => setShowHistory((prev) => !prev)}
              aria-expanded={showHistory}
            >
              {showHistory ? "Hide" : "Show"} history ({checkins.length} month{checkins.length === 1 ? "" : "s"},{" "}
              {checkins.length === 1
                ? formatMonth(checkins[0].month, "short")
                : `${formatMonth(checkins[checkins.length - 1].month, "short")} to ${formatMonth(checkins[0].month, "short")}`}
              )
            </button>

            {showHistory && (
              <div style={{ display: "grid", gap: 6, marginTop: 12 }}>
                {checkins.map((item) => {
                  const result = resultFor(item);
                  const selected = item.month === selectedMonth;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => changeMonth(item.month)}
                      aria-current={selected ? "true" : undefined}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        textAlign: "left",
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: `1px solid ${selected ? "var(--color-primary)" : "var(--color-border)"}`,
                        background: selected ? "var(--color-primary-soft)" : "var(--color-surface-sunken)",
                        color: "inherit",
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ minWidth: 0 }}>
                        <strong style={{ fontSize: 14 }}>{formatMonth(item.month)}</strong>
                        {selected && (
                          <span style={{ fontSize: 12, color: "var(--color-primary)", marginLeft: 8 }}>Editing</span>
                        )}
                        {(() => {
                          const st = rentStatus(item);
                          if (st.state === "untracked" || (st.state === "paid" && st.tone === "positive")) return null;
                          return (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                marginLeft: 8,
                                color:
                                  st.tone === "negative"
                                    ? "var(--color-danger)"
                                    : st.tone === "caution"
                                    ? "var(--color-warning)"
                                    : "var(--color-text-muted)",
                              }}
                            >
                              {st.short}
                            </span>
                          );
                        })()}
                        <span style={{ display: "block", fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
                          In {currency(item.rentalReceived)} · Out {currency(moneyOut(item))}
                          {item.note ? ` · ${item.note}` : ""}
                        </span>
                      </span>
                      <strong
                        style={{
                          fontSize: 14,
                          whiteSpace: "nowrap",
                          color: result >= 0 ? "var(--color-success)" : "var(--color-danger)",
                        }}
                      >
                        {signedCurrency(result)}
                      </strong>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
