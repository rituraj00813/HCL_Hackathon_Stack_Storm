import React, { useState } from "react";
import { register } from "../services/api";

function RegisterPage({ onRegisterSuccess, onSwitchToLogin }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await register(form);
      onRegisterSuccess(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-layout">
      <div className="section-card intro-panel">
        <p className="eyebrow">Register</p>
        <h2>Create a customer account and receive a JWT immediately after signup.</h2>
        <p className="muted-text">
          Self-registration creates only `USER` accounts. Admin access stays protected.
        </p>
      </div>

      <form className="section-card auth-form" onSubmit={handleSubmit}>
        <p className="eyebrow">New account</p>
        <h2>Start ordering</h2>

        <label className="field">
          <span>Name</span>
          <input
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            required
          />
        </label>

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
            minLength="6"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
            required
          />
        </label>

        {error && <p className="error-banner">{error}</p>}

        <button type="submit" className="primary-btn wide-btn" disabled={submitting}>
          {submitting ? "Creating account..." : "Register"}
        </button>

        <button type="button" className="text-btn" onClick={onSwitchToLogin}>
          Already registered? Login
        </button>
      </form>
    </section>
  );
}

export default RegisterPage;
