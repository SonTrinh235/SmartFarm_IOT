const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
    temperature: { type: Number, default: 0 },
    airHumidity: { type: Number, default: 0 },
    soilMoisture: { type: Number, default: 0 },
    light: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now }
  });

module.exports = mongoose.model('Sensor', sensorSchema);