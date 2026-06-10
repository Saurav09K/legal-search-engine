const { crawlQueue } = require('../config/connection');

const crawlPdf = async (req, res) => {
   const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "Please provide a PDF URL." });
    }

    try {
        const job = await crawlQueue.add('pdf-job', { pdfUrl: url });

        res.json({
            message: "PDF successfully added to the background queue!",
            jobId: job.id,
            status: "Processing"
        });
    } catch (error) {
        console.error("Queue Error:", error);
        res.status(500).json({ error: "Failed to add job to queue" });
    }
}

module.exports = {
    crawlPdf
};