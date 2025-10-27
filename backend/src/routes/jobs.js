const express = require('express');
const router = express.Router();
const JobController = require('../controllers/JobController');

router.get('/', JobController.listJobs);
router.post('/launch', JobController.launchProfile);

module.exports = router;
