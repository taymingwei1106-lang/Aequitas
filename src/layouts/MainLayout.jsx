import { useLocation } from "react-router-dom";

import Navigation from "../components/Navigation";
import ErrorBoundary from "../components/ErrorBoundary";

export default function MainLayout({ children }) {
  const location = useLocation();

  return (
    <>
      <main className="app-container">
        <ErrorBoundary label="This page" resetKey={location.pathname}>
          {children}
        </ErrorBoundary>
      </main>

      <Navigation />
    </>
  );
}
