import Card from "../ui/Card";

export default function TimelineCard({

    events=[],

}){

    return(

        <Card>

            <p className="metric-label">

                PROPERTY TIMELINE

            </p>

            {

                events.length===0

                ?

                <p className="section-subtitle">

                    No milestones yet.

                </p>

                :

                <div className="timeline">

                    {

                        events.map((event,index)=>(

                            <div

                                key={index}

                                className="timeline-item"

                            >

                                <div className="timeline-dot"/>

                                <div>

                                    <strong>

                                        {event.title}

                                    </strong>

                                    <p>

                                        {event.description}

                                    </p>

                                    <small>

                                        {event.date}

                                    </small>

                                </div>

                            </div>

                        ))

                    }

                </div>

            }

        </Card>

    );

}