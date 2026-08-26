import { createContext, useContext, useMemo, useState } from "react";
import PropertyRepository from "../repositories/PropertyRepository";

const PortfolioContext = createContext(null);

export function PortfolioProvider({ children }) {
  const [portfolio, setPortfolio] = useState(
    PropertyRepository.getAll()
  );

  function refreshPortfolio() {
    setPortfolio(PropertyRepository.getAll());
  }

  const value = useMemo(
    () => ({
      portfolio,
      refreshPortfolio,
    }),
    [portfolio]
  );

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);

  if (!context) {
    throw new Error(
      "usePortfolio must be used within a PortfolioProvider."
    );
  }

  return context;
}