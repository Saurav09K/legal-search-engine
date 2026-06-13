import { useState } from 'react'
import './App.css'
import SearchBar from './components/SearchBar'
import AnswerBox from './components/AnswerBox'
import SourcesList from './components/SourcesList'

const API_BASE_URL = import.meta.env.VITE_API_URL

function App() {
  const [query, setQuery] = useState('')
  const [aiAnswer, setAiAnswer] = useState('')
  const [sources, setSources] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isAsking, setIsAsking] = useState(false)

  const handleSearch = async (event) => {
    event.preventDefault()

    const trimmedQuery = query.trim()

    if (!trimmedQuery || isSearching || isAsking) {
      return
    }

    setAiAnswer('')
    setSources([])
    setIsSearching(true)
    setIsAsking(true)

    const encodedQuery = encodeURIComponent(trimmedQuery)

    try {
      const searchPromise = fetch(`${API_BASE_URL}/api/search?q=${encodedQuery}`)
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`Search failed with status ${response.status}`)
          }

          return response.json()
        })
        .then((data) => {
          setSources(Array.isArray(data) ? data : [])
          return data
        })
        .catch((error) => {
          console.error(error)
          setSources([])
          return []
        })
        .finally(() => {
          setIsSearching(false)
        })

      const askPromise = fetch(`${API_BASE_URL}/api/ask?q=${encodedQuery}`)
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`Ask failed with status ${response.status}`)
          }

          return response.json()
        })
        .then((data) => {
          setAiAnswer(data?.answer || '')
          return data
        })
        .catch((error) => {
          console.error(error)
          setAiAnswer('')
          return { answer: '' }
        })
        .finally(() => {
          setIsAsking(false)
        })

      await Promise.all([searchPromise, askPromise])
    } catch (error) {
      console.error(error)
    } finally {
      // Individual request promises own their loading states.
    }
  }

  const hasResults = isSearching || isAsking || Boolean(aiAnswer) || sources.length > 0

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
          <section className="results-grid" aria-label="Search results">
            <AnswerBox answer={aiAnswer} isLoading={isAsking} />
            <SourcesList sources={sources} isLoading={isSearching} />
          </section>
        )}
      </main>
    </>
  )
}

export default App
