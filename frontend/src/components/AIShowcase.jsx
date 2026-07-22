export default function AIShowcase() {

  return (

    <div className="ai-showcase">


      <div className="ai-showcase__header">

        <div className="ai-showcase__logo">
          <i className="bi bi-stars"></i>
        </div>

        <div>
          <strong>
            Orbit AI
          </strong>

          <span>
            Online Assistant
          </span>
        </div>


        <div className="ai-status">

          <span></span>

          Online

        </div>


      </div>



      <div className="ai-chat-preview">


        <div className="preview-message preview-user">

          <div className="preview-label">
            You
          </div>

          Explain React hooks

        </div>



        <div className="preview-message preview-ai">

          <div className="preview-label">
            AI Assistant
          </div>


          React hooks allow functional
          components to use state and
          lifecycle features easily.


        </div>




        <div className="preview-message preview-user">

          <div className="preview-label">
            You
          </div>

          Generate API code

        </div>



        <div className="preview-message preview-ai">

          <div className="preview-label">
            AI Assistant
          </div>

          Here's your Express API
          structure with authentication.

        </div>


      </div>


    </div>

  );
}