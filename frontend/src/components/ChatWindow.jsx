import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useChat from "../hooks/useChat";
import { useState } from "react";


import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export default function ChatWindow({ title, messages, isTyping }) {
  const navigate = useNavigate();
  
  const endOfMessagesRef = useRef(null);
  const menuRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);

 

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
  const handler = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setShowMenu(false);
    }
  };

  

  document.addEventListener("mousedown", handler);

  return () => {
    document.removeEventListener("mousedown", handler);
  };
}, []);

  const {
  setIsSidebarOpen,
  activeConversationId,
  clearActiveConversation,
  renameConversation,
} = useChat();

  const handleDeleteChat = async () => {
  await clearActiveConversation();
  setShowMenu(false);
};

  const handleRenameChat = () => {
  const newTitle = prompt("Enter new chat name");

  if (!newTitle?.trim()) return;

  renameConversation(activeConversationId, newTitle);

  setShowMenu(false);
};

  return (
    <section className="chat-window">
      <header className="chat-window__header">


        <div className="d-flex align-items-center gap-3">

          <button
            type="button"
            className="btn fs-2 d-lg-none p-0 chat-window__menu-button"
            onClick={() => setIsSidebarOpen(true)}
          >
            <i className="bi bi-list"></i>
          </button>

          <div className="brand-button">
            <span className="brand-button__mark fs-5">
              <i className="bi bi-stars"></i>
            </span>

            <span className="brand-button__text">
              Orbit AI
            </span>
          </div>

        </div>

        <div className="d-flex align-items-center gap-3">

          <div className="chat-window__status">
            <span className="status-dot"></span>
            Online
          </div>

          <div
            className="position-relative"
            ref={menuRef}
          >

            <button
                className="chat-menu-btn"
                onClick={() => setShowMenu(!showMenu)}
            >
                <i className="bi bi-three-dots"></i>
            </button>
            {showMenu && (

              <div className="chat-menu">

                  <div className="chat-menu__label">
                      Conversation
                  </div>

                  <button
                      className="chat-menu__item"
                      onClick={handleRenameChat}
                  >
                      <i className="bi bi-pencil-square"></i>

                      Rename Chat
                  </button>

                  <div className="chat-menu__divider"></div>

                  <button
                      className="chat-menu__item chat-menu__item--danger"
                      onClick={handleDeleteChat}
                  >
                      <i className="bi bi-trash3"></i>

                      Delete Chat
                  </button>

              </div>

              )}

          </div>
        </div>

        

      </header>

      <div className="chat-window__body" ref={chatContainerRef}>
        {messages.length === 0 ? (

  <div className="empty-state">


    <div className="empty-state__icon">

      <i className="bi bi-stars" />

    </div>



    <h3>
      Start a new conversation
    </h3>



    <p>
      Ask anything — learn, code, research,
      or explore ideas with Orbit AI.
    </p>




    <div className="empty-state__suggestions">


      <button type="button">

        <i className="bi bi-code-slash"></i>

        Explain React Hooks

      </button>



      <button type="button">

        <i className="bi bi-cpu"></i>

        Build an AI Project

      </button>



      <button type="button">

        <i className="bi bi-book"></i>

        Learn Machine Learning

      </button>



      <button type="button">

        <i className="bi bi-lightbulb"></i>

        Generate Ideas

      </button>


    </div>



  </div>


) : (

  messages.map((message) => (
    <MessageBubble
      key={message.id}
      message={message}
    />
  ))

)}
        {isTyping ? <TypingIndicator /> : null}
        <div ref={endOfMessagesRef} />
      </div>
    </section>
  );
}
