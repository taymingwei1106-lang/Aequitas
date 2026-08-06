export function generatePropertyAI(property){

    const insights=[];

    const purchase=

        Number(property.purchasePrice||0);

    const market=

        Number(property.marketValue||purchase);

    const loan=

        Number(property.outstandingLoan||0);

    const rental=

        Number(property.monthlyRental||0);

    if(!property.marketValue){

        insights.push({

            emoji:"📈",

            title:"Missing Market Value",

            message:"Add the latest market value to unlock capital gain analysis."

        });

    }

    if(!property.interestRate){

        insights.push({

            emoji:"🏦",

            title:"Missing Interest Rate",

            message:"Add your interest rate to estimate refinancing opportunities."

        });

    }

    if(rental>0 && purchase>0){

        const yieldRate=

            (rental*12/purchase)*100;

        if(yieldRate<4){

            insights.push({

                emoji:"⚠️",

                title:"Rental Yield",

                message:"Current rental yield is below 4%. Consider reviewing rental pricing."

            });

        }else{

            insights.push({

                emoji:"✅",

                title:"Healthy Rental Yield",

                message:"Rental yield is within a healthy range."

            });

        }

    }

    if(market>purchase){

        insights.push({

            emoji:"📈",

            title:"Capital Appreciation",

            message:"Your property has appreciated in value."

        });

    }

    if(loan>purchase*0.8){

        insights.push({

            emoji:"💳",

            title:"High Debt Ratio",

            message:"Outstanding loan exceeds 80% of purchase price."

        });

    }

    return insights;

}