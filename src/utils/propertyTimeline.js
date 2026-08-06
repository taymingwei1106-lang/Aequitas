export function generateTimeline(property){

    const timeline=[];

    if(property.purchaseDate){

        timeline.push({

            date:property.purchaseDate,

            title:"Property Purchased",

            description:"Purchase completed."

        });

    }

    if(property.loanApprovedDate){

        timeline.push({

            date:property.loanApprovedDate,

            title:"Loan Approved",

            description:"Financing secured."

        });

    }

    if(property.vacantPossessionDate){

        timeline.push({

            date:property.vacantPossessionDate,

            title:"Vacant Possession",

            description:"Property handed over."

        });

    }

    if(property.renovationCompletedDate){

        timeline.push({

            date:property.renovationCompletedDate,

            title:"Renovation Completed",

            description:"Ready for tenant."

        });

    }

    if(property.firstTenantDate){

        timeline.push({

            date:property.firstTenantDate,

            title:"First Tenant",

            description:"Rental income started."

        });

    }

    return timeline.sort(

        (a,b)=>

            new Date(a.date)-new Date(b.date)

    );

}