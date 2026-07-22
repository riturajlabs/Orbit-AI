import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import useAuth from '../hooks/useAuth';

export default function Register() {
  const { register, isLoading, error, clearAuthError } = useAuth();
  const navigate = useNavigate();

  // 1. ADDED 'name' here so it properly goes to the backend
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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
      // 2. Ab yahan se backend ko form.name bhi jayega
      await register(form);
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
          <p className="section-kicker">Join Orbit AI</p>
          <h3>Create your account</h3>
          <p className="text-body-secondary">
            Start conversations, explore ideas, write code,
            and learn with your AI assistant.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger auth-alert" role="alert">
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          
          {/* FULL NAME FIELD (Properly Separated) */}
          <div className="input-group mb-3">
            <span className="input-group-text">
              <i className="bi bi-person-badge"></i>
            </span>
            <input
              className="form-control form-control-lg"
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={updateField('name')}
              required
            />
          </div>

          {/* USERNAME FIELD */}
          <div className="input-group mb-3">
            <span className="input-group-text">
              <i className="bi bi-person"></i>
            </span>
            <input
              className="form-control form-control-lg"
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={updateField('username')}
              required
            />
          </div>

          {/* EMAIL FIELD */}
          <div className="input-group mb-3">
            <span className="input-group-text">
              <i className="bi bi-envelope"></i>
            </span>
            <input
              className="form-control form-control-lg"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={updateField('email')}
              required
            />
          </div>

          {/* PASSWORD FIELD */}
          <div className="input-group mb-3">
            <span className="input-group-text">
              <i className="bi bi-lock"></i>
            </span>
            <input
              className="form-control form-control-lg"
              type="password"
              placeholder="Create password"
              value={form.password}
              onChange={updateField('password')}
              required
            />
          </div>

          {/* CONFIRM PASSWORD FIELD */}
          <div className="input-group mb-3">
            <span className="input-group-text">
              <i className="bi bi-shield-check"></i>
            </span>
            <input
              className="form-control form-control-lg"
              type="password"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={updateField('confirmPassword')}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-100 mt-2"
            disabled={isLoading}
          >
            {isLoading ? <Loader label="Creating account..." /> : "Create Account"}
          </button>

        </form>

        <div className="text-center mt-4">
          <span className="text-body-secondary">Already have an account?</span>
          <button
            type="button"
            className="btn btn-link p-0 ms-2"
            onClick={() => navigate('/login')}
          >
            Sign in
          </button>
        </div>

      </div>
    </div>
  );
}