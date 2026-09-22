import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  getProperties,
  deleteProperty,
} from "../services/storage";

import { getMonthlyCheckins } from "../services/monthlyCheckinStorage";

import PropertyCard from "../components/PropertyCard";
import Card from "../components/Card";
import formatCurrency from "../utils/formatCurrency";

function number(value) {
  return Number(value) || 0;
}

/*
 * PropertyCard shows the canonical property name from projectName.
 * Portfolio Intelligence must use the same field so both views
 * always identify the same investment.
 */
function propertyName(property) {
  return (
    property?.projectName ||
    property?.subjectName ||
    property?.propertyName ||
    property?.name ||
    property?.title ||
    "Unnamed Property"
  );
}

function cashflowFor(property) {
  return (
    number(property.monthlyRental) -
    number(property.monthlyInstalment) -
    number(property.maintenanceFee)
  );
}

function getTrend(propertyId) {
  const history = getMonthlyCheckins(propertyId)
    .filter((item) => item?.month)
    .sort((a, b) => a.month.localeCompare(b.month));

  if (history.length < 3) {
    return {
      label: "Building history",
      count: history.length,
      type: "insufficient",
    };
  }

  const recent = history.slice(-3);

  const cashflows = recent.map(
    (item) =>
      number(item.rentalReceived) -
      number(item.loanInstalment) -
      number(item.maintenancePaid) -
      number(item.otherExpenses)
  );

  const movement =
    cashflows[cashflows.length - 1] - cashflows[0];

  const tolerance = Math.max(
    Math.abs(cashflows[0]) * 0.05,
    50
  );

  if (movement > tolerance) {
    return {
      label: "Improving",
      count: history.length,
      type: "improving",
      movement,
    };
  }

  if (movement < -tolerance) {
    return {
      label: "Weakening",
      count: history.length,
      type: "weakening",
      movement,
    };
  }

  return {
    label: "Stable",
    count: history.length,
    type: "stable",
    movement,
  };
}

