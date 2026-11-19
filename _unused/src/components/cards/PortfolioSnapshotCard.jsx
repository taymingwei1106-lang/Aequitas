import Card from "../ui/Card";

export default function PortfolioSnapshotCard({

    properties,

    rental,

    equity,

}) {

    return (

        <Card>

            <p className="metric-label">

                PORTFOLIO SNAPSHOT

            </p>

            <br />

            <div className="snapshot-row">

                <span>Properties</span>

                <strong>{properties}</strong>

            </div>

            <div className="snapshot-row">

                <span>Monthly Rental</span>

                <strong>

                    RM {rental.toLocaleString()}

                </strong>

            </div>

            <div className="snapshot-row">

                <span>Net Equity</span>

                <strong>

                    RM {equity.toLocaleString()}

                </strong>

            </div>

        </Card>

    );

}