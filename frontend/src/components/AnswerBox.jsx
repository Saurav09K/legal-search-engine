import ReactMarkdown from "react-markdown";

function AnswerBox({ answer, isLoading }) {
  return (
    <article className="answer-box">
      <h2 className="section-title">Answer</h2>

      {isLoading ? (
        <p className="loading-text">Thinking...</p>
      ) : (
        <div className="answer-text fade-in">
          <ReactMarkdown>
            {answer || 'Run a search to generate an answer from your retrieved context.'}
          </ReactMarkdown>
        </div>
      )}
    </article>
  );
}

export default AnswerBox;