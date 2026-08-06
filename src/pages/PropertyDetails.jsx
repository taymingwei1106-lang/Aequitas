import { Link, useNavigate, useParams } from "react-router-dom";

import { getProperty, deleteProperty } from "../services/storage";

import formatCurrency from "../utils/formatCurrency";

import { calculatePropertyAnalytics } from "../utils/propertyAnalyticsEngine";

export default function PropertyDetails() {

  const { id } = useParams();

  const navigate = useNavigate();

  const property = getProperty(id);

  if (!property) {

    return (

      <div>

        <h2>Property not found.</h2>

        <Link to="/portfolio">

          ← Back to Portfolio

        </Link>

      </div>

    );

  }

  const analytics =
    calculatePropertyAnalytics(property);

  const purchase =
    analytics.investment.purchasePrice;

  const marketValue =
    analytics.equity.market;

  const loan =
    analytics.equity.loan;

  const equity =
    analytics.equity.equity;

  const rental =
    analytics.cashflow.rental;

  const commitments =
    analytics.commitments.totalCommitments;

  const cashflow =
    analytics.profit.monthlyProfit;

  const score =
    analytics.score.score;

  const grade =
    analytics.score.grade;

  const status =
    analytics.status.status;

  const health =
    analytics.health.score;

  function handleDelete() {

    if (!window.confirm("Delete this property?"))
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

      <section
        className="page-header"
        style={{ marginTop: 20 }}
      >

        <p className="page-subtitle">

          Property Overview

        </p>

        <h1 className="page-title">

          🏢 {property.projectName}

        </h1>

        <p className="page-subtitle">

          Your investment dashboard.

        </p>

      </section>

      <div
        className="card"
        style={{ marginBottom: 24 }}
      >

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 20,
          }}
        >

          <div>

            <h2
              style={{
                margin: 0,
              }}
            >

              Investment Health

            </h2>

            <p className="page-subtitle">

              Score {score} • Grade {grade} • {status}

            </p>

          </div>

          <div
            style={{
              textAlign: "right",
            }}
          >

            <h1
              style={{
                margin: 0,
                color: "var(--color-primary)",
              }}
            >

              {health}%

            </h1>

            <small>

              Profile Completeness

            </small>

          </div>

        </div>

        <div
          style={{
            height: 10,
            marginTop: 18,
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
                "linear-gradient(90deg,#4f8cff,#6db8ff)",
            }}
          />

        </div>

      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: 20,
        }}
      >

        <div className="card">

          <div className="card-label">

            Purchase Price

          </div>

          <h2>

            RM {formatCurrency(purchase)}

          </h2>

        </div>

        <div className="card">

          <div className="card-label">

            Market Value

          </div>

          <h2>

            RM {formatCurrency(marketValue)}

          </h2>

        </div>

        <div className="card">

          <div className="card-label">

            Outstanding Loan

          </div>

          <h2>

            RM {formatCurrency(loan)}

          </h2>

        </div>

        <div className="card">

          <div className="card-label">

            Net Equity

          </div>

          <h2>

            RM {formatCurrency(equity)}

          </h2>

        </div>

        <div className="card">

          <div className="card-label">

            Monthly Rental

          </div>

          <h2>

            RM {formatCurrency(rental)}

          </h2>

        </div>

        <div className="card">

          <div className="card-label">

            Monthly Commitments

          </div>

          <h2>

            RM {formatCurrency(commitments)}

          </h2>

        </div>

        <div className="card">

          <div className="card-label">

            Net Cashflow

          </div>

          <h2
            style={{
              color:
                cashflow >= 0
                  ? "#22C55E"
                  : "#EF4444",
            }}
          >

            RM {formatCurrency(cashflow)}

          </h2>

        </div>

        <div className="card">

          <div className="card-label">

            Rental Yield

          </div>

          <h2>

            {analytics.rentalYield.grossYield.toFixed(2)}%

          </h2>

        </div>

      </div>

      <div
        className="card"
        style={{ marginTop: 24 }}
      >

        <h3
          style={{
            marginTop: 0,
          }}
        >

          AI Property Insights

        </h3>

        {

          analytics.ai.length === 0

          ?

          <p>

            No recommendations yet.

          </p>

          :

          <ul>

            {

              analytics.ai.map(

                (item,index)=>(

                  <li key={index}>

                    <strong>

                      {item.title}

                    </strong>

                    {" — "}

                    {item.message}

                  </li>

                )

              )

            }

          </ul>

        }

      </div>

      <div
        className="card"
        style={{ marginTop: 24 }}
      >

        <h3
          style={{
            marginTop: 0,
          }}
        >

          Timeline

        </h3>

        {

          analytics.timeline.length === 0

          ?

          <p>

            No timeline events recorded.

          </p>

          :

          <ul>

            {

              analytics.timeline.map(

                (event,index)=>(

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

    </div>

  );

}