export default function Portfolio() {
  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState("");
  const [showIntelligence, setShowIntelligence] = useState(false);

  useEffect(() => {
    setProperties(getProperties());
  }, []);

  function handleDelete(id) {
    deleteProperty(id);
    setProperties(getProperties());
  }

  const summary = useMemo(() => {
    const purchaseValue = properties.reduce(
      (sum, property) =>
        sum + number(property.purchasePrice),
      0
    );

    const outstandingLoan = properties.reduce(
      (sum, property) =>
        sum + number(property.outstandingLoan),
      0
    );

    const monthlyRental = properties.reduce(
      (sum, property) =>
        sum + number(property.monthlyRental),
      0
    );

    const monthlyInstalments = properties.reduce(
      (sum, property) =>
        sum + number(property.monthlyInstalment),
      0
    );

    const monthlyMaintenance = properties.reduce(
      (sum, property) =>
        sum + number(property.maintenanceFee),
      0
    );

    const monthlyCashflow =
      monthlyRental -
      monthlyInstalments -
      monthlyMaintenance;

    const equity = purchaseValue - outstandingLoan;

    return {
      purchaseValue,
      outstandingLoan,
      monthlyRental,
      monthlyCashflow,
      equity,
    };
  }, [properties]);

  const insights = useMemo(
    () =>
      properties.map((property) => ({
        property,
        name: propertyName(property),
        cashflow: cashflowFor(property),
        trend: getTrend(property.id),
      })),
    [properties]
  );

  const filteredProperties = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return properties;

    return properties.filter((property) =>
      propertyName(property)
        .toLowerCase()
        .includes(query)
    );
  }, [properties, search]);

  const attentionCount = insights.filter(
    (item) =>
      item.cashflow < 0 ||
      item.trend.type === "weakening"
  ).length;

  return (
    <div>
      <section className="page-header">
        <p className="page-subtitle">
          Property Portfolio
        </p>

        <h1 className="page-title">
          Portfolio Overview
        </h1>

        <p className="page-subtitle">
          Your investment position at a glance.
        </p>
      </section>

      <div className="portfolio-summary-grid">
        <Card>
          <div className="card-label">Properties</div>
          <h2>{properties.length}</h2>
        </Card>

        <Card>
          <div className="card-label">Purchase Value</div>
          <h2>
            RM {formatCurrency(summary.purchaseValue)}
          </h2>
        </Card>

        <Card>
          <div className="card-label">
            Outstanding Loan
          </div>
          <h2>
            RM {formatCurrency(summary.outstandingLoan)}
          </h2>
        </Card>

        <Card>
          <div className="card-label">
            Monthly Cashflow
          </div>
          <h2
            style={{
              color:
                summary.monthlyCashflow >= 0
                  ? "#22C55E"
                  : "#F97316",
            }}
          >
            RM {formatCurrency(summary.monthlyCashflow)}
          </h2>
        </Card>
      </div>

      {properties.length > 0 && (
        <section style={{ marginTop: 24 }}>
          <div
            style={{
              border: "1px solid #303544",
              borderRadius: 14,
              padding: 18,
              background: "#151B26",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div>
                <p
                  className="page-subtitle"
                  style={{ margin: 0 }}
                >
                  PORTFOLIO INTELLIGENCE
                </p>

                <h3 style={{ margin: "6px 0 0" }}>
                  How is my portfolio doing?
                </h3>

                <p
                  className="page-subtitle"
                  style={{
                    marginBottom: 0,
                    marginTop: 6,
                  }}
                >
                  A quick view first. Deeper analysis is optional.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowIntelligence((value) => !value)
                }
                className="primary-button"
                style={{ minWidth: 140 }}
              >
                {showIntelligence
                  ? "Hide details"
                  : "View details"}
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(170px,1fr))",
                gap: 12,
                marginTop: 18,
              }}
            >
              <div
                style={{
                  padding: 14,
                  borderRadius: 10,
                  background: "#1D2533",
                }}
              >
                <div className="card-label">
                  Portfolio Equity
                </div>

                <strong>
                  RM {formatCurrency(summary.equity)}
                </strong>
              </div>

              <div
                style={{
                  padding: 14,
                  borderRadius: 10,
                  background: "#1D2533",
                }}
              >
                <div className="card-label">
                  Monthly Rental
                </div>

                <strong>
                  RM {formatCurrency(summary.monthlyRental)}
                </strong>
              </div>

              <div
                style={{
                  padding: 14,
                  borderRadius: 10,
                  background: "#1D2533",
                }}
              >
                <div className="card-label">
                  Needs Review
                </div>

                <strong>{attentionCount}</strong>
              </div>
            </div>

            {showIntelligence && (
              <div style={{ marginTop: 20 }}>
                <div
                  style={{
                    display: "grid",
                    gap: 10,
                  }}
                >
                  {insights.map((item) => (
                    <div
                      key={item.property.id}
                      style={{
                        padding: 14,
                        borderRadius: 10,
                        background: "#11131A",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 16,
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <strong>
                          {item.name}
                        </strong>

                        <div
                          className="page-subtitle"
                          style={{ marginTop: 5 }}
                        >
                          {item.trend.count} month
                          {item.trend.count === 1
                            ? ""
                            : "s"} recorded
                        </div>
                      </div>

                      <div
                        style={{
                          textAlign: "right",
                        }}
                      >
                        <strong
                          style={{
                            color:
                              item.cashflow >= 0
                                ? "#22C55E"
                                : "#F97316",
                          }}
                        >
                          RM{" "}
                          {formatCurrency(
                            item.cashflow
                          )}
                        </strong>

                        <div
                          className="page-subtitle"
                          style={{
                            marginTop: 5,
                          }}
                        >
                          {item.trend.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <p
                  className="page-subtitle"
                  style={{
                    marginTop: 16,
                    marginBottom: 0,
                  }}
                >
                  These are signals for review, not automatic
                  instructions to buy, sell, refinance, or change
                  strategy.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      <section style={{ marginTop: 28 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          <div>
            <p
              className="page-subtitle"
              style={{ margin: 0 }}
            >
              YOUR PROPERTIES
            </p>

            <h2 style={{ margin: "6px 0 0" }}>
              Investments
            </h2>
          </div>

          <Link to="/add">
            <button className="primary-button">
              + Add Property
            </button>
          </Link>
        </div>

        <input
          className="search-input"
          placeholder="Search property..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        {properties.length === 0 ? (
          <Card>
            <h2>No Properties Yet</h2>

            <p className="page-subtitle">
              Add your first investment property to begin
              building your portfolio.
            </p>

            <Link to="/add">
              <button className="primary-button">
                Add Property
              </button>
            </Link>
          </Card>
        ) : filteredProperties.length === 0 ? (
          <Card>
            <h2>No matching properties</h2>

            <p className="page-subtitle">
              Try a different property name.
            </p>
          </Card>
        ) : (
          filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onDelete={handleDelete}
            />
          ))
        )}
      </section>
    </div>
  );
}
