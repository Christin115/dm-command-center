import { Navigate } from "react-router-dom";

import { useAuth } from "../context/useAuth";

function RequireAuth({ children }) {
  const { status } = useAuth();

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
