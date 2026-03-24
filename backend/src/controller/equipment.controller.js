const express = require('express');
const router = express.Router();
const controlService = require('../service/control.service');

router.patch('/fan', controlService.fan);
router.patch('/pump', controlService.pump);

module.exports = router;