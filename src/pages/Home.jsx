import { Link } from "react-router-dom";

import Card from "../components/Card";

import GreetingCard from "../components/cards/GreetingCard";
import FinancialSummary from "../components/FinancialSummary";
import PortfolioHealthCard from "../components/PortfolioHealthCard";
import RecommendationCard from "../components/RecommendationCard";
import PortfolioSnapshotCard from "../components/cards/PortfolioSnapshotCard";
import TodaysFocusCard from "../components/cards/Today'sFocusCard";

import { getProperties } from "../services/storage";
import { calculateDashboard } from "../utils/dashboard";
import { generatePortfolioInsights } from "../utils/portfolioInsights";
import formatCurrency from "../utils/formatCurrency";

export default function Home() {

  const properties = getProperties();

  const dashboard = calculateDashboard(properties);

  const intelligence =
    generatePortfolioInsights(properties);

  const equity =
    dashboard.totalValue - dashboard.totalLoan;

  return (

    <div className="page-container">

      <GreetingCard />

      <PortfolioHealthCard

        health={intelligence.health}

        completeness={intelligence.completeness}

      />

      <div style={{ marginTop: 24 }}>

        <FinancialSummary

          value={`RM ${formatCurrency(dashboard.totalValue)}`}

          loan={`RM ${formatCurrency(dashboard.totalLoan)}`}

          rental={`RM ${formatCurrency(dashboard.totalRental)}`}

          equity={`RM ${formatCurrency(equity)}`}

        />

      </div>

      <div
        className="portfolio-overview-grid"
        style={{ marginTop: 24 }}
      >

        <Card>

          <div className="card-label">

            Total Properties

          </div>

          <h2>

            {dashboard.totalProperties}

          </h2>

        </Card>

        <Card>

          <div className="card-label">

            Average Portfolio Value

          </div>

          <h2>

            RM {

              dashboard.totalProperties > 0

                ? formatCurrency(

                    dashboard.totalValue /

                    dashboard.totalProperties

                  )

                : "0"

            }

          </h2>

        </Card>

      </div>

      <div style={{ marginTop: 28 }}>

        <Card>

          <h3 style={{ marginTop: 0 }}>

            🧠 Portfolio Intelligence

          </h3>

          <div className="insight-list">

{intelligence.insights.map((item,index)=>(

<div
key={index}
className="insight-item"
>

<span>

{item.emoji}

</span>

<div>

<strong>

{item.title}

</strong>

<p>

{item.message}

</p>

</div>

</div>

))}
          </div>

        </Card>

      </div>

      <RecommendationCard

        title="Recommended Next Step"

        description={

          intelligence.recommendations[0] ||

          "Continue building your portfolio."

        }

        buttonText="Open Portfolio"

        onClick={() =>

          window.location.href = "/portfolio"

        }

      />

      <div style={{ marginTop: 24 }}>

        <Card>

          <h3 style={{ marginTop: 0 }}>

            Quick Actions

          </h3>

          <div className="action-panel">

            <Link to="/add">

              <button className="primary-button">

                + Add Property

              </button>

            </Link>

            <Link to="/portfolio">

              <button className="btn-secondary">

                View Portfolio

              </button>

            </Link>

          </div>

        </Card>

      </div>

    </div>

  );

}