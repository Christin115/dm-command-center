import {
  Routes,
  Route
} from "react-router-dom";

import Navbar from "./components/Navbar";
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
          element={<Dashboard />}
        />

        <Route
          path="/campaigns/:id"
          element={<CampaignDetails />}
        />

        <Route
          path="/campaigns/:campaignId/encounters/:encounterId"
          element={<EncounterBuilder />}
        />

        <Route
          path="/compendium"
          element={<Compendium />}
        />

      </Routes>
    </>
  );
}

export default App;
