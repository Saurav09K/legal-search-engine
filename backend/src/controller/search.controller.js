const pool = require('../config/db')

const searchPages = async (req,res)=>{
    try{
        const {q} = req.query;

        if(!q){
            return res.status(400).json({ error: "Please provide context to search" });
        }

        const result = await pool.query(
        `Select * from crawled_pages
        where raw_content ILIKE $1
        `,
        [`%${q}%`]
        );

        res.json(result.rows);
    }catch(error){
        console.error("Search Error:", error.message);
        res.status(500).json({ error: "Failed to perform search." });
    }
    
};

module.exports = {searchPages};