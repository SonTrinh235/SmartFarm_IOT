const express = require('express');
const homeService = require('../service/home.service');
const router = express.Router();

router.get('/', homeService.api_home);

module.exports = router;