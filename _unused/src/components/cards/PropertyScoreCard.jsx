import Card from "../ui/Card";

export default function PropertyScoreCard({

    score,

    grade,

}) {

    const colour =

        score >= 80

            ? "#22C55E"

            : score >= 60

            ? "#F59E0B"

            : "#EF4444";

    return (

        <Card>

            <p className="metric-label">

                PROPERTY SCORE

            </p>

            <h1

                style={{

                    fontSize:56,

                    margin:"8px 0",

                    color:colour,

                }}

            >

                {score}

            </h1>

            <h3>

                Grade {grade}

            </h3>

            <p className="section-subtitle">

                Overall investment quality.

            </p>

        </Card>

    );

}