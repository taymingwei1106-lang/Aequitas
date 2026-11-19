import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getProperties } from "../services/storage";
import { getFreshness } from "../utils/freshnessEngine";
import { assessPortfolio } from "../utils/assessmentEngine";
import { calculateDashboard } from "../utils/dashboard";
import { formatRM, getMonthlyCashflow } from "../utils/propertyFinancials";

import PropertyCard from "../components/PropertyCard";
import Card from "../components/Card";

/*
 * Portfolio — "Manage properties"
 *
 * Home answers "how is my portfolio doing?". This page is for working
 * with the properties themselves: a compact summary, then one card per
 * property with its status, key figures and check-in state.
 *
 * All figures come from the shared engines, so they match Home and the
 * property pages.
 */

const SORTS = {
  status: "Needs attention first",
  cashflow: "Cashflow: lowest first",
  name: "Name A–Z",
};

function SummaryFigure({ label, value, note, color }) {
  return (
    <div>
      <div className="card-label">{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6, color: color || "inherit" }}>
        {value}
      </div>
      {note && (
        <div style={{ fontSize: 12, marginTop: 4, color: "var(--color-text-muted)" }}>{note}</div>
      )}
    </div>
  );
}

export default function Portfolio() {
  const [properties] = useState(() => getProperties());
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("status");

  const portfolio = useMemo(() => assessPortfolio(properties), [properties]);
  const dashboard = useMemo(() => calculateDashboard(properties), [properties]);

  const totalCashflow = useMemo(
    () => properties.reduce((sum, p) => sum + getMonthlyCashflow(p).cashflow, 0),
    [properties]
  );

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();

    const list = properties
      .map((property, index) => ({
        property,
        assessment: portfolio.assessments[index],
        freshness: getFreshness(property),
      }))
      .filter(({ property }) =>
        !query || String(property.projectName || "").toLowerCase().includes(query)
      );

    const rank = { review: 0, watch: 1, unknown: 2, ok: 3 };

    return list.sort((a, b) => {
      if (sort === "cashflow") {
        return a.assessment.figures.cashflow - b.assessment.figures.cashflow;
      }
      if (sort === "name") {
        return String(a.property.projectName || "").localeCompare(
          String(b.property.projectName || "")
        );
      }
      return (
        rank[a.assessment.status] - rank[b.assessment.status] ||
        a.assessment.figures.cashflow - b.assessment.figures.cashflow
      );
    });
  }, [properties, portfolio, search, sort]);

  const purchaseBasedCount = dashboard.valuedAtPurchasePrice.length;
  const equity = dashboard.totalValue - dashboard.totalLoan;
  const dueCount = rows.filter((r) => r.freshness.status !== "up-to-date").length;

  return (
    <div>
      <section className="page-header">
        <p className="page-subtitle">Property Portfolio</p>
        <h1 className="page-title">Portfolio</h1>
        <p className="page-subtitle">Manage your properties and keep their records up to date.</p>
      </section>

      {properties.length > 0 && (
        <Card>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
              gap: 20,
            }}
          >
            <SummaryFigure
              label="Total value"
              value={formatRM(dashboard.totalValue)}
              note={
                purchaseBasedCount === 0
                  ? "Market values"
                  : purchaseBasedCount === properties.length
                  ? "Purchase prices (no valuations)"
                  : `${purchaseBasedCount} at purchase price`
              }
            />
            <SummaryFigure label="Outstanding loan" value={formatRM(dashboard.totalLoan)} />
            <SummaryFigure label="Equity" value={formatRM(equity)} />
            <SummaryFigure
              label="Monthly cashflow"
              value={formatRM(totalCashflow)}
              color={totalCashflow >= 0 ? "var(--color-success)" : "var(--color-negative)"}
            />
          </div>
          <div
            style={{
              marginTop: 16,
              paddingTop: 14,
              borderTop: "1px solid var(--color-border)",
              fontSize: 13,
              color: "var(--color-text-secondary)",
            }}
          >
            {properties.length} {properties.length === 1 ? "property" : "properties"}
            {portfolio.flaggedCount > 0 &&
              ` · ${portfolio.flaggedCount} to watch or review`}
            {dueCount > 0 && ` · ${dueCount} with a check-in to record`}
          </div>
        </Card>
      )}

      {properties.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 12,
            marginTop: 16,
          }}
        >
          <Link to="/share" className="portfolio-tool">
            <span aria-hidden="true">📸</span>
            <span>
              <strong>Share card</strong>
              <small>Your portfolio as an image to post or send</small>
            </span>
          </Link>
          <Link to="/tax" className="portfolio-tool">
            <span aria-hidden="true">🧾</span>
            <span>
              <strong>Tax summary</strong>
              <small>Rental income and deductions by year, to Excel</small>
            </span>
          </Link>
        </div>
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
            <p className="page-subtitle" style={{ margin: 0 }}>YOUR PROPERTIES</p>
            <h2 style={{ margin: "6px 0 0" }}>Investments</h2>
          </div>
          <Link to="/add">
            <button className="primary-button" style={{ width: "auto" }}>+ Add Property</button>
          </Link>
        </div>

        {properties.length > 1 && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              className="search-input"
              style={{ flex: "1 1 240px", margin: 0 }}
              placeholder="Search property…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label="Sort properties"
              style={{ flex: "0 1 240px" }}
            >
              {Object.entries(SORTS).map(([value, label]) => (
                <option key={value} value={value}>
                  Sort: {label}
                </option>
              ))}
            </select>
          </div>
        )}

        {properties.length === 0 ? (
          <Card>
            <h2>No Properties Yet</h2>
            <p className="page-subtitle">
              Add your first investment property to begin building your portfolio.
            </p>
            <Link to="/add">
              <button className="primary-button">Add Property</button>
            </Link>
          </Card>
        ) : rows.length === 0 ? (
          <Card>
            <h2>No matching properties</h2>
            <p className="page-subtitle">Try a different property name.</p>
          </Card>
        ) : (
          rows.map(({ property, assessment, freshness }) => (
            <PropertyCard
              key={property.id}
              property={property}
              assessment={assessment}
              freshness={freshness}
            />
          ))
        )}
      </section>
    </div>
  );
}
