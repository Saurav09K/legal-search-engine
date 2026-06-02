const pool = require('../config/db')

const searchPages = async (req,res)=>{
    try{
        const {q} = req.query;

        if(!q){
            return res.status(400).json({ error: "Please provide context to search" });
        }

        const result = await pool.query(
        `
            SELECT id, url, title,
            ts_rank(
            to_tsvector(raw_content),
            plainto_tsquery($1)
            ) AS rank
            FROM crawled_pages
            WHERE to_tsvector(raw_content)
            @@ plainto_tsquery($1)
            ORDER BY rank DESC
            `,
            [q]
        );
        res.json(result.rows);
    }catch(error){
        console.error("Search Error:", error.message);
        res.status(500).json({ error: "Failed to perform search." });
    }
    
};

module.exports = {searchPages};