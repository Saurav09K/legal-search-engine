const axios = require("axios");
const cheerio = require("cheerio");
const pool = require("../config/db");

const crawlPage = async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "Please provide a URL to crawl." });
    }

    try {

        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        const $ = cheerio.load(data);
        $('script, style, nav, header, footer, noscript').remove();
        
        const title = $('title').text().trim();
        const raw_content = $('body').text().replace(/\s+/g, ' ').trim();

        const insertQuery = `
            INSERT INTO crawled_pages (url, title, raw_content)
            VALUES ($1, $2, $3)
            RETURNING id, title;
        `;
        
        const dbResult = await pool.query(insertQuery, [url, title, raw_content]);
        const pageId = dbResult.rows[0].id;
        
        const chunks = [];
        $("p, h1, h2, h3, li").each((index, element) => {
            const text = $(element).text().replace(/\s+/g, ' ').trim();
            
            if (text.split(' ').length > 5) {
                chunks.push(text);
            }
        });

        for (let i = 0; i < chunks.length; i++) {

            await pool.query(
            `
            INSERT INTO page_chunks
            (page_id, chunk_index, chunk_text)
            VALUES($1,$2,$3)
            `,
            [pageId, i, chunks[i]]
            );

        }
        

        

        res.status(201).json({
            message: "Page successfully crawled and saved!",
            data: dbResult.rows[0],
            pageId: pageId,
        });

    } catch (error) {
        console.error("Crawling Error:", error.message);
        
        if (error.code === '23505') {
            return res.status(409).json({ error: "This URL has already been crawled and saved." });
        }

        res.status(500).json({ error: "Failed to crawl the website." });
    }
};

module.exports = {
  crawlPage
};