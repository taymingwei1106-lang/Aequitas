import Card from "../ui/Card";

export default function CapitalGrowthCard({

    purchasePrice = 0,

    marketValue = 0,

}) {

    const gain =

        marketValue - purchasePrice;

    const percentage =

        purchasePrice > 0

            ? (gain / purchasePrice) * 100

            : 0;

    return (

        <Card>

            <p className="metric-label">

                Capital Growth

            </p>

            <h2 className="metric-value">

                RM {gain.toLocaleString()}

            </h2>

            <p className="section-subtitle">

                {percentage.toFixed(2)}%

            </p>

        </Card>

    );

}