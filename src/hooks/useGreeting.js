import greetings from "../utils/greetings";

export default function useGreeting() {

    const hour = new Date().getHours();

    let period = "morning";

    if (hour >= 12 && hour < 17)
        period = "afternoon";

    else if (hour >= 17 && hour < 21)
        period = "evening";

    else if (hour >= 21 || hour < 5)
        period = "night";

    const list = greetings[period];

    return list[Math.floor(Math.random() * list.length)];

}