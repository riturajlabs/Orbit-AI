import { useNavigate } from 'react-router-dom';
import AIShowcase from '../components/AIShowcase';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="page-shell page-shell--home">
      <section className="hero-card">
        
        {/* LEFT CONTENT */}
        <div className="hero-card__content">
          
          <div className="hero-badge">
            <i className="bi bi-stars"></i>
            Built with Modern AI Technology
          </div>

          <p className="section-kicker">AI POWERED WORKSPACE</p>

          <h1>
            Chat, create and learn with your personal AI assistant.
          </h1>

          <p className="hero-card__copy">
            Orbit AI helps you chat, code, research and create faster
            with a modern AI workspace. Your conversations stay organized,
            intelligent and available anytime.
          </p>

          {/* ACTION BUTTONS (Restructured for better hierarchy) */}
          <div className="hero-card__actions">
            <button
              type="button"
              className="btn btn-primary btn-lg primary-cta"
              onClick={() => navigate('/chat')}
            >
              <i className="bi bi-chat-dots me-2"></i>
              Start Conversation
            </button>

            <div className="auth-buttons">
              <button
                type="button"
                className="btn btn-outline-light btn-lg"
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-lg"
                onClick={() => navigate('/register')}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* UNIFIED TRUST FEATURES */}
          <div className="hero-trust-grid">
            <div className="trust-item">
              <i className="bi bi-shield-check"></i> Secure & Private
            </div>
            <div className="trust-item">
              <i className="bi bi-lightning-charge-fill"></i> Fast Responses
            </div>
            <div className="trust-item">
              <i className="bi bi-code-slash"></i> Dev Assistant
            </div>
          </div>

        </div>

        {/* RIGHT CONTENT */}
        <div className="hero-card__panel">
          <AIShowcase />

          <div className="mini-features">
            <div>
              <i className="bi bi-chat-square-text"></i>
              <span>Persistent Chats</span>
            </div>
            <div>
              <i className="bi bi-code-slash"></i>
              <span>Coding Assistant</span>
            </div>
            <div>
              <i className="bi bi-phone"></i>
              <span>Mobile Ready</span>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}