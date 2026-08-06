import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getProperties,
  deleteProperty,
} from "../services/storage";

import PropertyCard from "../components/PropertyCard";

import Card from "../components/Card";

import formatCurrency from "../utils/formatCurrency";

export default function Portfolio() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    setProperties(getProperties());
  }, []);

  function handleDelete(id) {
    deleteProperty(id);
    setProperties(getProperties());
  }

  const totalPurchase = properties.reduce(
    (sum, property) =>
      sum + Number(property.purchasePrice || 0),
    0
  );

  const totalLoan = properties.reduce(
    (sum, property) =>
      sum + Number(property.outstandingLoan || 0),
    0
  );

  const totalRental = properties.reduce(
    (sum, property) =>
      sum + Number(property.monthlyRental || 0),
    0
  );

  return (
    <div>

      {/* Header */}

      <section className="page-header">

        <p className="page-subtitle">
          Property Portfolio
        </p>

        <h1 className="page-title">
          Portfolio Overview
        </h1>

        <p className="page-subtitle">
          Monitor every investment from one place.
        </p>

      </section>

      {/* Summary */}

<div className="portfolio-summary-grid">

        <Card>

          <div className="card-label">
            Properties
          </div>

          <h2>{properties.length}</h2>

        </Card>

        <Card>

          <div className="card-label">
            Purchase Value
          </div>

          <h2>
            RM {formatCurrency(totalPurchase)}
          </h2>

        </Card>

        <Card>

          <div className="card-label">
            Outstanding Loan
          </div>

          <h2>
            RM {formatCurrency(totalLoan)}
          </h2>

        </Card>

        <Card>

          <div className="card-label">
            Monthly Rental
          </div>

          <h2>
            RM {formatCurrency(totalRental)}
          </h2>

        </Card>

      </div>

      {/* Search */}

<input
  className="search-input"
  placeholder="Search property..."
/>

      {/* Property List */}

      {properties.length === 0 ? (

        <Card>

          <h2>No Properties Yet</h2>

          <p className="page-subtitle">
            Add your first investment property
            to begin building your portfolio.
          </p>

<div className="empty-state-actions">

            <Link to="/add">

              <button className="primary-button">

                Add Property

              </button>

            </Link>

          </div>

        </Card>

      ) : (

        <>
          {properties.map((property) => (

            <PropertyCard
              key={property.id}
              property={property}
              onDelete={handleDelete}
            />

          ))}
        </>

      )}

    </div>
  );
}