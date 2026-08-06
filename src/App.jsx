import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import PropertyWizard from "./pages/PropertyWizard";
import PropertyDetails from "./pages/PropertyDetails";

function Settings() {
    return <h1>Settings</h1>;
}

export default function App() {

    return (

        <Routes>

            <Route
                path="/"
                element={<Navigate to="/home" replace />}
            />

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

            <Route
                path="/settings"
                element={
                    <MainLayout>
                        <Settings />
                    </MainLayout>
                }
            />

        </Routes>

    );

}