import {
  Link,
  useNavigate
} from "react-router-dom";

import { apiFetch } from "../api";
import { useAuth } from "../context/useAuth";


function Navbar() {

  const navigate = useNavigate();

  const { status, logout } = useAuth();
  const isAuthenticated = status === "authenticated";


  async function handleLogout() {

    try {

      await apiFetch(
        "/logout",
        {
          method: "DELETE"
        }
      );

      logout();

      navigate("/login");

    } catch (error) {

      console.error(error);
    }
  }


  return (
    <nav>

      <h2>DM Command Center</h2>

      <Link to="/">
        Home
      </Link>

      {isAuthenticated && (
        <>
          <Link to="/dashboard">
            Dashboard
          </Link>

          <Link to="/compendium">
            Compendium
          </Link>
        </>
      )}

      {isAuthenticated ? (
        <button onClick={handleLogout}>
          Logout
        </button>
      ) : (
        <>
          <Link to="/login">
            Login
          </Link>

          <Link to="/signup">
            Signup
          </Link>
        </>
      )}

    </nav>
  );
}

export default Navbar;
