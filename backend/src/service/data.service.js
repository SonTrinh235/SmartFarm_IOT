const Sensor = require('../model/Sensor');

const saveSensorData = async (data) => {
  try {
    const newEntry = new Sensor(data);
    return await newEntry.save();
  } catch (error) {
    console.error("Lỗi Service khi lưu data:", error);
  }
};

const getHistory = async () => {
  return await Sensor.find().sort({ timestamp: -1 }).limit(20);
};

module.exports = { saveSensorData, getHistory };