import useChat from '../hooks/useChat';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { theme, setTheme, setIsSidebarOpen } = useChat();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="topbar navbar navbar-expand-lg">
      <div className="container-fluid px-0">
        <button
          type="button"
          className="btn btn-outline-light d-lg-none me-2"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <i className="bi bi-list" />
        </button>

        <button type="button" className="navbar-brand brand-button" onClick={() => navigate('/chat')}>
          <span className="brand-button__mark">
            <i className="bi bi-stars" />
          </span>
          <span className="brand-button__text">AI Chatbot</span>
          
        </button>

        <div className="ms-auto d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-outline-light btn-sm"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <i className={`bi ${theme === 'dark' ? 'bi-sun' : 'bi-moon-stars'}`} />
          </button>

          <div className="profile-pill">
            <div className="profile-pill__avatar">{isAuthenticated ? (user?.username || user?.name || 'U').slice(0, 2).toUpperCase() : 'AR'}</div>
            <div className="profile-pill__meta d-none d-sm-block">
              <strong>{isAuthenticated ? (user?.username || user?.name || 'Authenticated user') : 'Anonymous'}</strong>
              <span>{isAuthenticated ? null : 'Demo user'}</span>
            </div>
          </div>

          {isAuthenticated ? (
            <button
              type="button"
              className="btn btn-outline-light btn-sm"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Signing out...' : 'Logout'}
            </button>
          ) : (
            <button type="button" className="btn btn-outline-light btn-sm" onClick={() => navigate('/login')}>
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
