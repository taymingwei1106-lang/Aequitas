import Navigation from "../components/Navigation";

export default function MainLayout({ children }) {
  return (
    <>
      <main className="app-container">
        {children}
      </main>

      <Navigation />
    </>
  );
}