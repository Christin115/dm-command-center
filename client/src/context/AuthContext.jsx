import { useEffect, useState } from "react";

import { apiFetch } from "../api";

import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    apiFetch("/check_session")
      .then((userData) => {
        setUser(userData);
        setStatus("authenticated");
      })
      .catch(() => {
        setUser(null);
        setStatus("unauthenticated");
      });
  }, []);

  function login(userData) {
    setUser(userData);
    setStatus("authenticated");
  }

  function logout() {
    setUser(null);
    setStatus("unauthenticated");
  }

  return (
    <AuthContext.Provider value={{ user, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
