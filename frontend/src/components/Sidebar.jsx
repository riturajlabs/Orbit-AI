import useChat from '../hooks/useChat';
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import { formatDateLabel } from "../utils/date";

const formatName = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// 1. HELPER: Image URL ko full backend URL me convert karne ke liye
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('blob:') || path.startsWith('http')) return path;
  
  const BACKEND_URL = 'http://localhost:5000'; // Apne backend ka port check kar lijiye
  return `${BACKEND_URL}${path}`;
};

export default function Sidebar() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const {
    conversations,
    activeConversationId,
    startNewChat,
    isSidebarOpen,
    setIsSidebarOpen,
    isLoadingChats,
    theme,
    setTheme,
  } = useChat();

  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const rawName = isAuthenticated ? (user?.name || user?.username) : "Guest User";
  const displayName = isAuthenticated ? formatName(rawName) : rawName;

  const initials = isAuthenticated
    ? displayName
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "GU";

  // Avatar URL resolution
  const avatarUrl = isAuthenticated ? getImageUrl(user?.avatar) : null;

  const handleOpenChat = (conversationId) => {
    navigate(`/chat/${conversationId}`);
  };

  const handleNewChat = async () => {
    const newChat = await startNewChat();
    if (newChat?.id) {
      navigate(`/chat/${newChat.id}`);
    }
  };

  return (
    <>
      <div
        className={`sidebar-backdrop ${isSidebarOpen ? 'sidebar-backdrop--open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isSidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__top">
          <div className='p-2'>
            <p className="sidebar__eyebrow">WORKSPACE</p>
            <p className="sidebar__title fs-5">
              <span className="brand-button__mark">
                <i className="bi bi-stars" />
              </span>
            </p>
            <p className="sidebar__subtitle">
              Your intelligent AI assistant for coding, writing, research and everyday tasks.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-sm sidebar__close d-lg-none chat-window__menu-button"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <button type="button" className="btn btn-primary w-100 sidebar__new-chat" onClick={handleNewChat}>
          <i className="bi bi-plus-lg me-2" />
          New Chat
        </button>

        <div className="sidebar__section">
          <div className="sidebar__section-head">
            <span>Recent Chats</span>
            <span className="badge rounded-pill text-bg-secondary">{conversations.length}</span>
          </div>

          <div className="sidebar__list">
            {isLoadingChats ? (
              <div className="sidebar__loading">
                <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                Loading chats...
              </div>
            ) : null}

            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                className={`sidebar__item ${conversation.id === activeConversationId ? 'sidebar__item--active' : ''}`}
                onClick={() => handleOpenChat(conversation.id)}
              >
                <div className="sidebar__item-icon">
                  <i className="bi bi-chat-left-text" />
                </div>
                <div className="sidebar__item-content">
                  <strong>{conversation.title}</strong>
                  <span className="fs-6 text-muted">
                    {formatDateLabel(conversation.updatedAt)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar__footer">
          <div className="position-relative">
            <button
              type="button"
              className="profile-pill w-100 border-0"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              {/* 👇 Profile Avatar with Fallback to Initials */}
              <div 
                className="profile-pill__avatar overflow-hidden d-flex align-items-center justify-content-center"
                style={{ width: '36px', height: '36px', borderRadius: '50%' }}
              >
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={displayName} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              <div className="profile-pill__meta">
                <strong>{displayName}</strong>
                <span>
                  {isAuthenticated ? "Personal Workspace" : "Not Signed In"}
                </span>
              </div>
              <i
                className={`bi ms-auto ${
                  showProfileMenu ? "bi-chevron-up" : "bi-chevron-down"
                }`}
              />
            </button>

            {showProfileMenu && (
              <div className="profile-dropdown">
                
                {/* 1. Theme Button */}
                <button
                  className="dropdown-item"
                  onClick={toggleTheme}
                >
                  <i
                    className={`bi ${
                      theme === "dark" ? "bi-sun" : "bi-moon-stars"
                    } me-2`}
                  />
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </button>

                <hr className="dropdown-divider" />

                {/* 2. Authenticated Options */}
                {isAuthenticated ? (
                  <>
                    <button 
                      className="dropdown-item" 
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/"); 
                      }}
                    >
                      <i className="bi bi-house me-2" />
                      Home
                    </button>

                    <button 
                      className="dropdown-item" 
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/profile"); 
                      }}
                    >
                      <i className="bi bi-person me-2" />
                      Profile
                    </button>

                    <button className="dropdown-item">
                      <i className="bi bi-gear me-2" />
                      Settings
                    </button>

                    <hr className="dropdown-divider" />

                    <button
                      className="dropdown-item text-danger"
                      onClick={async () => {
                        await logout();
                        navigate("/");
                      }}
                      disabled={isLoading}
                    >
                      <i className="bi bi-box-arrow-right me-2" />
                      {isLoading ? "Signing Out..." : "Logout"}
                    </button>
                  </>
                ) : (
                  /* 3. Guest Options */
                  <>
                    <button 
                      className="dropdown-item" 
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/"); 
                      }}
                    >
                      <i className="bi bi-house me-2" />
                      Home
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => navigate("/login")}
                    >
                      <i className="bi bi-box-arrow-in-right me-2" />
                      Login
                    </button>
                  </>
                )}

              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}