import { useEffect, useMemo, useState } from "react";

import {
  getMonthlyCheckins,
  getMonthlyCheckin,
  saveMonthlyCheckin,
} from "../../services/monthlyCheckinStorage";

function getCurrentMonth() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
}

function formatMonth(month) {
  if (!month) return "";

  const [year, monthNumber] =
    month.split("-");

  return new Date(
    Number(year),
    Number(monthNumber) - 1,
    1
  ).toLocaleDateString("en-MY", {
    month: "long",
    year: "numeric",
  });
}

function currency(value) {
  const number = Number(value) || 0;

  return `RM ${number.toLocaleString(
    "en-MY",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  )}`;
}

function signedCurrency(value) {
  const number = Number(value) || 0;

  if (number > 0) {
    return `+${currency(number)}`;
  }

  return currency(number);
}

function resultFor(checkin) {
  if (!checkin) return 0;

  return (
    (Number(checkin.rentalReceived) || 0) -
    (
      (Number(checkin.loanInstalment) || 0) +
      (Number(checkin.maintenancePaid) || 0) +
      (Number(checkin.otherExpenses) || 0)
    )
  );
}

function difference(current, previous) {
  return (
    (Number(current) || 0) -
    (Number(previous) || 0)
  );
}

function Change({
  current,
  previous,
}) {
  const change =
    difference(current, previous);

  if (change === 0) {
    return (
      <span
        className="page-subtitle"
        style={{
          fontSize: 12,
        }}
      >
        No change
      </span>
    );
  }

  return (
    <span
      style={{
        color:
          change > 0
            ? "#22C55E"
            : "#F59E0B",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {change > 0 ? "↑ " : "↓ "}
      {currency(Math.abs(change))}
    </span>
  );
}

export default function MonthlyCheckinCard({
  property,
  onSaved,
}) {
  const currentMonth =
    getCurrentMonth();

  const propertyId =
    property?.id;

  const [
    selectedMonth,
    setSelectedMonth,
  ] = useState(currentMonth);

  const [form, setForm] =
    useState({
      rentalReceived: "",
      loanInstalment: "",
      maintenancePaid: "",
      otherExpenses: "",
      outstandingLoan: "",
      marketValue: "",
      note: "",
    });

  const [
    savedMessage,
    setSavedMessage,
  ] = useState("");

  const [
    checkins,
    setCheckins,
  ] = useState([]);

  const [
    showHistory,
    setShowHistory,
  ] = useState(false);

  function refreshHistory() {
    if (!propertyId) return;

    setCheckins(
      getMonthlyCheckins(
        propertyId
      )
    );
  }

  function getPreviousCheckin(month) {
    return getMonthlyCheckins(
      propertyId
    ).find(
      (item) =>
        item.month < month
    );
  }

  function loadCheckin(month) {
    const existing =
      getMonthlyCheckin(
        propertyId,
        month
      );

    const previous =
      getPreviousCheckin(month);

    /*
     * Existing month:
     * load exactly what was saved.
     *
     * New month:
     * carry forward sensible recurring
     * values from the previous check-in.
     */

    const source =
      existing || previous;

    setForm({
      rentalReceived:
        source?.rentalReceived ??
        property?.monthlyRental ??
        "",

      loanInstalment:
        source?.loanInstalment ??
        property?.monthlyInstalment ??
        "",

      maintenancePaid:
        existing?.maintenancePaid ??
        "",

      otherExpenses:
        existing?.otherExpenses ??
        "",

      outstandingLoan:
        source?.outstandingLoan ??
        property?.outstandingLoan ??
        "",

      marketValue:
        source?.marketValue ??
        property?.marketValue ??
        "",

      note:
        existing?.note ??
        "",
    });
  }

  useEffect(() => {
    if (!propertyId) return;

    refreshHistory();
    loadCheckin(
      selectedMonth
    );
  }, [
    propertyId,
    selectedMonth,
  ]);

  const currentResult =
    (Number(
      form.rentalReceived
    ) || 0) -
    (
      (Number(
        form.loanInstalment
      ) || 0) +
      (Number(
        form.maintenancePaid
      ) || 0) +
      (Number(
        form.otherExpenses
      ) || 0)
    );

  const existingCheckin =
    getMonthlyCheckin(
      propertyId,
      selectedMonth
    );

  const previousCheckin =
    useMemo(
      () =>
        checkins.find(
          (item) =>
            item.month <
            selectedMonth
        ) || null,
      [
        checkins,
        selectedMonth,
      ]
    );

  /*
   * Compare the two latest saved
   * check-ins.
   */

  const historySummary =
    useMemo(() => {
      if (checkins.length < 2) {
        return null;
      }

      const latest =
        checkins[0];

      const previous =
        checkins[1];

      const latestResult =
        resultFor(latest);

      const previousResult =
        resultFor(previous);

      return {
        latest,
        previous,

        cashflowChange:
          latestResult -
          previousResult,

        rentalChange:
          difference(
            latest.rentalReceived,
            previous.rentalReceived
          ),

        loanChange:
          difference(
            latest.outstandingLoan,
            previous.outstandingLoan
          ),

        maintenanceChange:
          difference(
            latest.maintenancePaid,
            previous.maintenancePaid
          ),

        marketValueChange:
          difference(
            latest.marketValue,
            previous.marketValue
          ),
      };
    }, [checkins]);

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSavedMessage("");
  }

  function handleQuickFill(
    field,
    value
  ) {
    setForm((prev) => ({
      ...prev,
      [field]:
        value === undefined ||
        value === null
          ? ""
          : String(value),
    }));

    setSavedMessage("");
  }

  function handleSave(event) {
    event.preventDefault();

    try {
      saveMonthlyCheckin({
        propertyId,
        month: selectedMonth,
        ...form,
      });

      refreshHistory();

      setSavedMessage(
        `${formatMonth(
          selectedMonth
        )} check-in saved.`
      );

      onSaved?.();

    } catch (error) {
      setSavedMessage(
        error?.message ||
          "Unable to save the check-in."
      );
    }
  }

  return (
    <div
      className="card"
      style={{
        marginTop: 24,
      }}
    >

      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "flex-start",
          gap: 20,
          flexWrap:
            "wrap",
        }}
      >

        <div>

          <p
            className="page-subtitle"
            style={{
              marginBottom: 6,
            }}
          >
            INVESTMENT TRACKING
          </p>

          <h3
            style={{
              marginTop: 0,
              marginBottom: 8,
            }}
          >
            📝 Monthly Check-in
          </h3>

          <p
            className="page-subtitle"
            style={{
              maxWidth: 680,
              lineHeight: 1.55,
              marginBottom: 0,
            }}
          >
            Record what actually happened
            this month. Aequitas keeps
            previous months so your
            investment can be understood
            over time.
          </p>

        </div>

        <div
          style={{
            minWidth: 190,
          }}
        >

          <label
            className="page-subtitle"
            style={{
              display: "block",
              marginBottom: 6,
            }}
          >
            Check-in month
          </label>

          <input
            type="month"
            value={
              selectedMonth
            }
            onChange={(event) =>
              setSelectedMonth(
                event.target.value
              )
            }
            style={{
              width: "100%",
            }}
          />

        </div>

      </div>

      {/* TREND */}

      {historySummary && (

        <div
          style={{
            marginTop: 22,
            padding: 16,
            borderRadius: 12,
            background: "#171a22",
            border:
              "1px solid #303544",
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              gap: 16,
              flexWrap:
                "wrap",
            }}
          >

            <div>

              <strong>
                📊 Latest Check-in Trend
              </strong>

              <div
                className="page-subtitle"
                style={{
                  marginTop: 5,
                }}
              >
                {formatMonth(
                  historySummary
                    .latest
                    .month
                )}

                {" compared with "}

                {formatMonth(
                  historySummary
                    .previous
                    .month
                )}

              </div>

            </div>

            <strong
              style={{
                color:
                  historySummary
                    .cashflowChange >= 0
                    ? "#22C55E"
                    : "#F59E0B",
              }}
            >
              {historySummary
                .cashflowChange >= 0
                ? "↑ "
                : "↓ "}

              {currency(
                Math.abs(
                  historySummary
                    .cashflowChange
                )
              )}

              {" cashflow"}

            </strong>

          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(150px,1fr))",
              gap: 12,
              marginTop: 14,
            }}
          >

            <div>

              <div
                className="page-subtitle"
              >
                Rental
              </div>

              <Change
                current={
                  historySummary
                    .latest
                    .rentalReceived
                }
                previous={
                  historySummary
                    .previous
                    .rentalReceived
                }
              />

            </div>

            <div>

              <div
                className="page-subtitle"
              >
                Loan Balance
              </div>

              <Change
                current={
                  historySummary
                    .latest
                    .outstandingLoan
                }
                previous={
                  historySummary
                    .previous
                    .outstandingLoan
                }
              />

            </div>

            <div>

              <div
                className="page-subtitle"
              >
                Maintenance
              </div>

              <Change
                current={
                  historySummary
                    .latest
                    .maintenancePaid
                }
                previous={
                  historySummary
                    .previous
                    .maintenancePaid
                }
              />

            </div>

            <div>

              <div
                className="page-subtitle"
              >
                Market Value
              </div>

              <Change
                current={
                  historySummary
                    .latest
                    .marketValue
                }
                previous={
                  historySummary
                    .previous
                    .marketValue
                }
              />

            </div>

          </div>

        </div>

      )}

      {/* QUICK ENTRY */}

      <div
        style={{
          marginTop: 22,
          padding: 14,
          borderRadius: 10,
          background: "#171a22",
        }}
      >

        <strong>
          Quick entry
        </strong>

        <p
          className="page-subtitle"
          style={{
            marginTop: 6,
            marginBottom: 12,
          }}
        >
          Recurring values are carried
          forward from your previous
          check-in. Change only what
          actually changed.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap:
              "wrap",
            gap: 8,
          }}
        >

          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              handleQuickFill(
                "rentalReceived",
                property?.monthlyRental
              )
            }
          >
            🏠 Rental
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              handleQuickFill(
                "loanInstalment",
                property?.monthlyInstalment
              )
            }
          >
            🏦 Instalment
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              handleQuickFill(
                "maintenancePaid",
                property?.maintenanceFee
              )
            }
          >
            🔧 Maintenance
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              handleQuickFill(
                "outstandingLoan",
                property?.outstandingLoan
              )
            }
          >
            💳 Loan Balance
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              handleQuickFill(
                "marketValue",
                property?.marketValue ||
                  property?.purchasePrice
              )
            }
          >
            📈 Market Value
          </button>

        </div>

      </div>

      {/* FORM */}

      <form
        onSubmit={handleSave}
        style={{
          display: "grid",
          gap: 18,
          marginTop: 22,
        }}
      >

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: 18,
          }}
        >

          <div>

            <label
              className="page-subtitle"
            >
              Rental Received (RM)
            </label>

            <input
              name="rentalReceived"
              type="number"
              step="0.01"
              min="0"
              value={
                form.rentalReceived
              }
              onChange={handleChange}
              style={{
                width: "100%",
              }}
            />

          </div>

          <div>

            <label
              className="page-subtitle"
            >
              Loan Instalment Paid (RM)
            </label>

            <input
              name="loanInstalment"
              type="number"
              step="0.01"
              min="0"
              value={
                form.loanInstalment
              }
              onChange={handleChange}
              style={{
                width: "100%",
              }}
            />

          </div>

          <div>

            <label
              className="page-subtitle"
            >
              Maintenance / Repairs Paid (RM)
            </label>

            <input
              name="maintenancePaid"
              type="number"
              step="0.01"
              min="0"
              value={
                form.maintenancePaid
              }
              onChange={handleChange}
              style={{
                width: "100%",
              }}
            />

          </div>

          <div>

            <label
              className="page-subtitle"
            >
              Other Expenses (RM)
            </label>

            <input
              name="otherExpenses"
              type="number"
              step="0.01"
              min="0"
              value={
                form.otherExpenses
              }
              onChange={handleChange}
              style={{
                width: "100%",
              }}
            />

          </div>

          <div>

            <label
              className="page-subtitle"
            >
              Outstanding Loan (RM)
            </label>

            <input
              name="outstandingLoan"
              type="number"
              step="0.01"
              min="0"
              value={
                form.outstandingLoan
              }
              onChange={handleChange}
              style={{
                width: "100%",
              }}
            />

          </div>

          <div>

            <label
              className="page-subtitle"
            >
              Current Market Value (RM)
            </label>

            <input
              name="marketValue"
              type="number"
              step="0.01"
              min="0"
              value={
                form.marketValue
              }
              onChange={handleChange}
              style={{
                width: "100%",
              }}
            />

          </div>

        </div>

        <div>

          <label
            className="page-subtitle"
          >
            Note (optional)
          </label>

          <textarea
            name="note"
            rows="3"
            placeholder="Anything important that happened this month..."
            value={
              form.note
            }
            onChange={
              handleChange
            }
            style={{
              width: "100%",
              resize: "vertical",
            }}
          />

        </div>

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            gap: 16,
            flexWrap:
              "wrap",
          }}
        >

          <div
            style={{
              padding:
                "12px 14px",
              borderRadius: 10,
              background:
                "#171a22",
            }}
          >

            <div
              className="page-subtitle"
            >
              Monthly cashflow
            </div>

            <strong
              style={{
                color:
                  currentResult >= 0
                    ? "#22C55E"
                    : "#EF4444",
                fontSize: 20,
              }}
            >
              {signedCurrency(
                currentResult
              )}
            </strong>

          </div>

          <button
            type="submit"
            className="primary-button"
          >
            {existingCheckin
              ? `Update ${formatMonth(
                  selectedMonth
                )}`
              : `Save ${formatMonth(
                  selectedMonth
                )} Check-in`}
          </button>

        </div>

        {savedMessage && (

          <div
            style={{
              padding: 12,
              borderRadius: 10,
              background:
                "#17261d",
              color:
                "#86efac",
            }}
          >
            ✓ {savedMessage}
          </div>

        )}

      </form>

      {/* HISTORY */}

      <div
        style={{
          marginTop: 24,
          borderTop:
            "1px solid #303544",
          paddingTop: 16,
        }}
      >

        <button
          type="button"
          className="btn-secondary"
          onClick={() =>
            setShowHistory(
              (prev) => !prev
            )
          }
        >
          {showHistory
            ? "− Hide history"
            : `+ View check-in history${
                checkins.length
                  ? ` (${checkins.length})`
                  : ""
              }`}
        </button>

        {showHistory && (

          <div
            style={{
              marginTop: 16,
              display: "grid",
              gap: 10,
            }}
          >

            {checkins.length === 0 ? (

              <p
                className="page-subtitle"
              >
                No monthly check-ins
                recorded yet.
              </p>

            ) : (

              checkins.map(
                (item) => {

                  const result =
                    resultFor(item);

                  return (

                    <button
                      type="button"
                      key={item.id}
                      onClick={() =>
                        setSelectedMonth(
                          item.month
                        )
                      }
                      style={{
                        textAlign:
                          "left",
                        padding: 14,
                        borderRadius: 10,
                        border:
                          "1px solid #303544",
                        background:
                          "#171a22",
                        color:
                          "inherit",
                        cursor:
                          "pointer",
                      }}
                    >

                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          gap: 16,
                          flexWrap:
                            "wrap",
                        }}
                      >

                        <strong>
                          {formatMonth(
                            item.month
                          )}
                        </strong>

                        <strong
                          style={{
                            color:
                              result >= 0
                                ? "#22C55E"
                                : "#EF4444",
                          }}
                        >
                          {signedCurrency(
                            result
                          )}
                        </strong>

                      </div>

                      <div
                        className="page-subtitle"
                        style={{
                          marginTop: 8,
                        }}
                      >
                        Rental{" "}
                        {currency(
                          item.rentalReceived
                        )}

                        {" • "}

                        Instalment{" "}
                        {currency(
                          item.loanInstalment
                        )}

                        {" • "}

                        Maintenance{" "}
                        {currency(
                          item.maintenancePaid
                        )}

                      </div>

                    </button>

                  );
                }
              )

            )}

          </div>

        )}

      </div>

    </div>
  );
}