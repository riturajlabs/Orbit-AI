export default function MainLayout({ sidebar,  content, composer }) {
  return (
    <div className="app-shell">
      {sidebar}

      <main className="chat-area">
  
        <div className="chat-area__inner">
          {content}
          {composer}
        </div>
      </main>
    </div>
  );
}
