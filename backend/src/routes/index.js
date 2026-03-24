const express = require('express');
const router = express.Router();
const homeController = require('../controller/home.controller');
const dataController = require('../controller/data.controller');
const equipmentController = require('../controller/equipment.controller');

router.use('/', homeController);

router.get('/sensors/history', dataController.getSensorHistory);

router.use('/equipment', equipmentController);
module.exports = router;