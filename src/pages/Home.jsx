import Card from "../components/Card";

import { getProperties } from "../services/storage";

import { calculateDashboard } from "../utils/dashboard";

import formatCurrency from "../utils/formatCurrency";

export default function Home() {

  const properties = getProperties();

  const dashboard = calculateDashboard(properties);

  return (
    <>

      <h2 className="greeting">
        Welcome Back 👋
      </h2>

      <h1 className="username">
        Aequitas
      </h1>

      <Card>

        <span className="card-label">
          Portfolio Value
        </span>

        <h2 className="portfolio-value">
          RM {formatCurrency(dashboard.totalValue)}
        </h2>

      </Card>

      <Card>

        <span className="card-label">
          Outstanding Loan
        </span>

        <h2>
          RM {formatCurrency(dashboard.totalLoan)}
        </h2>

      </Card>

      <Card>

        <span className="card-label">
          Monthly Rental
        </span>

        <h2>
          RM {formatCurrency(dashboard.totalRental)}
        </h2>

      </Card>

      <Card>

        <span className="card-label">
          Total Properties
        </span>

        <h2>
          {dashboard.totalProperties}
        </h2>

      </Card>

    </>
  );

}