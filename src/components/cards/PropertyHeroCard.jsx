import Card from "../ui/Card";
import PropertyScoreCard from "./PropertyScoreCard";
import PropertyStatusCard from "./PropertyStatusCard";

export default function PropertyHeroCard({

    property,

    score,

    grade,

    status,

    colour,

}) {

    return (

        <Card className="property-hero-card">

            <div className="property-hero-top">

                <div>

                    <p className="metric-label">

                        PROPERTY

                    </p>

                    <h1 className="property-title">

                        {property.projectName}

                    </h1>

                </div>

            </div>

            <div className="property-hero-grid">

                <PropertyScoreCard

                    score={score}

                    grade={grade}

                />

                <PropertyStatusCard

                    status={status}

                    colour={colour}

                />

            </div>

        </Card>

    );

}