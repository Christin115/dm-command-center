import {
  Routes,
  Route
} from "react-router-dom";

import Navbar from "./components/Navbar";
import RequireAuth from "./components/RequireAuth";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CampaignDetails from "./pages/CampaignDetails";
import EncounterBuilder from "./pages/EncounterBuilder";
import Compendium from "./pages/Compendium";


function App() {
  return (
    <>
      <Navbar />

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />

        <Route
          path="/campaigns/:id"
          element={
            <RequireAuth>
              <CampaignDetails />
            </RequireAuth>
          }
        />

        <Route
          path="/campaigns/:campaignId/encounters/:encounterId"
          element={
            <RequireAuth>
              <EncounterBuilder />
            </RequireAuth>
          }
        />

        <Route
          path="/compendium"
          element={
            <RequireAuth>
              <Compendium />
            </RequireAuth>
          }
        />

      </Routes>
    </>
  );
}

export default App;
