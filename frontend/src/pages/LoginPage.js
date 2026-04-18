import React, { useState } from "react";
import { login } from "../services/api";

function LoginPage({ onLoginSuccess, onSwitchToRegister }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await login(form);
      onLoginSuccess(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-layout">
      <div className="section-card intro-panel">
        <p className="eyebrow">Sprint 0 use case</p>
        <h2>JWT login, admin control, item browsing, cart, and order placement.</h2>
        <p className="muted-text">
          Use a normal account for customer ordering or `admin@retailbite.com /
          admin123` for admin item management.
        </p>
      </div>

      <form className="section-card auth-form" onSubmit={handleSubmit}>
        <p className="eyebrow">Login</p>
        <h2>Welcome back</h2>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
            required
          />
        </label>

        {error && <p className="error-banner">{error}</p>}

        <button type="submit" className="primary-btn wide-btn" disabled={submitting}>
          {submitting ? "Signing in..." : "Login"}
        </button>

        <button type="button" className="text-btn" onClick={onSwitchToRegister}>
          Need an account? Register here
        </button>
      </form>
    </section>
  );
}

export default LoginPage;
