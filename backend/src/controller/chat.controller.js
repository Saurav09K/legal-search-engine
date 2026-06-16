const generateEmbedding = require("../utils/embedder");
const pool = require("../config/db")

const { redisConnection: redis } = require("../config/connection");
const { getAnswerFromGemini } = require("../services/gemini.service")

const chat = async (req, res) => {
    const sessionId = req.body?.sessionId || req.query?.sessionId
    const message = req.body?.message || req.query?.message

    if (!sessionId || !message) {
        return res.status(400).json({
            error: "Please provide both sessionId and message.",
        });
    }

    try {
        const redisKey = `chat:${sessionId}`;
        let history = await redis.get(redisKey);
        history = history ? JSON.parse(history) : [];

        const embedding = await generateEmbedding(message);

        const searchResult = await pool.query(
            `SELECT chunk_text, url, title, 1 - (chunk_embedding <=> $1::vector) AS similarity 
             FROM page_chunks 
             WHERE 1 - (chunk_embedding <=> $1::vector) > 0.6 
             ORDER BY similarity DESC LIMIT 3`,
            [`[${embedding.join(',')}]`]
        );

        const contextText = searchResult.rows.map(row => row.chunk_text).join('\n\n');

        const prompt = `
        You are an expert Legal Assistant for Indian Law.

        PREVIOUS CONVERSATION HISTORY:
        ${history.length > 0 ? history.map(msg => `${msg.role}: ${msg.content}`).join('\n') : "No previous history."}

        NEW LEGAL CONTEXT FOUND IN DATABASE:
        ${contextText || "No new context found."}

        USER'S NEW QUESTION:
        ${message}

        INSTRUCTIONS:
        Answer the user's new question accurately. Use the Previous Conversation History to understand the context, but base your legal facts ONLY on the New Legal Context provided.
        `;

        const aiResponse = await getAnswerFromGemini(prompt);

        history.push({ role: "User", content: message });
        history.push({ role: "AI", content: aiResponse });

        if (history.length > 6) history = history.slice(-6);

        await redis.set(redisKey, JSON.stringify(history), 'EX', 3600);

        res.json({ answer: aiResponse, sources: searchResult.rows, history });
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: "Failed to process chat" });
    }
}

module.exports = {
    chat,
}; 