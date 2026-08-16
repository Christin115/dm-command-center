import {
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  apiFetch
} from "../api";


function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      username: "",
      password: ""
    });

  const [error, setError] =
    useState("");


  function handleChange(event) {

    setFormData({
      ...formData,
      [event.target.name]:
        event.target.value
    });
  }


  async function handleSubmit(event) {

    event.preventDefault();

    try {

      await apiFetch(
        "/login",
        {
          method: "POST",
          body: JSON.stringify(
            formData
          )
        }
      );

      navigate("/dashboard");

    } catch (error) {

      setError(error.message);
    }
  }


  return (
    <main>

      <h1>Login</h1>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>

        <input
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />

        <button type="submit">
          Login
        </button>

      </form>

    </main>
  );
}

export default Login;