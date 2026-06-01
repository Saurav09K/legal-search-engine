const express = require("express");
const router = express.Router();

const { searchPages } = require("../controller/search.controller");

router.get("/", searchPages);

module.exports = router;