import PortfolioValueCard from "./PortfolioValueCard";
import NetEquityCard from "./NetEquityCard";
import LoanExposureCard from "./LoanExposureCard";
import RentalPerformanceCard from "./RentalPerformanceCard";

export default function PropertyFinancialGrid({

    property,

}) {

    return (

        <div className="financial-summary-grid">

            <PortfolioValueCard

                totalValue={Number(property.purchasePrice)}

                properties={1}

            />

            <NetEquityCard

                totalValue={
                    Number(property.marketValue || property.purchasePrice)
                }

                totalLoan={
                    Number(property.outstandingLoan)
                }

            />

            <LoanExposureCard

                totalLoan={
                    Number(property.outstandingLoan)
                }

                totalValue={
                    Number(property.purchasePrice)
                }

            />

            <RentalPerformanceCard

                rental={
                    Number(property.monthlyRental)
                }

                properties={1}

            />

        </div>

    );

}