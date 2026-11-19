import Card from "../ui/Card";

export default function NextStepsCard({

    property,

}) {

    const tasks = [];

    if (!property.marketValue)

        tasks.push("Add current market value");

    if (!property.interestRate)

        tasks.push("Add loan interest rate");

    if (!property.maintenanceFee)

        tasks.push("Add maintenance fee");

    if (!property.insurance)

        tasks.push("Add insurance");

    if (!property.purchaseDate)

        tasks.push("Add purchase date");

    return (

        <Card>

            <p className="metric-label">

                NEXT STEPS

            </p>

            {

                tasks.length === 0

                ?

                <p className="section-subtitle">

                    🎉 Property profile is complete.

                </p>

                :

                <ul className="next-steps-list">

                    {

                        tasks.map((task,index)=>(

                            <li key={index}>

                                {task}

                            </li>

                        ))

                    }

                </ul>

            }

        </Card>

    );

}