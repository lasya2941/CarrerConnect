import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function Login({ onLogin, onSwitch }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(API + "/auth/login", form);
      onLogin(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Cannot connect to backend");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-art">
        <div className="art-content">
          <span className="eyebrow">YOUR CAREER STARTS HERE</span>
          <h1>Find your next opportunity.</h1>
          <p>Discover jobs, apply with confidence and track your career journey in one place.</p>
          <div className="art-stat">
            <strong>Explore.</strong>
            <strong>Apply.</strong>
            <strong>Grow.</strong>
          </div>
        </div>
      </section>

      <section className="auth-side">
        <form className="auth-card" onSubmit={submit}>
          <div className="logo-mark">CT</div>
          <h2>Welcome back!</h2>
          <p className="muted">Sign in to continue to CareerTrack.</p>

          {error && <p className="error">{error}</p>}

          <label>Email address</label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={update}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={update}
            required
          />

          <button className="primary-button" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>

          <p className="switch-text">
            Don't have an account?{" "}
            <button type="button" className="text-button" onClick={onSwitch}>
              Register
            </button>
          </p>
        </form>
      </section>
    </main>
  );
};