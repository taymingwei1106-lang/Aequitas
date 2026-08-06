import Card from "../ui/Card";

export default function FinancialCentreCard({

    analytics,

}) {

    const financial = analytics.financial;

    return (

        <Card className="financial-centre">

            <h2 className="module-title">

                Financial Centre

            </h2>

            <div className="financial-centre-grid">

                <div>

                    <span className="metric-label">

                        Purchase Price

                    </span>

                    <h3>

                        RM {financial.purchasePrice.toLocaleString()}

                    </h3>

                </div>

                <div>

                    <span className="metric-label">

                        Market Value

                    </span>

                    <h3>

                        RM {financial.marketValue.toLocaleString()}

                    </h3>

                </div>

                <div>

                    <span className="metric-label">

                        Equity

                    </span>

                    <h3>

                        RM {financial.equity.toLocaleString()}

                    </h3>

                </div>

                <div>

                    <span className="metric-label">

                        Commitments

                    </span>

                    <h3>

                        RM {financial.commitments.toLocaleString()}

                    </h3>

                </div>

            </div>

        </Card>

    );

}