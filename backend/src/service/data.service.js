const Sensor = require('../model/Sensor');

const getHistory = async () => {
    return await Sensor.find().sort({ timestamp: -1 }).limit(20);
};

const saveSensorData = async (data) => {
    try {
        const newEntry = new Sensor(data);
        return await newEntry.save();
    } catch (error) {
        console.error("Lỗi Service khi lưu data:", error);
    }
};

const isSystemOnline = async () => {
    const latest = await Sensor.findOne().sort({ timestamp: -1 });
    if (!latest) return false;

    const now = new Date();
    const lastUpdate = new Date(latest.timestamp);
    const diffInMinutes = (now - lastUpdate) / (1000 * 60);

    return diffInMinutes < 2;
};

module.exports = { saveSensorData, getHistory, isSystemOnline };