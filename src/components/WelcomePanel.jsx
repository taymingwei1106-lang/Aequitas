import { Link } from "react-router-dom";

/*
 * First-run screen on Home when there are no properties yet.
 */

const STEPS = [
  ["1", "Add your property", "Name and purchase price are enough to start. Add the rest when you have it."],
  ["2", "Record a monthly check-in", "Rent received, instalment paid, expenses and the loan balance from your statement."],
  ["3", "Read what it means", "Aequitas shows the status, explains what is changing and what to watch."],
];

export default function WelcomePanel() {
  return (
    <div className="card" style={{ padding: 28 }}>
      <div className="card-label">WELCOME TO AEQUITAS</div>
      <h1 style={{ margin: "8px 0 6px", fontSize: 30 }}>Understand your property investments</h1>
      <p className="page-subtitle" style={{ margin: 0, maxWidth: 640, lineHeight: 1.6 }}>
        Track what each property really earns, what you owe and what it is worth, and see what is changing over
        time, explained in plain language.
      </p>

      <ol style={{ listStyle: "none", padding: 0, margin: "24px 0", display: "grid", gap: 12 }}>
        {STEPS.map(([n, title, text]) => (
          <li key={n} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <span
              style={{
                flex: "0 0 32px",
                height: 32,
                borderRadius: 999,
                display: "grid",
                placeItems: "center",
                fontWeight: 700,
                background: "var(--color-primary-soft)",
                color: "var(--color-primary)",
              }}
            >
              {n}
            </span>
            <span>
              <strong>{title}</strong>
              <span style={{ display: "block", fontSize: 14, color: "var(--color-text-secondary)", marginTop: 2 }}>
                {text}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link to="/add">
          <button type="button" className="primary-button" style={{ width: "auto" }}>
            + Add your first property
          </button>
        </Link>
        <Link to="/settings">
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: "12px 18px", borderRadius: 12, fontWeight: 600, cursor: "pointer" }}
          >
            Restore a backup
          </button>
        </Link>
      </div>

      <p style={{ margin: "18px 0 0", fontSize: 12, color: "var(--color-text-muted)" }}>
        Your data stays in this browser. Aequitas explains your figures; it doesn&apos;t give financial advice.
      </p>
    </div>
  );
}
