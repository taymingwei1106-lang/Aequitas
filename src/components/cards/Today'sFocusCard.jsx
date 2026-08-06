import Card from "../ui/Card";

export default function TodaysFocusCard({

    recommendation = "Keep building your portfolio.",

}) {

    return (

        <Card className="todays-focus-card">

            <p className="metric-label">

                TODAY'S FOCUS

            </p>

            <h2>

                🎯 Recommended Action

            </h2>

            <p className="section-subtitle">

                {recommendation}

            </p>

        </Card>

    );

}