import {
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  apiFetch
} from "../api";

import { useAuth } from "../context/useAuth";


function Signup() {

  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] =
    useState({
      username: "",
      email: "",
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

    setError("");

    try {

      const userData = await apiFetch(
        "/signup",
        {
          method: "POST",
          body: JSON.stringify(
            formData
          )
        }
      );

      login(userData);

      navigate("/dashboard");

    } catch (error) {

      setError(error.message);
    }
  }


  return (
    <main>

      <h1>Create Account</h1>

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
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
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
          Sign Up
        </button>

      </form>

    </main>
  );
}

export default Signup;