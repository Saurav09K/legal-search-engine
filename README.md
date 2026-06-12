# Legal Search Engine

A MERN-style retrieval augmented search application. The backend crawls web pages or PDF documents, stores text chunks and Gemini embeddings in PostgreSQL, and exposes search and AI answer endpoints. The frontend is a Vite React app that lets users ask questions and view matching sources.

## Features

- Crawl web pages and store cleaned page content.
- Queue PDF crawling jobs with BullMQ and Redis.
- Generate embeddings with Gemini.
- Search stored chunks with vector similarity and keyword ranking.
- Generate contextual AI answers from the retrieved documents.
- React UI for asking questions and browsing retrieved sources.

## Tech Stack

- Frontend: React, Vite, CSS
- Backend: Node.js, Express
- Database: PostgreSQL with vector support
- Queue: Redis, BullMQ
- AI: Google Gemini API
- Parsing: pdf-parse for PDFs

## Project Structure

```text
Search_Engine/
  backend/
    server.js
    src/
      app.js
      config/
      controller/
      queue/
      routes/
      services/
      utils/
  frontend/
    index.html
    src/
      App.jsx
      components/
```

## Prerequisites

- Node.js
- PostgreSQL
- Redis
- A Google Gemini API key
- PostgreSQL tables for crawled pages and page chunks, with vector support enabled

## Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
DB_USER=your_postgres_user
DB_HOST=localhost
DB_NAME=your_database_name
DB_PASSWORD=your_postgres_password
DB_PORT=5432
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_gemini_api_key
```

Start the API server:

```bash
npm run dev
```

To process queued PDF crawl jobs, start the worker in a second terminal:

```bash
node src/queue/worker.js
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and expects the backend at `http://localhost:5000`.

## API Endpoints

### Crawl a Web Page

```http
POST /api/crawl
Content-Type: application/json

{
  "url": "https://example.com"
}
```

### Queue a PDF Crawl

```http
POST /api/admin/crawl-pdf
Content-Type: application/json

{
  "url": "https://example.com/file.pdf"
}
```

### Search Stored Documents

```http
GET /api/search?q=your%20question
```

Returns the top matching chunks with source titles, URLs, and similarity scores.

### Ask AI

```http
GET /api/ask?q=your%20question
```

Retrieves relevant chunks and asks Gemini to answer using the stored context.

## Database Notes

The backend expects these logical tables:

- `crawled_pages`: stores source URL, title, and raw content.
- `page_chunks`: stores text chunks, chunk indexes, and vector embeddings.

The search queries use the PostgreSQL vector distance operator `<=>`, so the database must support vector columns.

## Available Scripts

Backend:

```bash
npm run dev
npm start
```

Frontend:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Development Flow

1. Start PostgreSQL and Redis.
2. Start the backend server from `backend/`.
3. Start the PDF worker if you need background PDF ingestion.
4. Start the frontend from `frontend/`.
5. Crawl web pages or PDFs to populate the database.
6. Ask questions from the React UI.

