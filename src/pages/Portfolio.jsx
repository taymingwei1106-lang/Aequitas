import { useEffect, useState } from "react";

import {
  getProperties,
  deleteProperty,
} from "../services/storage";

import PropertyCard from "../components/PropertyCard";

export default function Portfolio() {

  const [properties, setProperties] = useState([]);

  useEffect(() => {
    setProperties(getProperties());
  }, []);

  function handleDelete(id) {

    deleteProperty(id);

    setProperties(getProperties());

  }

  return (

    <div>

      <h1>Portfolio</h1>

      <p style={{ marginBottom: "24px", color: "#999" }}>
        {properties.length} Properties
      </p>

      {

        properties.length === 0

        ?

        <div className="card">

          <h3>No properties yet.</h3>

          <p>
            Add your first investment to begin.
          </p>

        </div>

        :

        properties.map(property => (

          <PropertyCard

            key={property.id}

            property={property}

            onDelete={handleDelete}

          />

        ))

      }

    </div>

  );

}