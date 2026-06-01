const express = require("express");

const app = express();

const crawlRoutes = require("./routes/crawl.routes");
const searchRoutes = require("./routes/search.routes");


app.use(express.json());

app.use("/api/crawl", crawlRoutes);
app.use("/api/search", searchRoutes);

module.exports = app;