import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import PropertyWizard from "./pages/PropertyWizard";
import PropertyDetails from "./pages/PropertyDetails";
import PropertyMonthly from "./pages/PropertyMonthly";
import PropertyCalculator from "./pages/PropertyCalculator";
import DecisionLab from "./pages/DecisionLab";
import InvestorGuides from "./pages/InvestorGuides";
import InvestorTools from "./pages/InvestorTools";
import Settings from "./pages/Settings";
import TaxSummary from "./pages/TaxSummary";
import ShareCard from "./pages/ShareCard";
import PropertyReport from "./pages/PropertyReport";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />

      <Route
        path="/home"
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />

      <Route
        path="/portfolio"
        element={
          <MainLayout>
            <Portfolio />
          </MainLayout>
        }
      />

      <Route
        path="/property/:id"
        element={
          <MainLayout>
            <PropertyDetails />
          </MainLayout>
        }
      />

      {/* Printable report: no navigation so it prints as a clean page. */}
      <Route
        path="/property/:id/report"
        element={
          <ErrorBoundary label="This report">
            <PropertyReport />
          </ErrorBoundary>
        }
      />

      <Route
        path="/property/:id/monthly"
        element={
          <MainLayout>
            <PropertyMonthly />
          </MainLayout>
        }
      />

      <Route
        path="/property/:id/edit"
        element={
          <MainLayout>
            <PropertyWizard />
          </MainLayout>
        }
      />

      <Route
        path="/add"
        element={
          <MainLayout>
            <PropertyWizard />
          </MainLayout>
        }
      />

      {/*
        Opportunity Finder has been retired: its buy/sell/refinance prompts
        conflicted with Aequitas's "explain, don't push" approach, and
        Decision Lab covers the same scenarios with transparent inputs.
        Old links land on Decision Lab. The page file is kept.
      */}
      <Route path="/opportunities" element={<Navigate to="/decision-lab" replace />} />

      <Route
        path="/decision-lab"
        element={
          <MainLayout>
            <DecisionLab />
          </MainLayout>
        }
      />

      <Route
        path="/guides"
        element={
          <MainLayout>
            <InvestorGuides />
          </MainLayout>
        }
      />

      <Route
        path="/calculator"
        element={
          <MainLayout>
            <InvestorTools />
          </MainLayout>
        }
      />

      <Route
        path="/settings"
        element={
          <MainLayout>
            <Settings />
          </MainLayout>
        }
      />

      <Route
        path="/tax"
        element={
          <MainLayout>
            <TaxSummary />
          </MainLayout>
        }
      />

      <Route
        path="/share"
        element={
          <MainLayout>
            <ShareCard />
          </MainLayout>
        }
      />

      {/* Legacy calculator route remains available for compatibility. */}
      <Route path="/legacy-calculator" element={<PropertyCalculator />} />
    </Routes>
  );
}
