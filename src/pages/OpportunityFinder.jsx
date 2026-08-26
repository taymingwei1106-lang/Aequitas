import MainLayout from "../layouts/MainLayout";
import OpportunityCard from "../components/opportunity/OpportunityCard";

import useIntelligence from "../hooks/useIntelligence";

export default function OpportunityFinder() {
  const { opportunities } = useIntelligence();

  const refinance =
    opportunities?.refinance ?? [];

  const equity =
    opportunities?.equity ?? [];

  const rental =
    opportunities?.rental ?? [];

  const sell =
    opportunities?.sell ?? [];

  const totalOpportunities =
    refinance.length +
    equity.length +
    rental.length +
    sell.length;

  const activeOpportunities = [
    {
      key: "rental",
      items: rental,
      icon: "🏠",
      title: "Rental Optimisation",
      description:
        "Detect opportunities to improve rental performance.",
      priority: "Medium",
    },
    {
      key: "refinance",
      items: refinance,
      icon: "💰",
      title: "Refinancing",
      description:
        "Identify properties that may benefit from refinancing.",
      priority: "High",
    },
    {
      key: "equity",
      items: equity,
      icon: "📈",
      title: "Equity Release",
      description:
        "Find properties with strong equity available.",
      priority: "Medium",
    },
    {
      key: "sell",
      items: sell,
      icon: "🎯",
      title: "Sell Opportunities",
      description:
        "Identify properties approaching their exit targets.",
      priority: "Low",
    },
  ].filter(
    (opportunity) =>
      opportunity.items.length > 0
  );

  const consideredAreas = [
    {
      title: "Refinancing",
      count: refinance.length,
      description:
        refinance.length > 0
          ? `${refinance.length} financing review ${
              refinance.length === 1
                ? "available"
                : "available"
            }.`
          : "No current refinancing signal detected.",
    },
    {
      title: "Equity Release",
      count: equity.length,
      description:
        equity.length > 0
          ? `${equity.length} property ${
              equity.length === 1
                ? "has"
                : "have"
            } a meaningful equity position to review.`
          : "No meaningful equity opportunity detected.",
    },
    {
      title: "Rental Optimisation",
      count: rental.length,
      description:
        rental.length > 0
          ? `${rental.length} rental performance review ${
              rental.length === 1
                ? "is"
                : "are"
            } available above.`
          : "No rental performance signal detected.",
    },
    {
      title: "Selling",
      count: sell.length,
      description:
        sell.length > 0
          ? `${sell.length} potential exit ${
              sell.length === 1
                ? "candidate"
                : "candidates"
            } detected.`
          : "No strong exit signal detected.",
    },
  ];

  return (
    <MainLayout>
      <div className="page-container">

        <div className="page-header">
          <h1>
            🔍 Opportunity Finder
          </h1>

          <p className="page-description">
            Discover the investment areas that
            deserve your attention across your
            portfolio.
          </p>
        </div>

        {/* Main Summary */}

        <div
          className="dashboard-card"
          style={{
            marginTop: 24,
            marginBottom: 28,
            padding: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div className="page-subtitle">
                Today's Portfolio Review
              </div>

              <h2
                style={{
                  marginTop: 8,
                  marginBottom: 8,
                }}
              >
                {totalOpportunities === 0
                  ? "Nothing urgent today"
                  : `${totalOpportunities} ${
                      totalOpportunities === 1
                        ? "item deserves"
                        : "items deserve"
                    } your attention`}
              </h2>

              <p
                style={{
                  margin: 0,
                  maxWidth: 650,
                  color:
                    "var(--color-text-secondary, #b7bac5)",
                }}
              >
                Aequitas filters the portfolio
                signals and highlights areas that
                may require a closer look. Other
                areas are still considered, but are
                kept out of the main view when there
                is no meaningful signal.
              </p>
            </div>

            <div
              style={{
                minWidth: 110,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                }}
              >
                {totalOpportunities}
              </div>

              <div className="page-subtitle">
                Active
              </div>
            </div>
          </div>
        </div>

        {/* Available Now */}

        <section>
          <div
            style={{
              marginBottom: 16,
            }}
          >
            <div className="page-subtitle">
              AVAILABLE NOW
            </div>

            <h2
              style={{
                marginTop: 6,
              }}
            >
              What deserves your attention
            </h2>
          </div>

          {activeOpportunities.length === 0 ? (
            <div
              className="dashboard-card"
              style={{
                padding: 28,
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  marginBottom: 10,
                }}
              >
                ✓
              </div>

              <h3
                style={{
                  marginTop: 0,
                }}
              >
                Nothing urgent today
              </h3>

              <p
                style={{
                  marginBottom: 0,
                  color:
                    "var(--color-text-secondary, #b7bac5)",
                }}
              >
                Your portfolio currently has no
                strong opportunity signals that
                require immediate attention.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 20,
              }}
            >
              {activeOpportunities.map(
                (opportunity) => (
                  <OpportunityCard
                    key={opportunity.key}
                    icon={opportunity.icon}
                    title={opportunity.title}
                    description={
                      opportunity.description
                    }
                    count={
                      opportunity.items.length
                    }
                    priority={
                      opportunity.priority
                    }
                  />
                )
              )}
            </div>
          )}
        </section>

        {/* Other Areas Considered */}

        <section
          style={{
            marginTop: 36,
          }}
        >
          <div
            style={{
              marginBottom: 16,
            }}
          >
            <div className="page-subtitle">
              OTHER AREAS CONSIDERED
            </div>

            <h2
              style={{
                marginTop: 6,
              }}
            >
              What Aequitas checked
            </h2>

            <p
              style={{
                maxWidth: 700,
                color:
                  "var(--color-text-secondary, #b7bac5)",
              }}
            >
              These areas are still part of the
              portfolio analysis. They are shown
              here in a quieter format when there
              is no meaningful opportunity to act
              on yet.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 14,
            }}
          >
            {consideredAreas
              .filter(
                (area) =>
                  area.count === 0
              )
              .map((area) => (
                <div
                  key={area.title}
                  className="dashboard-card"
                  style={{
                    padding: 18,
                    opacity: 0.82,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <strong>
                      {area.title}
                    </strong>

                    <span
                      style={{
                        fontSize: 12,
                        padding:
                          "4px 8px",
                        borderRadius: 999,
                        background:
                          "#1b202c",
                        color:
                          "#9da3b5",
                      }}
                    >
                      No current signal
                    </span>
                  </div>

                  <p
                    style={{
                      marginTop: 10,
                      marginBottom: 0,
                      fontSize: 14,
                      color:
                        "var(--color-text-secondary, #b7bac5)",
                    }}
                  >
                    {area.description}
                  </p>
                </div>
              ))}
          </div>
        </section>

        {/* Methodology Note */}

        <div
          className="dashboard-card"
          style={{
            marginTop: 32,
            padding: 20,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            🧠 How Aequitas prioritises
          </div>

          <p
            style={{
              margin: 0,
              color:
                "var(--color-text-secondary, #b7bac5)",
              lineHeight: 1.6,
            }}
          >
            Aequitas does not treat every unusual
            financial condition as an opportunity.
            A signal must be meaningful enough to
            deserve your attention before it is
            promoted into the main opportunity list.
          </p>
        </div>

      </div>
    </MainLayout>
  );
}