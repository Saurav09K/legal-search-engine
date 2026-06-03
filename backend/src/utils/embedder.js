const { GoogleGenAI } = require("@google/genai");
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generateEmbedding = async (text) => {
    try {
        const response = await ai.models.embedContent({
            model: "gemini-embedding-001", 
            contents: text
        });

        return response.embeddings[0].values;
    } catch (error) {
        console.error("Error generating embedding:", error.message);
        throw error;
    }
};

module.exports =  generateEmbedding ;