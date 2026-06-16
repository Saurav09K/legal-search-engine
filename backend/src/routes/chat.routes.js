const express = require('express');
const router = express.Router();

const { chat } = require("../controller/chat.controller");

router.post("/", chat);
router.get("/", chat);

module.exports = router;