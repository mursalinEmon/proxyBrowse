const Queue = require('bull');
require('dotenv').config();

const launchQueue = new Queue('launch-browser', {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

module.exports = {
  launchQueue
};
