import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { apiFetch } from "../api";

function RequireAuth({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    apiFetch("/check_session")
      .then(() => setStatus("authenticated"))
      .catch(() => setStatus("unauthenticated"));
  }, []);

  if (status === "checking") {
    return (
      <main>
        <p>Loading...</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RequireAuth;
