import { useState } from "react";

import { GUIDE_CATEGORIES, GUIDES } from "../data/investorGuides";

/*
 * Investor Guides
 *
 * Content lives in src/data/investorGuides.js. Each guide uses the same
 * six-part structure. Guides marked "draft" are shown with a label until
 * they have been reviewed.
 */

const SECTION_TITLES = [
  ["overview", "Overview"],
  ["check", "What to check"],
  ["documents", "Information or documents that may be needed"],
  ["steps", "Step-by-step process"],
  ["confirm", "Authority / provider confirmation"],
  ["notes", "Important notes and limitations"],
];

function Section({ title, children }) {
  return (
    <section
      style={{
        border: "1px solid var(--border, var(--color-border-strong))",
        borderRadius: 16,
        padding: 18,
        marginTop: 14,
        background: "var(--card, var(--color-surface))",
      }}
    >
      {title && <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>{title}</h3>}
      {children}
    </section>
  );
}

function StatusBadge({ status }) {
  const draft = status !== "reviewed";
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.04em",
        padding: "3px 8px",
        borderRadius: 999,
        color: draft ? "var(--color-warning)" : "var(--color-success)",
        background: draft ? "rgba(245,158,11,0.12)" : "rgba(34,197,94,0.12)",
      }}
    >
      {draft ? "DRAFT" : "REVIEWED"}
    </span>
  );
}

function formatDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function GuideDetail({ guide, onBack }) {
  const category = GUIDE_CATEGORIES.find((c) => c.id === guide.category);

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        style={{
          background: "transparent",
          border: "none",
          color: "var(--color-link)",
          cursor: "pointer",
          padding: 0,
          fontSize: 14,
        }}
      >
        ← {category ? category.title : "All guides"}
      </button>

      <div style={{ marginTop: 14 }}>
        <StatusBadge status={guide.status} />
        <h1 style={{ margin: "10px 0 0", fontSize: 26, lineHeight: 1.25 }}>
          {guide.title}
        </h1>
        <p style={{ margin: "10px 0 0", lineHeight: 1.6, opacity: 0.8 }}>
          {guide.summary}
        </p>
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.6 }}>
          Last checked against sources: {formatDate(guide.lastChecked)}
        </div>
      </div>

      {guide.status !== "reviewed" && (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 12,
            border: "1px solid var(--color-warning-border)",
            background: "rgba(245,158,11,0.08)",
            fontSize: 13,
            lineHeight: 1.55,
          }}
        >
          This guide has been researched from the sources below but not yet
          reviewed. Rules, rates and procedures change, so confirm with the
          authority or provider before acting.
        </div>
      )}

      {SECTION_TITLES.map(([key, title]) => {
        const items = guide.sections?.[key] || [];
        if (!items.length) return null;

        if (key === "overview") {
          return (
            <Section key={key} title={title}>
              {items.map((text) => (
                <p key={text} style={{ margin: "0 0 10px", lineHeight: 1.6, opacity: 0.85 }}>
                  {text}
                </p>
              ))}
            </Section>
          );
        }

        const List = key === "steps" ? "ol" : "ul";
        return (
          <Section key={key} title={title}>
            <List style={{ margin: 0, paddingLeft: 22, display: "grid", gap: 8, lineHeight: 1.55 }}>
              {items.map((text) => (
                <li key={text} style={{ opacity: 0.85 }}>
                  {text}
                </li>
              ))}
            </List>
          </Section>
        );
      })}

      {guide.sources?.length > 0 && (
        <Section title="Sources">
          <ul style={{ margin: 0, paddingLeft: 22, display: "grid", gap: 6 }}>
            {guide.sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--color-link)" }}
                >
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <p style={{ marginTop: 18, fontSize: 12, lineHeight: 1.55, opacity: 0.6 }}>
        Aequitas guides explain what to check and where confirmation should come
        from. They are not legal, tax or financial advice, and not a substitute
        for instructions from an authority, utility provider, lender or
        management body.
      </p>
    </div>
  );
}

export default function InvestorGuides() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGuideId, setSelectedGuideId] = useState(null);

  const selectedGuide = GUIDES.find((guide) => guide.id === selectedGuideId);

  function openGuide(id) {
    setSelectedGuideId(id);
    window.scrollTo({ top: 0 });
  }

  if (selectedGuide) {
    return (
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 0 110px" }}>
        <GuideDetail
          guide={selectedGuide}
          onBack={() => {
            setSelectedCategory(selectedGuide.category);
            setSelectedGuideId(null);
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 0 110px" }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>
          Aequitas Investor Guides
        </div>
        <h1 style={{ margin: 0, fontSize: 30 }}>Investor Guides</h1>
        <p style={{ margin: "10px 0 0", lineHeight: 1.6, opacity: 0.78 }}>
          Practical, step-by-step reference material for property investors in
          Malaysia. Each guide lists its sources and when it was last checked.
        </p>
      </div>

      <div
        style={{
          border: "1px solid var(--color-primary)",
          borderRadius: 16,
          padding: 18,
          background: "rgba(59,130,246,0.06)",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.8, marginBottom: 8 }}>
          Simple first
        </div>
        <h2 style={{ margin: 0, fontSize: 20 }}>Learn the process before taking action</h2>
        <p style={{ margin: "9px 0 0", lineHeight: 1.55, opacity: 0.78 }}>
          Aequitas guides explain what to check, what information may be needed
          and where confirmation should come from. They are not a substitute for
          instructions from an authority, utility provider, lender, management
          body or other responsible party.
        </p>
      </div>

      <Section title="Guide categories">
        <div style={{ display: "grid", gap: 10 }}>
          {GUIDE_CATEGORIES.map((category) => {
            const active = selectedCategory === category.id;
            const guides = GUIDES.filter((g) => g.category === category.id);

            return (
              <div key={category.id}>
                <button
                  type="button"
                  onClick={() => setSelectedCategory(active ? null : category.id)}
                  aria-expanded={active}
                  style={{
                    textAlign: "left",
                    width: "100%",
                    border: active ? "1px solid var(--color-primary)" : "1px solid var(--border, var(--color-border-strong))",
                    borderRadius: 12,
                    padding: 14,
                    background: active ? "rgba(59,130,246,0.08)" : "transparent",
                    color: "inherit",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      fontWeight: 700,
                      marginBottom: 4,
                    }}
                  >
                    <span>{category.title}</span>
                    <span style={{ fontSize: 12, opacity: 0.6, fontWeight: 600 }}>
                      {guides.length} {guides.length === 1 ? "guide" : "guides"}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.7 }}>
                    {category.description}
                  </div>
                </button>

                {active && (
                  <div style={{ display: "grid", gap: 8, margin: "8px 0 4px 12px" }}>
                    {guides.length === 0 && (
                      <div style={{ fontSize: 13, opacity: 0.6, padding: 8 }}>
                        No guides in this category yet.
                      </div>
                    )}
                    {guides.map((guide) => (
                      <button
                        key={guide.id}
                        type="button"
                        onClick={() => openGuide(guide.id)}
                        style={{
                          textAlign: "left",
                          border: "1px solid var(--border, var(--color-border-strong))",
                          borderRadius: 10,
                          padding: 12,
                          background: "var(--color-overlay)",
                          color: "inherit",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 10,
                            alignItems: "baseline",
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>{guide.title}</span>
                          <StatusBadge status={guide.status} />
                        </div>
                        <div style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.7, marginTop: 4 }}>
                          {guide.summary}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
