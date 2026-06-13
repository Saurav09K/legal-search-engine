const express = require("express");
const cors = require("cors");

const app = express();

const crawlRoutes = require("./routes/crawl.routes");
const searchRoutes = require("./routes/search.routes");
const askRoutes = require("./routes/ask.routes");
const crawlPdfRoutes = require("./routes/crawlPdf.routes");

app.use(cors({
    origin: "legal-search-engine-x4wft40e5-saurav09ks-projects.vercel.app",
}));

app.use(express.json());

app.use("/api/crawl", crawlRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/ask", askRoutes);
app.use("/api/admin", crawlPdfRoutes);

module.exports = app;
