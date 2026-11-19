import { useRef, useState } from "react";

import MoneyInput from "../MoneyInput";
import StatusPill from "../StatusPill";
import { formatDate } from "../../utils/documents";
import { formatRM } from "../../utils/propertyFinancials";
import { getBillsForYear, saveBillRecord } from "../../utils/yearlyBills";
import useFiles from "../../hooks/useFiles";
import { addFile, openFile } from "../../services/fileStore";

/*
 * Yearly bills — quit rent and the two assessment-tax halves.
 *
 * The investor marks each bill paid (with the amount) or not applicable,
 * and can attach the receipt (saved under Documents as a receipt for that
 * year). Paid amounts feed the Tax summary. Nothing is assumed paid.
 */

const STATUS = {
  paid: { tone: "positive", label: "Paid" },
  na: { tone: "neutral", label: "Not applicable" },
  "before-purchase": { tone: "neutral", label: "Before purchase" },
  upcoming: { tone: "neutral", label: "Upcoming" },
  "due-soon": { tone: "caution", label: "Due soon" },
  "not-marked": { tone: "caution", label: "Not marked paid" },
};

const buttonStyle = {
  padding: "9px 14px",
  borderRadius: 10,
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
};

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function BillRow({ bill, onSave, receipts, onAttach }) {
  const [editing, setEditing] = useState(false);
  const [amountValue, setAmountValue] = useState("");
  const [paidOn, setPaidOn] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState("");
  const attachInput = useRef(null);
  const status = STATUS[bill.status];

  async function attach(file) {
    setError("");
    try {
      await onAttach(file);
    } catch (e) {
      setError(e?.message || "The receipt couldn't be saved.");
    }
  }

  function startEditing() {
    setAmountValue(bill.record?.amount ?? "");
    setPaidOn(bill.record?.paidOn || (bill.dueDate < todayIso() ? "" : todayIso()));
    setEditing(true);
  }

  async function savePaid(event) {
    event.preventDefault();
    onSave({ status: "paid", amount: amountValue, paidOn });
    if (receipt) await attach(receipt);
    setReceipt(null);
    setEditing(false);
  }

  return (
    <div
      style={{
        padding: 14,
        borderRadius: 12,
        background: "var(--color-surface-sunken)",
        border: "1px solid var(--color-border)",
        display: "grid",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 200px" }}>
          <strong>{bill.label}</strong>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 4 }}>
            Due {formatDate(bill.dueDate)}
            {bill.status === "due-soon" && ` (in ${bill.days} day${bill.days === 1 ? "" : "s"})`}
            {bill.expected !== null && bill.status !== "paid" && (
              <> · about {formatRM(bill.expected, 2)} from your monthly figure</>
            )}
          </div>
          {bill.status === "paid" && (
            <div style={{ fontSize: 13, marginTop: 4 }}>
              {bill.paidAmount !== null ? formatRM(bill.paidAmount, 2) : "Amount not entered"}
              {bill.record?.paidOn && ` paid on ${formatDate(bill.record.paidOn)}`}
            </div>
          )}
        </div>
        <StatusPill tone={status.tone}>{status.label}</StatusPill>
      </div>

      {editing ? (
        <form onSubmit={savePaid} style={{ display: "grid", gap: 10 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
              gap: 10,
            }}
          >
            <MoneyInput
              label="Amount paid"
              value={amountValue}
              onChange={setAmountValue}
              placeholder={bill.expected !== null ? String(Math.round(bill.expected * 100) / 100) : "e.g. 360"}
              hint="From your bill or receipt"
            />
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Paid on (optional)</span>
              <input type="date" value={paidOn} onChange={(e) => setPaidOn(e.target.value)} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Receipt (optional)</span>
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                style={{ fontSize: 13 }}
              />
            </label>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="submit" className="primary-button" style={{ ...buttonStyle, width: "auto" }}>
              Save as paid
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={buttonStyle}
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {bill.status === "paid" ? (
            <>
              {receipts.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  className="btn-secondary"
                  style={buttonStyle}
                  onClick={() => openFile(file.id).catch((e) => setError(e.message))}
                >
                  🧾 View receipt
                </button>
              ))}
              {receipts.length === 0 && (
                <>
                  <input
                    ref={attachInput}
                    type="file"
                    accept="application/pdf,image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (file) attach(file);
                    }}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    style={buttonStyle}
                    onClick={() => attachInput.current?.click()}
                  >
                    Attach receipt
                  </button>
                </>
              )}
              <button type="button" className="btn-secondary" style={buttonStyle} onClick={startEditing}>
                Edit payment
              </button>
              <button type="button" className="btn-secondary" style={buttonStyle} onClick={() => onSave(null)}>
                Mark as not paid
              </button>
            </>
          ) : bill.status === "na" ? (
            <button type="button" className="btn-secondary" style={buttonStyle} onClick={() => onSave(null)}>
              Undo not applicable
            </button>
          ) : (
            <>
              <button type="button" className="btn-secondary" style={buttonStyle} onClick={startEditing}>
                Mark paid
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={buttonStyle}
                onClick={() => onSave({ status: "na" })}
              >
                Not applicable
              </button>
            </>
          )}
        </div>
      )}
      {error && <span style={{ fontSize: 12, color: "var(--color-danger)" }}>{error}</span>}
    </div>
  );
}

export default function YearlyBillsCard({ property, onSaved }) {
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(thisYear);
  const bills = getBillsForYear(property, year);
  const paidCount = bills.filter((bill) => bill.status === "paid" || bill.status === "na").length;

  const { files } = useFiles(property.id);

  function save(billId, record) {
    saveBillRecord(property, year, billId, record);
    onSaved?.();
  }

  function attachReceipt(bill, file) {
    return addFile(file, {
      propertyId: property.id,
      docType: bill.taxGroup === "quitRent" ? "quitRentReceipt" : "assessmentReceipt",
      year,
      note: bill.label,
      link: { kind: "bill", year, billId: bill.id },
    });
  }

  const receiptsFor = (bill) =>
    files.filter((f) => f.link?.kind === "bill" && f.link.year === year && f.link.billId === bill.id);

  return (
    <div id="yearly-bills" className="card" style={{ marginTop: 24, scrollMarginTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <div className="card-label">YEARLY BILLS</div>
          <h3 style={{ margin: "6px 0 0" }}>🧾 Quit rent and assessment tax</h3>
        </div>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          aria-label="Year"
          style={{ width: "auto" }}
        >
          {[thisYear + 1, thisYear, thisYear - 1, thisYear - 2].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <p className="page-subtitle" style={{ margin: "8px 0 16px" }}>
        {paidCount} of {bills.length} settled for {year}. Due dates are the ones most councils use, so check your bill.
        Paid amounts go into your tax summary; receipts are filed under Documents.
      </p>

      <div style={{ display: "grid", gap: 10 }}>
        {bills.map((bill) => (
          <BillRow
            key={`${year}-${bill.id}`}
            bill={bill}
            receipts={receiptsFor(bill)}
            onSave={(record) => save(bill.id, record)}
            onAttach={(file) => attachReceipt(bill, file)}
          />
        ))}
      </div>
    </div>
  );
}
