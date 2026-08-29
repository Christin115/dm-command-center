import {
  Link,
  useNavigate
} from "react-router-dom";

import { apiFetch } from "../api";


function Navbar() {

  const navigate = useNavigate();


  async function handleLogout() {

    try {

      await apiFetch(
        "/logout",
        {
          method: "DELETE"
        }
      );

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

      <Link to="/dashboard">
        Dashboard
      </Link>

      <Link to="/compendium">
        Compendium
      </Link>

      <Link to="/login">
        Login
      </Link>

      <Link to="/signup">
        Signup
      </Link>

      <button onClick={handleLogout}>
        Logout
      </button>

    </nav>
  );
}

export default Navbar;