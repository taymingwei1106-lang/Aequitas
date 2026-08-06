import { Link, useNavigate, useParams } from "react-router-dom";

import {
  getProperty,
  deleteProperty,
} from "../services/storage";

import {
  calculatePropertyAnalytics,
} from "../utils/propertyAnalyticsEngine";

import ExecutiveSummary from "../components/ExecutiveSummary";
import FinancialCentre from "../components/property/FinancialCentre";
import HealthReport from "../components/property/HealthReport";
import ExpenseBreakdown from "../components/property/ExpenseBreakdown";
import InvestmentBreakdown from "../components/property/InvestmentBreakdown";
import AIAdvisor from "../components/property/AIAdvisor";
import RiskAssessment from "../components/property/RiskAssessment";
import ForecastCard from "../components/property/ForecastCard";
import ContributionCard from "../components/property/ContributionCard";

export default function PropertyDetails() {

  const { id } = useParams();

  const navigate = useNavigate();

  const property = getProperty(id);

  if (!property) {

    return (

      <div className="page-container">

        <h2>

          Property not found.

        </h2>

        <Link
          to="/portfolio"
        >

          ← Back to Portfolio

        </Link>

      </div>

    );

  }

  const analytics =
    calculatePropertyAnalytics(property);

  function handleDelete() {

    if (
      !window.confirm(
        "Delete this property?"
      )
    )
      return;

    deleteProperty(id);

    navigate("/portfolio");

  }

  return (

    <div className="page-container">

      <Link
        to="/portfolio"
        className="page-subtitle"
      >

        ← Back to Portfolio

      </Link>

      <ExecutiveSummary

        property={property}

        analytics={analytics}

      />
            <section
        className="page-header"
        style={{
          marginTop: 24,
        }}
      >

        <p className="page-subtitle">

          Property Command Centre

        </p>

        <h2>

          Financial Overview

        </h2>

      </section>

      <FinancialCentre

        analytics={analytics}

      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(340px,1fr))",
          gap: 24,
          marginTop: 24,
        }}
      >

<HealthReport
  analytics={analytics}
/>

<RiskAssessment
  analytics={analytics}
/>

<ForecastCard
  analytics={analytics}
/>

<ContributionCard
  analytics={analytics}
/>

<ExpenseBreakdown
  property={property}
/>

<InvestmentBreakdown
  property={property}
/>

      </div>

      <div
        style={{
          marginTop: 24,
        }}
      >

        <AIAdvisor

          analytics={analytics}

        />

      </div>

      <div
        className="card"
        style={{
          marginTop: 24,
        }}
      >

        <h3
          style={{
            marginTop: 0,
          }}
        >

          📅 Timeline

        </h3>

        {
          analytics.timeline.length === 0 ? (

            <p>

              No timeline events recorded.

            </p>

          ) : (

            <ul>

              {
                analytics.timeline.map(
                  (event, index) => (
                    <li key={index}>

                      <strong>

                        {event.title}

                      </strong>

                      {" • "}

                      {event.date}

                    </li>
                  )
                )
              }

            </ul>

          )
        }

      </div>
            <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          marginTop: 28,
        }}
      >

        <button
          className="primary-button"
          onClick={() =>
            navigate(`/property/${id}/edit`)
          }
        >

          ✏ Edit Property

        </button>

        <button
          className="primary-button"
          style={{
            background: "#B91C1C",
          }}
          onClick={handleDelete}
        >

          🗑 Delete Property

        </button>

      </div>

      <div
        style={{
          height: 32,
        }}
      />
      <hr
        style={{
          marginTop: 32,
          marginBottom: 24,
          border: "none",
          borderTop: "1px solid #303544",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >

        <small
          className="page-subtitle"
        >

          Last updated from your saved investment data.

        </small>

        <Link
          to="/portfolio"
          className="page-subtitle"
        >

          ← Return to Portfolio

        </Link>

      </div>

    </div>
      );

}