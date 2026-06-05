const pool = require('../config/db')
const  generateEmbedding  = require('../utils/embedder');

const searchPages = async (req,res)=>{
    try{
        const {q} = req.query;

        if(!q){
            return res.status(400).json({ error: "Please provide context to search" });
        }

        const queryEmbedding = await generateEmbedding(q);
        const vectorString = `[${queryEmbedding.join(",")}]`;

        const result = await pool.query(
        `
            SELECT
                pc.chunk_text,
                cp.title,
                cp.url,

                1 - (pc.chunk_embedding <=> $1::vector)
                AS similarity_score,

                ts_rank(
                to_tsvector('english', pc.chunk_text),
                plainto_tsquery('english', $2)
                ) AS keyword_score

                FROM page_chunks pc

                JOIN crawled_pages cp
                ON cp.id = pc.page_id

                WHERE pc.chunk_embedding IS NOT NULL

                order by similarity_score desc, keyword_score desc

                LIMIT 5;
        `,
        [vectorString,q]
        );
        res.json(result.rows);
    }catch(error){
        console.error("Search Error:", error.message);
        res.status(500).json({ error: "Failed to perform search." });
    }
    
};

module.exports = {searchPages};