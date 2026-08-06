import { useNavigate } from "react-router-dom";
import formatCurrency from "../utils/formatCurrency";

export default function PropertyCard({ property }) {
  const navigate = useNavigate();

  const purchasePrice = Number(property.purchasePrice || 0);
  const outstandingLoan = Number(property.outstandingLoan || 0);
  const monthlyRental = Number(property.monthlyRental || 0);

  const estimatedCashflow = monthlyRental;

  const health =
    purchasePrice === 0
      ? 60
      : Math.min(
          95,
          Math.max(
            55,
            Math.round(
              100 - (outstandingLoan / purchasePrice) * 35
            )
          )
        );

  return (
    <div
      className="card property-card"
      onClick={() => navigate(`/property/${property.id}`)}
    >
      {/* Header */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
            }}
          >
            🏢 {property.projectName}
          </h2>

          <p
            className="page-subtitle"
            style={{
              marginTop: 8,
            }}
          >
            Investment Property
          </p>
        </div>

        <div
          style={{
            background: "var(--color-primary-soft)",
            color: "var(--color-primary)",
            padding: "8px 14px",
            borderRadius: 999,
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          {health}% Health
        </div>
      </div>

      <div style={{ height: 24 }} />

      {/* Metrics */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 18,
        }}
      >
        <div>
          <div className="card-label">
            Purchase
          </div>

          <h3>
            RM {formatCurrency(purchasePrice)}
          </h3>
        </div>

        <div>
          <div className="card-label">
            Loan
          </div>

          <h3>
            RM {formatCurrency(outstandingLoan)}
          </h3>
        </div>

        <div>
          <div className="card-label">
            Rental
          </div>

          <h3>
            RM {formatCurrency(monthlyRental)}
          </h3>
        </div>

        <div>
          <div className="card-label">
            Cashflow
          </div>

          <h3
            style={{
              color:
                estimatedCashflow > 0
                  ? "#22c55e"
                  : "#ef4444",
            }}
          >
            {estimatedCashflow > 0 ? "+" : ""}
            RM {formatCurrency(estimatedCashflow)}
          </h3>
        </div>
      </div>

      <div
        style={{
          marginTop: 24,
          height: 8,
          background: "#23232d",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${health}%`,
            height: "100%",
            background:
              "linear-gradient(90deg,#4F8CFF,#67B7FF)",
          }}
        />
      </div>

      <div
        style={{
          marginTop: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          className="page-subtitle"
          style={{
            margin: 0,
          }}
        >
          Portfolio Health
        </span>

        <span
          style={{
            color: "var(--color-primary)",
            fontWeight: 700,
          }}
        >
          View Investment →
        </span>
      </div>
    </div>
  );
}