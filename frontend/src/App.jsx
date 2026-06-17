import { useState } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import AnswerBox from './components/AnswerBox';
import SourcesList from './components/SourcesList';

const API_BASE_URL = 'http://localhost:5000';

function App() {
  const [query, setQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [sources, setSources] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  
  // Chat memory states
  const [chatMode, setChatMode] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");   

  const startConversation = () => {
    setSessionId(`session_${Date.now()}`);
    setChatMode(true);
    setChatHistory([
        { role: 'User', content: query },
        { role: 'AI', content: aiAnswer } 
    ]);
  };

const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isAsking) return;

    const userMsg = { role: 'User', content: chatInput };
    setChatHistory((prev) => [...prev, userMsg]);
    setChatInput(""); 
    setIsAsking(true);

    try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, message: userMsg.content })
        });

        const data = await response.json();
        
        // console.log("RAW BACKEND RESPONSE:", data);
        
        let safeAnswer = "Could not parse answer. Check browser console for raw data.";
        
        if (!response.ok || data.error) {
            safeAnswer = `Backend Error: ${data.error || 'Server crashed. Check Node.js terminal.'}`;
        } 
        else if (typeof data.answer === 'string') {
            safeAnswer = data.answer; 
        } else if (data.answer && typeof data.answer.answer === 'string') {
            safeAnswer = data.answer.answer; 
        } else if (typeof data === 'string') {
            safeAnswer = data;
        }

        setChatHistory((prev) => [...prev, { role: 'AI', content: safeAnswer }]);
        
        const safeSources = data.sources || (data.answer && data.answer.sources) || [];
        if (safeSources.length > 0) {
            setSources(safeSources);
        }

    } catch (error) {
        console.error("Chat error", error);
        setChatHistory((prev) => [...prev, { role: 'AI', content: "Sorry, the frontend failed to connect to the backend entirely." }]);
    } finally {
        setIsAsking(false);
    }
  };


  const handleSearch = async (event) => {
    event.preventDefault();
    const trimmedQuery = query.trim();

    if (!trimmedQuery || isSearching || isAsking) return;

    setAiAnswer('');
    setSources([]);
    setChatMode(false);
    setChatHistory([]);
    setIsSearching(true);
    setIsAsking(true);

    const encodedQuery = encodeURIComponent(trimmedQuery);

    try {
      const searchPromise = fetch(`${API_BASE_URL}/api/search?q=${encodedQuery}`)
        .then(async (response) => {
          if (!response.ok) throw new Error(`Search failed with status ${response.status}`);
          return response.json();
        })
        .then((data) => {
          setSources(Array.isArray(data) ? data : []);
          return data;
        })
        .catch((error) => {
          console.error(error);
          setSources([]);
          return [];
        })
        .finally(() => setIsSearching(false));

      const askPromise = fetch(`${API_BASE_URL}/api/ask?q=${encodedQuery}`)
        .then(async (response) => {
          if (!response.ok) throw new Error(`Ask failed with status ${response.status}`);
          return response.json();
        })
        .then((data) => {
          setAiAnswer(data?.answer || '');
          return data;
        })
        .catch((error) => {
          console.error(error);
          setAiAnswer('');
          return { answer: '' };
        })
        .finally(() => setIsAsking(false));

      await Promise.all([searchPromise, askPromise]);
    } catch (error) {
      console.error(error);
    }
  };

  const hasResults = isSearching || isAsking || Boolean(aiAnswer) || sources.length > 0;

  return (
    <>
      <div className="ambient-background" aria-hidden="true">
        <div className="ambient-light ambient-light-white" />
        <div className="ambient-light ambient-light-cyan" />
      </div>

      <main className="app-shell">
        <section className="hero" aria-labelledby="app-title">
          <p className="eyebrow">Retrieval augmented search</p>
          <h1 id="app-title" className="app-title">
            Ask the index.
          </h1>
          <SearchBar
            query={query}
            setQuery={setQuery}
            onSubmit={handleSearch}
            isLoading={isSearching || isAsking}
          />
        </section>

        {hasResults && (
          <section className="content-area" aria-label="Search results and Chat">
            
            {!chatMode && (
              <>
                <div className="results-grid">
                  <AnswerBox answer={aiAnswer} isLoading={isAsking} />
                  <SourcesList sources={sources} isLoading={isSearching} />
                </div>
                
                {aiAnswer && !isAsking && (
                  <div className="chat-start-wrapper">
                    <button className="chat-start-btn" onClick={startConversation}>
                      Continue conversation from here
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Conversational Memory Interface */}
            {chatMode && (
              <div className="chat-interface">
                <div className="chat-header">
                  <h3>Conversation History</h3>
                  <span className="session-badge">Live Session Active</span>
                </div>
                
                <div className="chat-history">
                  {chatHistory.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.role === 'User' ? 'msg-user' : 'msg-ai'}`}>
                      <span className="msg-role">{msg.role}</span>
                      <div className="msg-content">{msg.content}</div>
                    </div>
                  ))}
                  {isAsking && (
                    <div className="chat-message msg-ai">
                      <span className="msg-role">AI</span>
                      <div className="msg-content typing-indicator">Thinking...</div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleChatSubmit} className="chat-form">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a follow-up question..." 
                    className="chat-input"
                    disabled={isAsking}
                  />
                  <button type="submit" className="chat-send-btn" disabled={isAsking || !chatInput.trim()}>
                    Send
                  </button>
                </form>
              </div>
            )}
            
          </section>
        )}
      </main>
    </>
  );
}

export default App;