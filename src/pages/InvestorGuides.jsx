import React from "react";

const categories = [
  {
    title: "Utilities & Tariffs",
    description:
      "Practical guides for electricity, water, sewerage and utility account matters.",
    status: "Coming soon",
  },
  {
    title: "Property Administration",
    description:
      "Understand recurring property-related accounts, charges, records and administrative steps.",
    status: "Coming soon",
  },
  {
    title: "Financing",
    description:
      "Guides for refinancing, early settlement, repayment and other financing matters.",
    status: "Coming soon",
  },
  {
    title: "Investment Operations",
    description:
      "Practical help with tenants, records, maintenance, insurance and day-to-day ownership.",
    status: "Coming soon",
  },
];

function GuideCategory({ title, description, status }) {
  return (
    <div
      style={{
        border: "1px solid #252936",
        borderRadius: 18,
        padding: 22,
        background: "#111119",
        minHeight: 150,
      }}
    >
      <div
        style={{
          display: "inline-block",
          padding: "5px 9px",
          borderRadius: 999,
          background: "#171722",
          border: "1px solid #292e3d",
          color: "#7f8496",
          fontSize: 11,
          marginBottom: 14,
        }}
      >
        {status}
      </div>

      <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>
        {title}
      </h3>

      <p
        style={{
          margin: 0,
          color: "#9296a7",
          fontSize: 13,
          lineHeight: 1.55,
        }}
      >
        {description}
      </p>
    </div>
  );
}

export default function InvestorGuides() {
  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "30px 30px 70px",
        color: "#fff",
      }}
    >
      <div style={{ color: "#788096", fontSize: 11, letterSpacing: 1.1 }}>
        AEQUITAS KNOWLEDGE
      </div>

      <h1 style={{ margin: "8px 0 8px", fontSize: 32 }}>
        Investor Guides
      </h1>

      <p
        style={{
          margin: 0,
          maxWidth: 700,
          color: "#9296a7",
          lineHeight: 1.6,
        }}
      >
        Practical guides for the things investors need to understand and
        handle after purchasing a property.
      </p>

      <section
        style={{
          marginTop: 26,
          padding: 22,
          borderRadius: 18,
          border: "1px solid #2d3b60",
          background: "#111119",
        }}
      >
        <div style={{ color: "#788096", fontSize: 11, letterSpacing: 1 }}>
          UNDER DEVELOPMENT
        </div>

        <h2 style={{ margin: "9px 0 7px", fontSize: 23 }}>
          Your practical investor knowledge centre
        </h2>

        <p
          style={{
            margin: 0,
            color: "#9296a7",
            fontSize: 13,
            lineHeight: 1.6,
            maxWidth: 760,
          }}
        >
          Aequitas Guides will focus on practical, step-by-step procedures,
          checklists and explanations rather than generic property articles.
          Each guide will help investors understand what to check, what to
          prepare, what to do next and where official confirmation is needed.
        </p>
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: 14,
          marginTop: 18,
        }}
      >
        {categories.map((category) => (
          <GuideCategory
            key={category.title}
            title={category.title}
            description={category.description}
            status={category.status}
          />
        ))}
      </div>

      <section
        style={{
          marginTop: 22,
          padding: 20,
          borderRadius: 16,
          background: "#15151e",
          border: "1px solid #252936",
        }}
      >
        <div
          style={{
            color: "#788096",
            fontSize: 11,
            letterSpacing: 1,
            marginBottom: 8,
          }}
        >
          FIRST GUIDE
        </div>

        <h3 style={{ margin: "0 0 7px", fontSize: 18 }}>
          Commercial → Domestic Utilities
        </h3>

        <p
          style={{
            margin: 0,
            color: "#858998",
            fontSize: 13,
            lineHeight: 1.55,
          }}
        >
          A future Aequitas guide covering the practical process investors
          may need to understand when a property has commercial utility
          arrangements and they want to investigate domestic / residential
          tariff or account treatment.
        </p>

        <div
          style={{
            marginTop: 13,
            color: "#6f7384",
            fontSize: 11,
          }}
        >
          Content will be developed together before this guide is published.
        </div>
      </section>

      <div
        style={{
          marginTop: 22,
          padding: 16,
          borderRadius: 14,
          background: "#101017",
          border: "1px solid #222735",
          color: "#777b8c",
          fontSize: 12,
          lineHeight: 1.55,
        }}
      >
        Aequitas Guides will distinguish practical guidance from information
        that must be confirmed with the relevant authority, provider, lender
        or management body.
      </div>
    </div>
  );
}
