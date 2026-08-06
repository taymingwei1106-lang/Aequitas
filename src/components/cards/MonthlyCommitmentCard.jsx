import Card from "../ui/Card";

export default function MonthlyCommitmentCard({

    commitments,

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

                MONTHLY COMMITMENTS

            </p>

            <h2 className="metric-value">

                RM {commitments.totalCommitments.toLocaleString()}

            </h2>

            <br />

            <Row

                label="Instalment"

                value={commitments.instalment}

            />

            <Row

                label="Maintenance"

                value={commitments.maintenance}

            />

            <Row

                label="Insurance"

                value={commitments.insurance}

            />

            <Row

                label="Quit Rent"

                value={commitments.quitRent}

            />

            <Row

                label="Assessment Tax"

                value={commitments.assessmentTax}

            />

            <Row

                label="Management"

                value={commitments.managementFee}

            />

            <Row

                label="Others"

                value={commitments.otherExpenses}

            />

        </Card>

    );

}