function ChatWindow({ history, input, setInput, onSubmit, isLoading, onReset }) {
  return (
    <section className="chat-shell" aria-label="Chat conversation">
      <div className="chat-header">
        <div>
          <p className="eyebrow">Chat conversation</p>
          <p className="chat-hint">Continue the conversation with the index. Your session history is preserved for the current browser session.</p>
        </div>
        <button type="button" className="secondary-button" onClick={onReset}>
          Reset chat
        </button>
      </div>

      <div className="chat-history">
        {history.length === 0 ? (
          <div className="chat-empty">No messages yet. Send a message to begin the conversation.</div>
        ) : (
          history.map((message, index) => (
            <article
              key={`${message.role}-${index}`}
              className={`chat-message ${message.role === 'User' ? 'chat-message-user' : 'chat-message-ai'}`}
            >
              <span className="chat-role">{message.role}</span>
              <p>{message.content}</p>
            </article>
          ))
        )}
      </div>

      <form className="chat-form" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="chat-input">
          Chat input
        </label>
        <textarea
          id="chat-input"
          className="chat-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type your question here..."
          rows={2}
          disabled={isLoading}
        />
        <button type="submit" className="chat-send-button" disabled={isLoading || !input.trim()}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </section>
  )
}

export default ChatWindow
