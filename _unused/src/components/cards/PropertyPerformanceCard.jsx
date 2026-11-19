import Card from "../ui/Card";

export default function PropertyPerformanceCard({

    analytics,

}) {

    const performance = analytics.performance;

    return (

        <Card className="performance-card">

            <h2 className="module-title">

                Performance

            </h2>

            <div className="performance-grid">

                <div>

                    <span className="metric-label">

                        Score

                    </span>

                    <h1>

                        {performance.score}

                    </h1>

                </div>

                <div>

                    <span className="metric-label">

                        Grade

                    </span>

                    <h1>

                        {performance.grade}

                    </h1>

                </div>

                <div>

                    <span className="metric-label">

                        Yield

                    </span>

                    <h2>

                        {performance.yield.toFixed(2)}%

                    </h2>

                </div>

                <div>

                    <span className="metric-label">

                        Health

                    </span>

                    <h2>

                        {performance.health}%

                    </h2>

                </div>

            </div>

        </Card>

    );

}