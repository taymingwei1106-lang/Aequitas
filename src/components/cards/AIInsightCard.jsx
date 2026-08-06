import Card from "../ui/Card";

export default function AIInsightCard({

    insights = [],

}) {

    return (

        <Card>

            <p className="metric-label">

                AI INSIGHTS

            </p>

            <div className="insight-list">

                {

                    insights.length === 0

                    ?

                    <p className="section-subtitle">

                        No recommendations yet.

                    </p>

                    :

                    insights.map((item,index)=>(

                        <div

                            key={index}

                            className="insight-item"

                        >

                            <span>

                                {item.emoji || "💡"}

                            </span>

                            <div>

                                <strong>

                                    {item.title}

                                </strong>

                                <p>

                                    {item.message}

                                </p>

                            </div>

                        </div>

                    ))

                }

            </div>

        </Card>

    );

}