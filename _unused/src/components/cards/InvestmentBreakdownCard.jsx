import Card from "../ui/Card";

export default function InvestmentBreakdownCard({

    investment,

}) {

    const Row = ({ label, value }) => (

        <div className="snapshot-row">

            <span>{label}</span>

            <strong>

                RM {value.toLocaleString()}

            </strong>

        </div>

    );

    return (

        <Card>

            <p className="metric-label">

                TOTAL INVESTMENT

            </p>

            <h2 className="metric-value">

                RM {investment.totalInvestment.toLocaleString()}

            </h2>

            <br />

            <Row

                label="Purchase"

                value={investment.purchasePrice}

            />

            <Row

                label="Renovation"

                value={investment.renovation}

            />

            <Row

                label="Legal Fees"

                value={investment.legalFees}

            />

            <Row

                label="Stamp Duty"

                value={investment.stampDuty}

            />

            <Row

                label="Furnishing"

                value={investment.furnishing}

            />

            <Row

                label="Misc."

                value={investment.miscellaneous}

            />

        </Card>

    );

}