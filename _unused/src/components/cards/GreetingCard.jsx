import Card from "../ui/Card";
import useGreeting from "../../hooks/useGreeting";

export default function GreetingCard() {

    const greeting = useGreeting();

    return (

        <Card className="greeting-card">

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "18px",
                }}
            >

                <div
                    style={{
                        fontSize: "2.8rem",
                    }}
                >
                    {greeting.emoji}
                </div>

                <div>

                    <p className="greeting-label">

                        Property Portfolio OS

                    </p>

                    <h1 className="greeting-title">

                        {greeting.title}

                    </h1>

                    <p className="greeting-subtitle">

                        {greeting.message}

                    </p>

                </div>

            </div>

        </Card>

    );

}