import { getProperties } from "../services/storage";

import PropertyCard from "../components/PropertyCard";

export default function Portfolio() {

  const properties = getProperties();

  return (

    <div>

      <h1>Portfolio</h1>

      <br />

      {

        properties.length === 0

        ?

        <p>No properties yet.</p>

        :

        properties.map(property => (

          <PropertyCard

            key={property.id}

            property={property}

          />

        ))

      }

    </div>

  );

}