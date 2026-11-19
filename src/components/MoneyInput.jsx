import { useState } from "react";

/*
 * Money / number input used across Aequitas.
 *
 * - Shows thousand separators when not being edited (450,000), and the
 *   plain number while typing, so large figures are easy to check.
 * - Keeps only digits and one decimal point.
 * - onChange receives the cleaned string ("" when empty), matching how
 *   amounts are stored today.
 */
export default function MoneyInput({
  label,
  value,
  onChange,
  hint,
  error,
  prefix = "RM",
  placeholder,
  required = false,
  name,
}) {
  const [editing, setEditing] = useState(false);
  const raw = value === null || value === undefined ? "" : String(value);
  const shown =
    editing || raw === "" || !Number.isFinite(Number(raw))
      ? raw
      : Number(raw).toLocaleString("en-MY", {
          // 273.7 shows as 273.70; whole amounts stay without decimals.
          minimumFractionDigits: Number.isInteger(Number(raw)) ? 0 : 2,
          maximumFractionDigits: 2,
        });

  function clean(text) {
    const digits = text.replace(/[^0-9.]/g, "");
    const [whole, ...rest] = digits.split(".");
    return rest.length ? `${whole}.${rest.join("")}` : whole;
  }

  return (
    <label style={{ display: "grid", gap: 6 }}>
      {label && (
        <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
          {label}
          {required && <span style={{ color: "var(--color-danger)" }}> *</span>}
        </span>
      )}
      <div style={{ position: "relative" }}>
        {prefix && (
          <span
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-muted)",
              fontSize: 14,
              pointerEvents: "none",
            }}
          >
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode="decimal"
          name={name}
          value={shown}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          onFocus={() => setEditing(true)}
          onBlur={() => setEditing(false)}
          onChange={(event) => onChange(clean(event.target.value))}
          style={{
            paddingLeft: prefix ? 46 : undefined,
            width: "100%",
            boxSizing: "border-box",
            borderColor: error ? "var(--color-danger)" : undefined,
          }}
        />
      </div>
      {error ? (
        <span style={{ fontSize: 12, color: "var(--color-danger)" }}>{error}</span>
      ) : (
        hint && <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{hint}</span>
      )}
    </label>
  );
}
