import api from "../api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getValidToken } from "../utils/auth";

// Login screen for existing users.
// On success it stores the JWT and redirects to the home page.
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login - Civic Issues Reporting";
  }, []);

  // Submit the login form and store the JWT if authentication succeeds.
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  useEffect(() => {
    const token = getValidToken();
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="tag">Welcome back</span>
        <h2>Login to Civic Duty</h2>
        <p className="muted">
          Sign in to report issues, review updates, and manage tasks.
        </p>
        <form onSubmit={handleSubmit} className="stack-form">
          <div className="field-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="field-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          <button className="primary-button" type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
