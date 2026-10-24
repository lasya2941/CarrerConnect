import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function Register({ onRegister, onSwitch }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });
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
      const response = await axios.post(API + "/auth/register", form);
      onRegister(response.data);
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
          <span className="eyebrow">BUILD YOUR FUTURE</span>
          <h1>Your next chapter begins today.</h1>
          <p>Create an account to discover opportunities and manage applications.</p>
          <div className="art-stat">
            <strong>Learn.</strong>
            <strong>Connect.</strong>
            <strong>Succeed.</strong>
          </div>
        </div>
      </section>

      <section className="auth-side">
        <form className="auth-card" onSubmit={submit}>
          <div className="logo-mark">CT</div>
          <h2>Create account</h2>
          <p className="muted">Join CareerTrack today.</p>

          {error && <p className="error">{error}</p>}

          <label>Full name</label>
          <input
            name="name"
            placeholder="Enter your name"
            value={form.name}
            onChange={update}
            required
          />

          <label>Email address</label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={update}
            required
          />

          <label>Password (minimum 6 characters)</label>
          <input
            type="password"
            name="password"
            minLength={6}
            placeholder="Create a password"
            value={form.password}
            onChange={update}
            required
          />

          <label>Account type</label>
          <select name="role" value={form.role} onChange={update}>
            <option value="student">Student / Job Seeker</option>
            <option value="hr">HR / Recruiter</option>
          </select>

          <button className="primary-button" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="switch-text">
            Already registered?{" "}
            <button type="button" className="text-button" onClick={onSwitch}>
              Login
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}