import Card from "../ui/Card";

export default function NetCashflowCard({

    rental,

    commitments,

}) {

    const cashflow =
        rental - commitments;

    const positive =
        cashflow >= 0;

    return (

        <Card>

            <p className="metric-label">

                NET CASHFLOW

            </p>

            <h1
                style={{
                    color:
                        positive
                            ? "#22C55E"
                            : "#EF4444",
                    margin: "12px 0",
                }}
            >

                RM {cashflow.toLocaleString()}

            </h1>

            <p className="section-subtitle">

                {

                    positive

                    ?

                    "Positive monthly cashflow"

                    :

                    "Negative monthly cashflow"

                }

            </p>

        </Card>

    );

}