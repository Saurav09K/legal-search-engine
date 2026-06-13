require("dotenv").config();
const app = require("./src/app");
const pool = require("./src/config/db");
const { redisConnection, crawlQueue } = require("./src/config/connection");

const PORT = process.env.PORT;




app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
