import Card from "../ui/Card";

export default function ROICard({

    investment = 0,

    profit = 0,

}) {

    const roi =

        investment > 0

            ? (profit / investment) * 100

            : 0;

    return (

        <Card>

            <p className="metric-label">

                ROI

            </p>

            <h2 className="metric-value">

                {roi.toFixed(2)}%

            </h2>

            <p className="section-subtitle">

                Return on Investment

            </p>

        </Card>

    );

}