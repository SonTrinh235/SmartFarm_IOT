const express = require('express');
const router = express.Router();
const dataService = require('../service/data.service');
const Sensor = require('../model/Sensor');

router.get('/history', async (req, res) => {
    try {
        const history = await dataService.getHistory();
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy dữ liệu lịch sử" });
    }
});

router.get('/latest', async (req, res) => {
    try {
        const latestData = await Sensor.findOne().sort({ timestamp: -1 });
        const isOnline = await dataService.isSystemOnline(); // Gọi hàm kiểm tra từ Service

        if (!latestData) {
            return res.status(404).json({ message: "Chưa có dữ liệu" });
        }
        res.status(200).json({
            ...latestData.toObject(),
            isOnline: isOnline 
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy dữ liệu", error: error.message });
    }
});

router.post('/history', async (req, res) => {
    try {
        const savedData = await dataService.saveSensorData(req.body);
        res.status(201).json({ message: "Lưu thành công", data: savedData });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lưu dữ liệu" });
    }
});

module.exports = router;