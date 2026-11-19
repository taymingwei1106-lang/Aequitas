import { useState } from "react";

import formatCurrency from "../../utils/formatCurrency";
import { calculateLoanPayoff } from "../../utils/loanPayoffEngine";

import CalculatorActions from "./CalculatorActions";

const DEFAULT_FORM = {

  loanAmount: "0",

  interestRate: "0",

  remainingYears: "0",

  extraPayment: "0",

};

export default function LoanPayoffCard() {

  const [draft, setDraft] =
    useState(DEFAULT_FORM);

  const [result, setResult] =
    useState(null);

  function update(field, value) {

    setDraft((prev) => ({

      ...prev,

      [field]: value,

    }));

  }

  function calculate() {

    const output =
      calculateLoanPayoff({

        loanAmount: Number(
          draft.loanAmount.replace(/,/g, "")
        ),

        annualInterestRate: Number(
          draft.interestRate
        ),

        remainingYears: Number(
          draft.remainingYears
        ),

        extraPayment: Number(
          draft.extraPayment.replace(/,/g, "")
        ),

      });

    setResult(output);

  }

  function reset() {

    setDraft(DEFAULT_FORM);

    setResult(null);

  }

  function handleKeyDown(e) {

    if (e.key === "Enter") {

      e.preventDefault();

      calculate();

    }

  }

  const payoffYear =

    result

      ? new Date().getFullYear() +

        Math.ceil(result.payoffYears || 0)

      : null;

  return (

      <div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(260px,1fr))",
        gap: 20,
      }}
    >

      <div>

        <label
          className="page-subtitle"
        >
          Outstanding Loan (RM)
        </label>

        <input
          type="text"
          inputMode="decimal"
          value={draft.loanAmount}
          onChange={(e)=>
            update(
              "loanAmount",
              e.target.value
            )
          }
          onKeyDown={handleKeyDown}
          style={{
            width: "100%",
          }}
        />

      </div>

      <div>

        <label
          className="page-subtitle"
        >
          Interest Rate (%)
        </label>

        <input
          type="text"
          inputMode="decimal"
          value={draft.interestRate}
          onChange={(e)=>
            update(
              "interestRate",
              e.target.value
            )
          }
          onKeyDown={handleKeyDown}
          style={{
            width: "100%",
          }}
        />

      </div>

      <div>

        <label
          className="page-subtitle"
        >
          Remaining Years
        </label>

        <input
          type="text"
          inputMode="numeric"
          value={draft.remainingYears}
          onChange={(e)=>
            update(
              "remainingYears",
              e.target.value
            )
          }
          onKeyDown={handleKeyDown}
          style={{
            width: "100%",
          }}
        />

      </div>

      <div>

        <label
          className="page-subtitle"
        >
          Extra Monthly Payment (RM)
        </label>

        <input
          type="text"
          inputMode="decimal"
          value={draft.extraPayment}
          onChange={(e)=>
            update(
              "extraPayment",
              e.target.value
            )
          }
          onKeyDown={handleKeyDown}
          style={{
            width: "100%",
          }}
        />

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginTop: 12,
          }}
        >

          {[100,250,500,1000].map(
            (amount)=>(

              <button
                key={amount}
                type="button"
                className="primary-button"
                style={{
                  padding:
                    "6px 12px",
                }}
                onClick={()=>

                  update(
                    "extraPayment",
                    String(amount)
                  )

                }
              >

                +{amount}

              </button>

            )
          )}

        </div>

      </div>

    </div>

    <CalculatorActions

      onCalculate={calculate}

      onReset={reset}

    />

    {

      result && (

        <>

                  <hr
            style={{
              margin: "32px 0",
            }}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(220px,1fr))",
              gap: 20,
            }}
          >

            <div className="card">

              <small>
                Current Monthly Payment
              </small>

              <h2
                style={{
                  margin: "8px 0 0",
                }}
              >
                {formatCurrency(
                  result.monthlyPayment
                )}
              </h2>

            </div>

            <div className="card">

              <small>
                New Monthly Payment
              </small>

              <h2
                style={{
                  margin: "8px 0 0",
                }}
              >
                {formatCurrency(
                  result.newMonthlyPayment
                )}
              </h2>

            </div>

            <div className="card">

              <small>
                Interest Saved
              </small>

              <h2
                style={{
                  margin: "8px 0 0",
                  color: "var(--color-success)",
                }}
              >
                {formatCurrency(
                  result.interestSaved
                )}
              </h2>

            </div>

            <div className="card">

              <small>
                Years Saved
              </small>

              <h2
                style={{
                  margin: "8px 0 0",
                  color: "var(--color-primary)",
                }}
              >
                {result.yearsSaved}
              </h2>

            </div>

            <div className="card">

              <small>
                Estimated Payoff Year
              </small>

              <h2
                style={{
                  margin: "8px 0 0",
                }}
              >
                {payoffYear}
              </h2>

            </div>

          </div>

          <div
            className="card"
            style={{
              marginTop: 24,
              borderLeft: "5px solid var(--color-primary)",
            }}
          >

            <h3
              style={{
                marginTop: 0,
              }}
            >
              💡 Aequitas Insight
            </h3>

            <p>

              With an additional monthly payment of

              <strong>

                {" "}
                {formatCurrency(
                  Number(
                    draft.extraPayment || 0
                  )
                )}

              </strong>

              , your loan is projected to finish around

              <strong>

                {" "}
                {payoffYear}

              </strong>

              , saving approximately

              <strong>

                {" "}
                {formatCurrency(
                  result.interestSaved
                )}

              </strong>

              {" "}and shortening the repayment period by

              <strong>

                {" "}
                {result.yearsSaved} years

              </strong>

              .

            </p>

          </div>

        </>

      )

    }

  </div>

);

}