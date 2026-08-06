import CashflowCard from "./CashflowCard";
import RentalYieldCard from "./RentalYieldCard";
import CapitalGrowthCard from "./CapitalGrowthCard";
import ROICard from "./ROICard";

export default function PropertyAnalyticsGrid({

    property,

}) {

    return (

        <div className="financial-summary-grid">

            <CashflowCard

                rental={

                    Number(property.monthlyRental)

                }

                commitment={

                    Number(property.monthlyCommitment || 0)

                }

            />

            <RentalYieldCard

                purchasePrice={

                    Number(property.purchasePrice)

                }

                monthlyRental={

                    Number(property.monthlyRental)

                }

            />

            <CapitalGrowthCard

                purchasePrice={

                    Number(property.purchasePrice)

                }

                marketValue={

                    Number(property.marketValue || property.purchasePrice)

                }

            />

            <ROICard

                investment={

                    Number(property.purchasePrice)

                }

                profit={

                    Number(property.marketValue || property.purchasePrice)

                    -

                    Number(property.purchasePrice)

                }

            />

        </div>

    );

}