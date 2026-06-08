const { Queue } = require('bullmq');
const Redis = require('ioredis');
require('dotenv').config();

const redisConnection = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
});

const crawlQueue = new Queue('crawl-queue', { 
    connection: redisConnection 
});

module.exports = { redisConnection, crawlQueue };