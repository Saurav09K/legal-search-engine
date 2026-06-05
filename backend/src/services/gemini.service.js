const pool = require("../config/db");
const  generateEmbedding  = require("../utils/embedder");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const getAnswerFromGemini = async (question) => {

    const queryEmbedding = await generateEmbedding(question);
    const embeddingString = `[${queryEmbedding.join(",")}]`;

    const searchQuery = `
        SELECT 
            pc.chunk_text,
            cp.title,
            cp.url,
            1 - (pc.chunk_embedding <=> $1::vector) AS similarity_score,
            ts_rank(
                 to_tsvector('english', pc.chunk_text),
                 plainto_tsquery('english', $2)
            ) AS keyword_score
        FROM page_chunks pc
        JOIN crawled_pages cp ON cp.id = pc.page_id
        WHERE pc.chunk_embedding IS NOT NULL
        ORDER BY similarity_score DESC, keyword_score DESC
        LIMIT 5;
    `;

    const dbResult = await pool.query(searchQuery, [embeddingString, question]);
    const chunks = dbResult.rows;

    if (chunks.length === 0) {
        return {
            answer: "I don't have any documents related to this topic.",
            sources: [],
        };
    }


    const contextText = chunks.map((row, index) =>
                `[Document ${index + 1}]: ${row.chunk_text}`
        )
        .join("\n\n");

    const prompt = `
        You are a highly intelligent, technical search engine assistant.
        Your job is to answer the user's question using ONLY the provided context below.
        If the answer is not explicitly contained in the context, do not guess or hallucinate.
        Simply say "I don't have enough information in my database to answer that."

        CONTEXT DOCUMENTS:
        ${contextText}

        USER QUESTION:
        ${question}
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    return {
        answer: response.text,
        sources: [...new Set(chunks.map((chunk) => chunk.url))],
    };
};

module.exports = {
    getAnswerFromGemini,
};