const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

router.get('/', profileController.listProfiles);
router.post('/', profileController.createProfile);
router.post('/check-proxy', profileController.checkProxy);
router.put('/:id', profileController.updateProfile);
router.delete('/:id', profileController.deleteProfile);

module.exports = router;
