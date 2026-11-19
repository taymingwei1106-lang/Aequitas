import Card from "../ui/Card";

export default function CashflowCard({

    rental = 0,

    commitment = 0,

}) {

    const cashflow = rental - commitment;

    const positive = cashflow >= 0;

    return (

        <Card>

            <p className="metric-label">

                Monthly Cashflow

            </p>

            <h2 className="metric-value">

                RM {cashflow.toLocaleString()}

            </h2>

            <p

                className={

                    positive

                        ? "metric-positive"

                        : "metric-negative"

                }

            >

                {positive

                    ? "Positive Cashflow"

                    : "Negative Cashflow"}

            </p>

        </Card>

    );

}