import { useEffect, useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ children, language }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    // Yahan style add kiya gaya hai strictly bound karne ke liye
    <div className="code-block" style={{ maxWidth: "100%", overflow: "hidden" }}>
      
      <div className="code-block__header">
        <div className="terminal-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span>{language || "code"}</span>
        <button onClick={copyCode}>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <div className="code-block__wrapper" style={{ maxWidth: "100%" }}>
        <SyntaxHighlighter
          language={language || "text"}
          style={oneDark}
          wrapLongLines={false} // Horizontal scrolling ke liye false hi theek hai
          customStyle={{
            margin: 0,
            padding: "16px",
            borderRadius: "0 0 14px 14px",
            fontSize: "14px",
            background: "#0d1117",
            maxHeight: "500px",
            overflowX: "auto", // Ye strictly horizontal scroll allow karega
            maxWidth: "100%",  // Ye container ko screen ke bahar nahi jane dega
          }}
          codeTagProps={{
            style: {
              fontFamily: "Fira Code, monospace",
              // whiteSpace: "pre" ko remove kar diya gaya hai kyunki highlighter 
              // isko natively acche se handle karta hai.
            }
          }}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const [displayContent,setDisplayContent]=useState(
    message.content
);

  useEffect(() => {

  if (!message.content) {
    return;
  }


  if (isUser || !message.isNew) {

    setDisplayContent(message.content);
    return;

  }


  let index = -3;

  setDisplayContent("");


  const interval = setInterval(() => {


    setDisplayContent((prev) =>
      prev + message.content.slice(index,index+3)
    );


    index += 3;


    if(index >= message.content.length){

      clearInterval(interval);

    }


  },15);



  return () => clearInterval(interval);


},[
  message.content,
  isUser,
  message.isNew
]);

  return (
    <div className={`message-row ${isUser ? 'message-row--user' : 'message-row--assistant'}`}>
      <div className={`message-bubble ${isUser ? 'message-bubble--user' : 'message-bubble--assistant'}`}>
        
        <div className="message-bubble__header">
          <div className="message-bubble__identity">
            <span className="message-bubble__avatar">
              <i className={`bi ${isUser ? 'bi-person-fill' : 'bi-stars'}`} />
            </span>
            <span className="message-bubble__role">
              {isUser ? 'You' : 'AI Assistant'}
            </span>
          </div>
          
          <span className="message-bubble__time">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div className="message-bubble__content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              pre({ children }) {
                return <>{children}</>;
              },
              code({ children, className }) {
                const match = /language-(\w+)/.exec(className || "");
                const isBlock = Boolean(match);

                if (isBlock) {
                  return (
                    <CodeBlock language={match[1]}>
                      {String(children).replace(/\n$/, "")}
                    </CodeBlock>
                  );
                }

                return (
                  <code className={className}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {displayContent}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}