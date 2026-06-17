const generateEmbedding = require("../utils/embedder");
const pool = require("../config/db")

const { redisConnection: redis } = require("../config/connection");
const { getAnswerFromGemini } = require("../services/gemini.service")
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

exports.chat = async (req, res) => {
    const { sessionId, message } = req.body;

    try {
        const redisKey = `chat:${sessionId}`;
        let history = await redis.get(redisKey);
        history = history ? JSON.parse(history) : [];

        let searchQuery = message; 

        if (history.length > 0) {
            const rewritePrompt = `
            Given the following conversation history and the user's follow-up question, rewrite the follow-up question into a clear, standalone search query that can be understood by a database without needing the history.
            If the follow-up question is already clear on its own, just output the exact same question.
            DO NOT answer the question, ONLY output the rewritten search query.

            Chat History:
            ${history.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

            User Follow-up: ${message}
            
            Standalone Search Query:`;

            const rewriteResult = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: rewritePrompt
            });
            
            searchQuery = rewriteResult.text.trim();
            console.log(`Original: "${message}" | Rewritten: "${searchQuery}"`); 
        }
       

        const embedResult = await ai.models.embedContent({
            model: "gemini-embedding-001",
            contents: searchQuery
        });
        
        const embedding = embedResult.embeddings[0].values;
        
        const searchResult = await pool.query(
            `SELECT 
                pc.chunk_text, 
                cp.url, 
                cp.title, 
                1 - (pc.chunk_embedding <=> $1::vector) AS similarity 
             FROM page_chunks pc
             JOIN crawled_pages cp ON pc.page_id = cp.id
             WHERE 1 - (pc.chunk_embedding <=> $1::vector) > 0.6 
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

        const aiResult = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });
        
        const aiResponse = aiResult.text;

        history.push({ role: "User", content: message });
        history.push({ role: "AI", content: aiResponse });
        
        if (history.length > 6) history = history.slice(-6);
        await redis.set(redisKey, JSON.stringify(history), 'EX', 3600);

        res.json({ answer: aiResponse, sources: searchResult.rows });

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: "Failed to process chat" });
    }
};