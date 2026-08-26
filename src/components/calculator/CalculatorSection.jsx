import { useState } from "react";

export default function CalculatorSection({
  title,
 emoji,
  children,
  defaultOpen = false,
}) {

  const [open, setOpen] = useState(defaultOpen);

  return (

    <div
      className="card"
      style={{
        marginBottom: 24,
        overflow: "hidden",
      }}
    >

      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "6px 0",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "inherit",
        }}
      >

        <div>

          <h2
            style={{
              margin: 0,
              fontSize: 22,
            }}
          >
            {emoji} {title}
          </h2>

        </div>

        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "var(--color-primary)",
          }}
        >
          {open ? "−" : "+"}
        </div>

      </button>

      {open && (

        <div
          style={{
            marginTop: 24,
            borderTop: "1px solid rgba(255,255,255,.08)",
            paddingTop: 24,
          }}
        >

          {children}

        </div>

      )}

    </div>

  );

}