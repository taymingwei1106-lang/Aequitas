import { useNavigate } from "react-router-dom";

import formatCurrency from "../utils/formatCurrency";

export default function PropertyCard({ property }) {

  const navigate = useNavigate();

  return (

    <div
      className="card property-card"
      onClick={() => navigate(`/property/${property.id}`)}
    >

      <h2>{property.projectName}</h2>

      <p>

        Purchase Price

      </p>

      <h3>

        RM {formatCurrency(property.purchasePrice)}

      </h3>

      <p>

        Monthly Rental

      </p>

      <h3>

        RM {formatCurrency(property.monthlyRental)}

      </h3>

    </div>

  );

}