const express = require("express");
const cors = require("cors");

const app = express();

const crawlRoutes = require("./routes/crawl.routes");
const searchRoutes = require("./routes/search.routes");
const askRoutes = require("./routes/ask.routes");
const crawlPdfRoutes = require("./routes/crawlPdf.routes");
const chatRoutes = require("./routes/chat.routes");

app.use(cors({
    origin: "http://localhost:5173",
}));

app.use(express.json());

app.use("/api/crawl", crawlRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/ask", askRoutes);
app.use("/api/admin", crawlPdfRoutes);
app.use("/api/chat", chatRoutes);

module.exports = app;

// "https://legal-search-engine-x4wft40e5-saurav09ks-projects.vercel.app",