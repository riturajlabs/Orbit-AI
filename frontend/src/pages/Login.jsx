import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import useAuth from '../hooks/useAuth';

export default function Login() {
  const { login, isLoading, error, clearAuthError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    identifier: '', // Email ya Username dono ke liye
    password: ''
  });

  const updateField = (field) => (event) => {
    clearAuthError();
    setForm((current) => ({
      ...current,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Backend ko identifier pass kar rahe hain
      await login({
        emailOrUsername: form.identifier,
        email: form.identifier, // Fallback for safety with older auth context methods
        password: form.password
      });

      navigate('/chat');
    } catch {
      // Error handled by auth context
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">

        <div className="text-center mb-4">
          <div className="empty-state__icon mb-3">
            <i className="bi bi-stars"></i>
          </div>

          <p className="section-kicker">
            Welcome back
          </p>

          <h3>
            Sign in to Orbit AI
          </h3>

          <p className="text-body-secondary">
            Continue your conversations, build ideas,
            and explore AI-powered assistance.
          </p>
        </div>

        {error && (
          <div
            className="alert alert-danger auth-alert"
            role="alert"
          >
            {error}
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
          noValidate
        >

          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-person"></i> {/* Updated icon to person/envelope combination */}
            </span>

            <input
              className="form-control form-control-lg"
              type="text" // type="text" focus kiya taaki username accept ho sake
              placeholder="Email or Username"
              value={form.identifier}
              onChange={updateField('identifier')}
              required
            />
          </div>

          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-lock"></i>
            </span>

            <input
              className="form-control form-control-lg"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={updateField('password')}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-100 mt-2"
            disabled={isLoading}
          >
            {isLoading
              ? <Loader label="Signing in..." />
              : "Sign In"
            }
          </button>

        </form>

        <div className="text-center mt-4">
          <span className="text-body-secondary">
            Don't have an account?
          </span>

          <button
            type="button"
            className="btn btn-link p-0 ms-2"
            onClick={() => navigate('/register')}
          >
            Create account
          </button>
        </div>

      </div>
    </div>
  );
}