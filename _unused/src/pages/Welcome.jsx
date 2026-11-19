import useGreeting from "../hooks/useGreeting";

function Welcome() {

    const greeting = useGreeting();

    return (

        <main className="welcome">

            <div className="hero-card">

                <div className="badge">

                    PROPERTY MODULE

                </div>

                <h1>

                    Aequitas

                </h1>

                <h2>

                    {greeting.emoji} {greeting.title}

                </h2>

                <p>

                    {greeting.message}

                </p>

                <button>

                    Get Started →

                </button>

                <small>

                    Version 0.3.2

                </small>

            </div>

        </main>

    );

}

export default Welcome;