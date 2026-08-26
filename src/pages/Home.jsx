import { Link } from "react-router-dom";

import Card from "../components/Card";
import ExecutiveBriefCard from "../components/cards/ExecutiveBriefCard";

import useIntelligence from "../hooks/useIntelligence";
import formatCurrency from "../utils/formatCurrency";

export default function Home() {
  const { portfolio, executive } = useIntelligence();

  const totalProperties =
    portfolio?.properties?.length ?? 0;

  const totalValue =
    executive?.portfolioValue ?? 0;

  const totalEquity =
    executive?.totalEquity ?? 0;

  const monthlyRental =
    portfolio?.totalRental ?? 0;

  return (
    <div className="page-container">

      {/* Executive Brief */}

      <ExecutiveBriefCard />

      {/* Portfolio Snapshot */}

      <div
        className="portfolio-overview-grid"
        style={{
          marginTop: 24,
          marginBottom: 28,
        }}
      >

        <Card>
          <div className="card-label">
            Portfolio Value
          </div>

          <h2>
            RM {formatCurrency(totalValue)}
          </h2>
        </Card>

        <Card>
          <div className="card-label">
            Net Equity
          </div>

          <h2>
            RM {formatCurrency(totalEquity)}
          </h2>
        </Card>

        <Card>
          <div className="card-label">
            Monthly Rental
          </div>

          <h2>
            RM {formatCurrency(monthlyRental)}
          </h2>
        </Card>

        <Card>
          <div className="card-label">
            Properties
          </div>

          <h2>
            {totalProperties}
          </h2>
        </Card>

      </div>

      {/* Quick Actions */}

      <div style={{ marginTop: 12 }}>

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
                Portfolio
              </button>
            </Link>

            <Link to="/opportunities">
              <button className="btn-secondary">
                Opportunities
              </button>
            </Link>

            <Link to="/financial-toolkit">
              <button className="btn-secondary">
                Financial Toolkit
              </button>
            </Link>

          </div>

        </Card>

      </div>

    </div>
  );
}