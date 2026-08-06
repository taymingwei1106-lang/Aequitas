import Card from "../ui/Card";

export default function RentalYieldCard({

    purchasePrice = 0,

    monthlyRental = 0,

}) {

    const annualRental = monthlyRental * 12;

    const yieldRate =

        purchasePrice > 0

            ? (annualRental / purchasePrice) * 100

            : 0;

    return (

        <Card>

            <p className="metric-label">

                Gross Rental Yield

            </p>

            <h2 className="metric-value">

                {yieldRate.toFixed(2)}%

            </h2>

            <p className="section-subtitle">

                Annual Rental RM {annualRental.toLocaleString()}

            </p>

        </Card>

    );

}