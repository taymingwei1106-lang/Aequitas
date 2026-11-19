/*
 * Aequitas Investor Guides — content
 *
 * Each guide follows the six-part structure shown on the Guides page.
 *
 * status:
 *   "draft"    — researched from the listed sources, not yet reviewed by
 *                the Aequitas owner. Shown with a Draft label.
 *   "reviewed" — checked and approved for publishing.
 *
 * lastChecked: the date the facts were last checked against the sources.
 * Rules and rates in Malaysia change; re-check before changing a guide to
 * "reviewed" and whenever lastChecked is more than a year old.
 */

export const GUIDE_CATEGORIES = [
  {
    id: "utilities",
    title: "Utilities & Tariffs",
    description: "Utility accounts, tariffs and service arrangements.",
  },
  {
    id: "administration",
    title: "Property Administration",
    description: "Ownership taxes, tenancy paperwork and other recurring obligations.",
  },
  {
    id: "financing",
    title: "Financing",
    description: "Understanding your loan, statements and balances.",
  },
  {
    id: "operations",
    title: "Investment Operations",
    description: "Running a rental property, from tax to selling.",
  },
];

export const GUIDES = [
  {
    id: "commercial-to-domestic-electricity",
    category: "utilities",
    title: "Serviced apartment or SOHO on a commercial electricity tariff",
    summary:
      "Units built on commercial land are connected on TNB's commercial tariff by default. If the unit is lived in as a home, the account holder can apply to switch it to the domestic tariff.",
    status: "draft",
    lastChecked: "2026-11-19",
    sections: {
      overview: [
        "Serviced apartments, SOHO, SOVO and SOFO units are usually built on land gazetted for commercial use, so TNB connects them on a low-voltage commercial (non-domestic) tariff by default.",
        "TNB's own tariff guidance says that when such a unit is used as a private dwelling, the owner may apply to change it to the domestic tariff. Commercial rates are typically higher per unit of electricity, so for a tenanted home this directly affects your tenant's bills, or yours if utilities are included in the rent.",
      ],
      check: [
        "Your latest TNB bill: the tariff category shown on it (domestic or commercial / non-domestic).",
        "Whose name the TNB account is in. The application is made by the account holder, so a tenant who holds the account would need to apply.",
        "That the unit is actually used as a residence. TNB can change a tariff based on the actual activity at the premises and may verify on site.",
        "Whether your management office or JMB is already organising a bulk application for the building.",
      ],
      documents: [
        "TNB account number (from the bill).",
        "Identification of the account holder.",
        "Proof of ownership or occupation if requested, such as the SPA, title, or tenancy agreement.",
      ],
      steps: [
        "Log in to the myTNB portal or app as the account holder (or visit a Kedai Tenaga).",
        "Find the change-of-tariff application and choose the domestic premise type that matches the unit.",
        "Submit the form and keep the reference number.",
        "Check your next bills, or the account in myTNB, to confirm the tariff has changed.",
        "If you pay the bill or include utilities in the rent, update your expected monthly costs in Aequitas.",
      ],
      confirm: [
        "Tenaga Nasional Berhad (myTNB, Kedai Tenaga, or the TNB careline).",
        "Your building management or JMB, for any building-wide arrangement.",
      ],
      notes: [
        "Approval is at TNB's discretion and depends on how the premises are actually used.",
        "TNB changed its domestic tariff structure from July 2025. Check current rates on TNB's website rather than older articles.",
        "Water and sewerage (Indah Water) charges for commercial-titled units may follow their own rules. Ask those providers separately.",
        "This guide covers Peninsular Malaysia (TNB). Sabah and Sarawak have different utility providers.",
      ],
    },
    sources: [
      {
        label: "TNB — Electricity tariff classification",
        url: "https://www.tnb.com.my/residential/pricing-tariffs",
      },
      {
        label: "TNB — For commercial consumers (definition includes service apartments)",
        url: "https://www.tnb.com.my/commercial-industrial/for-commercial",
      },
    ],
  },

  {
    id: "quit-rent-assessment",
    category: "administration",
    title: "Quit rent and assessment tax",
    summary:
      "Two recurring ownership taxes: quit rent (cukai tanah / cukai petak) to the state land office, and assessment tax (cukai taksiran / cukai pintu) to the local council.",
    status: "draft",
    lastChecked: "2026-11-19",
    sections: {
      overview: [
        "Quit rent (cukai tanah, or cukai petak for strata units where parcel rent applies) is an annual land tax charged by the state land office (PTG) to the registered owner.",
        "Assessment tax (cukai taksiran, often called cukai pintu) is charged by the local council (for example DBKL, MBPJ or MBSA) based on the property's assessed annual value, and is usually billed in two half-yearly instalments.",
        "Both are the owner's responsibility even when the property is tenanted, and both are commonly deductible against rental income (see the rental income guide).",
      ],
      check: [
        "Which land office and which local council your property falls under.",
        "Whether your strata unit has its own parcel rent account or the quit rent is still billed to the developer or management body.",
        "The due dates on your notices. Most Peninsular states set 31 May for quit rent; assessment instalments are commonly due by the end of February and the end of August. Some authorities use different dates.",
        "Whether the council now bills electronically only. Some councils no longer post paper bills.",
      ],
      documents: [
        "Quit rent / parcel rent account number (on the notice or the land office portal).",
        "Assessment account number (on the council bill).",
        "Payment receipts. Keep them for your tax records.",
      ],
      steps: [
        "Find both account numbers on past bills or through the land office and council portals.",
        "Note the due dates from your notices and set reminders ahead of them.",
        "Pay through the official portal, FPX/JomPAY, or the counter, as your authority offers.",
        "Save each receipt with the property's records for the tax year.",
        "In Aequitas, record these as recurring expenses (monthly equivalent) so cashflow reflects them.",
      ],
      confirm: [
        "Your state land office (PTG / Pejabat Tanah) for quit rent or parcel rent.",
        "Your local council (PBT) for assessment tax.",
      ],
      notes: [
        "Late payment attracts penalties and, if left long enough, enforcement action by the authority.",
        "Amounts and dates vary by state and council. Always go by your own notice.",
      ],
    },
    sources: [
      {
        label: "PropertyGuru — Quit rent, parcel rent and assessment rates",
        url: "https://www.propertyguru.com.my/property-guides/guide-to-quit-rent-assessment-rates-15151",
      },
      {
        label: "StashAway — Quit rent, parcel rent and assessment tax",
        url: "https://www.stashaway.my/r/quit-rent-parcel-rent-assessment-tax-malaysia",
      },
    ],
  },

  {
    id: "tenancy-stamp-duty",
    category: "administration",
    title: "Stamping a tenancy agreement (2026)",
    summary:
      "A tenancy agreement must be stamped. From 1 January 2026 stamp duty on tenancies is self-assessed and paid through e-Duti Setem on MyTax.",
    status: "draft",
    lastChecked: "2026-11-19",
    sections: {
      overview: [
        "A written tenancy agreement is subject to stamp duty under the Stamp Act 1949. An unstamped agreement may not be admissible as evidence if you need to enforce it.",
        "From 1 January 2025, the old exemption on the first RM2,400 of annual rent was removed and the rates changed. From 1 January 2026, tenancies fall under the stamp duty self-assessment system: the duty is calculated and declared by the payer through e-Duti Setem on MyTax, which replaced the STAMPS portal.",
      ],
      check: [
        "The full annual rent (monthly rent × 12).",
        "The length of the tenancy, which sets the rate per RM250 of annual rent: RM1 for up to 1 year, RM3 for over 1 to 3 years, RM5 for over 3 to 5 years, RM7 for over 5 years.",
        "Who pays under your agreement. The tenant customarily pays, but follow what the agreement says.",
        "The deadline: stamp within 30 days of signing to avoid penalties.",
      ],
      documents: [
        "The signed tenancy agreement as a clear PDF.",
        "Landlord and tenant details, property address, rent, start date and duration.",
        "A MyTax login (Tax Identification Number) for the person submitting.",
      ],
      steps: [
        "Work out the duty: annual rent ÷ RM250, rounded up, × the rate for the tenancy length. Each additional copy is typically RM10.",
        "Log in to MyTax and open e-Duti Setem.",
        "Choose the lease/tenancy instrument, enter the details, upload the agreement and submit the self-assessed amount.",
        "Pay online and download the stamp certificate.",
        "Keep the certificate with the agreement; you'll need it for disputes and for your tax records.",
      ],
      confirm: [
        "LHDN (HASiL): the e-Duti Setem system on MyTax and its stamp duty guidance.",
      ],
      notes: [
        "Example: RM2,300 a month for 2 years → RM27,600 a year → 111 blocks of RM250 (rounded up) × RM3 = RM333.",
        "Under self-assessment, an under-declared amount can lead to penalties. Check the current rate table in e-Duti Setem before paying.",
        "Renewals and extensions are new instruments that need stamping too.",
      ],
    },
    sources: [
      {
        label: "LHDN — MyTax (e-Duti Setem)",
        url: "https://mytax.hasil.gov.my",
      },
      {
        label: "The Sun — Significant changes to stamp duty from 2025",
        url: "https://thesun.my/business-news/tax-matters-part-two-of-significant-changes-to-stamp-duty-from-2025-CO13483526",
      },
      {
        label: "iMoney — Tenancy agreement stamp duty",
        url: "https://www.imoney.my/articles/tenancy-agreement-stamp-duty-malaysia",
      },
    ],
  },

  {
    id: "loan-statement",
    category: "financing",
    title: "Reading your loan statement and recording the balance",
    summary:
      "Which figure on a housing loan statement to record as your outstanding loan, why balances can move unexpectedly, and how to use it with Aequitas's loan checks.",
    status: "draft",
    lastChecked: "2026-11-19",
    sections: {
      overview: [
        "Aequitas uses your outstanding loan to calculate equity and loan-to-value, and, once you add an interest rate, to check that each month's balance makes sense.",
        "Statements often show several balances. Recording the wrong one, or carrying the same figure forward each month, makes these checks unreliable.",
      ],
      check: [
        "The principal outstanding (sometimes 'loan balance' or 'outstanding principal'). This is the figure to record.",
        "The redemption or settlement amount, if shown. It usually includes accrued interest and charges, so it's normally higher than the principal; don't record it as the balance.",
        "The current interest rate, often shown as a reference rate (BR/SBR) plus a spread. Record the effective rate.",
        "The instalment amount and whether any arrears, late charges or insurance premiums were added to the loan.",
      ],
      documents: [
        "Your latest monthly or annual loan statement (online banking or posted).",
        "The letter of offer, for the original loan amount and tenure.",
        "The annual interest statement, which is also useful for your income tax return.",
      ],
      steps: [
        "Each month, take the principal outstanding from your online banking or statement on a consistent day.",
        "Enter it in that month's Aequitas check-in rather than carrying last month's figure forward.",
        "Add the interest rate in Edit Property → Financing so Aequitas can show the expected balance.",
        "If a recorded balance is flagged as higher or lower than expected, compare it with the statement and look for charges, rate changes or a typing error.",
      ],
      confirm: [
        "Your bank or lender, for the official balance, rate and any charges.",
      ],
      notes: [
        "Banks usually charge interest daily, so small differences from a monthly estimate are normal.",
        "A balance can rise if charges or insurance premiums are added to the loan, or during construction while the loan is still being drawn down.",
        "Your annual interest statement separates interest from principal. Only the interest part of instalments is typically deductible against rental income.",
      ],
    },
    sources: [],
  },

  {
    id: "rental-income-tax",
    category: "operations",
    title: "Declaring rental income to LHDN",
    summary:
      "Rental income is declared on your annual income tax return. Tax is charged on net rental income: rent received less allowable direct expenses.",
    status: "draft",
    lastChecked: "2026-11-19",
    sections: {
      overview: [
        "For an individual letting out residential property, rent is generally taxed as income under section 4(d) of the Income Tax Act 1967, and declared in the annual return (Form BE or Form B, depending on your other income).",
        "LHDN Public Ruling No. 12/2018 explains which expenses can be deducted. The commonly cited categories are assessment tax and quit rent, interest on the loan used to buy the property, fire insurance, rent collection costs, tenancy renewal costs, and ordinary repairs.",
      ],
      check: [
        "Total rent actually received in the year. Aequitas's monthly check-ins record this.",
        "Loan interest for the year. Use the bank's annual interest statement; principal repayments are not deductible.",
        "Which repairs restore the property (generally deductible) and which improve it (generally not).",
        "Whether other costs, such as strata maintenance fees or agent fees for the first tenant, are deductible in your case. Check the current Public Ruling or ask a tax adviser.",
      ],
      documents: [
        "Tenancy agreement and stamp certificate.",
        "Record of rent received (bank statements or Aequitas check-ins).",
        "Assessment and quit rent bills and receipts.",
        "Annual loan interest statement.",
        "Fire insurance policy and receipt; repair invoices.",
      ],
      steps: [
        "Add up rent received for the year.",
        "Add up the allowable expenses with supporting documents.",
        "Declare the net rental income in your e-Filing return.",
        "Keep the records for at least seven years in case LHDN asks for them.",
      ],
      confirm: [
        "LHDN (HASiL): Public Ruling No. 12/2018 and your e-Filing return.",
        "A licensed tax agent if your situation is not straightforward.",
      ],
      notes: [
        "Non-resident individuals are taxed at a flat rate on net rental income without personal reliefs.",
        "If you have rental income in addition to employment income, LHDN may require instalment payments (CP500). Check any notice you receive.",
      ],
    },
    sources: [
      {
        label: "LHDN — Public Ruling No. 12/2018: Income from letting of real property (PDF)",
        url: "https://www.hasil.gov.my/wp-content/uploads/PR_12_2018.pdf",
      },
      {
        label: "LHDN — Public Rulings index",
        url: "https://www.hasil.gov.my/en/perundangan/ketetapan-umum/",
      },
      {
        label: "RinggitPlus — How rental income is taxed",
        url: "https://ringgitplus.com/en/blog/the-experts-corner/how-rental-income-is-taxed-and-what-you-can-claim.html",
      },
    ],
  },

  {
    id: "rpgt-selling",
    category: "operations",
    title: "Selling: Real Property Gains Tax (RPGT)",
    summary:
      "RPGT is charged on the gain when you dispose of property. For Malaysian citizens and permanent residents the rate falls with holding period, reaching 0% from the sixth year.",
    status: "draft",
    lastChecked: "2026-11-19",
    sections: {
      overview: [
        "RPGT is administered by LHDN under the Real Property Gains Tax Act 1976. It is charged on the chargeable gain, not on the selling price.",
        "For individual Malaysian citizens and permanent residents (Part I of Schedule 5), the rates are 30% for disposals within three years of acquisition, 20% in the fourth year, 15% in the fifth year, and 0% from the sixth year onwards.",
      ],
      check: [
        "Your acquisition date and the disposal date. The holding period decides the rate.",
        "Your acquisition price and allowable costs (for example legal fees and stamp duty on purchase, and costs that enhanced the property's value). Aequitas's Investment Breakdown lists most of these.",
        "Whether you qualify for an exemption, such as the once-in-a-lifetime exemption on one private residence for citizens and permanent residents.",
      ],
      documents: [
        "SPA for the purchase and for the sale.",
        "Receipts for acquisition costs and enhancement expenditure.",
        "Identification and tax number for the RPGT return.",
      ],
      steps: [
        "Before agreeing a sale, work out the holding period and likely rate.",
        "Gather acquisition costs and receipts.",
        "On sale, the buyer must retain part of the price (3% for a Part I disposer) and remit it to LHDN.",
        "Both seller and buyer must file the RPGT return within 60 days of the disposal. Since 2025 the disposer self-assesses the chargeable gain.",
        "Pay any balance of tax due, or claim a refund if the retained amount exceeds the tax.",
      ],
      confirm: [
        "LHDN (HASiL): RPGT rates, forms and filing.",
        "Your conveyancing lawyer, who normally handles the RPGT filing on sale.",
      ],
      notes: [
        "Companies and non-citizens are taxed at different rates and do not reach 0%.",
        "File the return even when no tax is payable, for example when you've held the property for more than five years or sold at a loss.",
      ],
    },
    sources: [
      {
        label: "LHDN — RPGT rates",
        url: "https://www.hasil.gov.my/en/ckht/kadar-cukai-keuntungan-harta-tanah/",
      },
      {
        label: "LHDN — RPGT return filing programme",
        url: "https://www.hasil.gov.my/en/borang/program-memfail-borang-nyata-ckht/",
      },
      {
        label: "LHDN — Retention and remittance by acquirer",
        url: "https://www.hasil.gov.my/en/ckht/pegangan-dan-remitan-wang-oleh-pemeroleh/",
      },
    ],
  },
];
