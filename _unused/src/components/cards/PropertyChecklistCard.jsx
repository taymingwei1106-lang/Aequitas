import Card from "../ui/Card";

export default function PropertyChecklistCard({

    health,

}) {

    return (

        <Card>

            <p className="metric-label">

                PROPERTY COMPLETENESS

            </p>

            <h2 className="metric-value">

                {health.score}%

            </h2>

            <div className="progress-track">

                <div

                    className="progress-fill"

                    style={{

                        width:`${health.score}%`

                    }}

                />

            </div>

            <p className="section-subtitle">

                {health.completed}

                {" / "}

                {health.total}

                {" "}fields completed

            </p>

        </Card>

    );

}