const express = require('express');
const router = express.Router();
const { crawlPdf } = require('../controller/crawlPdf.controller');

router.post('/crawl-pdf', crawlPdf);

module.exports = router;