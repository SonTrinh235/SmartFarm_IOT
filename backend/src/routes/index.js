const express = require('express');
const router = express.Router();
const dataController = require('../controller/data.controller');

router.get('/sensors/history', dataController.getSensorHistory);

module.exports = router;