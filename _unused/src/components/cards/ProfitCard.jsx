import Card from "../ui/Card";

export default function ProfitCard({

    profit,

}) {

    return (

        <Card>

            <p className="metric-label">

                PROFITABILITY

            </p>

            <h2

                className="metric-value"

                style={{

                    color:

                        profit.profitable

                        ?

                        "#22C55E"

                        :

                        "#EF4444"

                }}

            >

                RM {profit.monthlyProfit.toLocaleString()}

            </h2>

            <p className="section-subtitle">

                Annual

                {" "}

                RM {profit.yearlyProfit.toLocaleString()}

            </p>

        </Card>

    );

}