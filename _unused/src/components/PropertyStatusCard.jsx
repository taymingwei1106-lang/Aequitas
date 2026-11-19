import Card from "../ui/Card";

export default function PropertyStatusCard({

    status,

    colour,

}) {

    return (

        <Card>

            <p className="metric-label">

                PROPERTY STATUS

            </p>

            <h2

                style={{

                    color: colour,

                    marginTop: 8,

                }}

            >

                {status}

            </h2>

            <p className="section-subtitle">

                Overall investment condition based on current financial data.

            </p>

        </Card>

    );

}