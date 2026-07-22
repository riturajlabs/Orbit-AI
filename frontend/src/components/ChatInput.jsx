import { useState } from 'react';

export default function ChatInput({ onSend, disabled = false, isLoading = false }) {
  const [draft, setDraft] = useState('');

  const submitMessage = () => {
    if (!draft.trim() || disabled || isLoading) {
      return;
    }

    onSend(draft);
    setDraft('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submitMessage();
    }
  };

  return (
    <div className="chat-input-shell">
      <div className="chat-input-card">
        <div className="chat-input-card__prefix d-none d-md-flex">
          <span className="chat-input-card__icon">
            <i className="bi bi-chat-text" />
          </span>
        </div>

        <textarea
          className="form-control chat-input-textarea"
          rows="1"
          placeholder="How can I help you today?"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button
        type="button"
        className="btn btn-primary chat-send-button"
        onClick={submitMessage}
        disabled={disabled || isLoading || !draft.trim()}
        >
          {isLoading ? (
            <span className="spinner-border spinner-border-sm" />
          ) : (
            <i className="bi bi-send-fill" />
          )}

          <span className="send-text">
            {isLoading ? "Sending" : "Send"}
          </span>

        </button>
      </div>
      
    </div>
  );
}
