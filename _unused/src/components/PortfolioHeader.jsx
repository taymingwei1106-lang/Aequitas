import SectionHeader from "./SectionHeader";
import Badge from "./Badge";

export default function PortfolioHeader({

  totalProperties,

  portfolioValue,

}) {

  return (

    <SectionHeader

      title="Portfolio"

      subtitle={`RM ${portfolioValue.toLocaleString()}`}

      action={

        <Badge color="blue">

          {totalProperties} Properties

        </Badge>

      }

    />

  );

}