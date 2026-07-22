export default function TypingIndicator() {
  return (
    <div className="typing-indicator">
      <div className="typing-indicator__avatar">
        <i className="bi bi-stars" />
      </div>
      <div className="typing-indicator__bubble">
        <span>AI is thinking...</span>
        <span className="typing-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </div>
    </div>
  );
}
