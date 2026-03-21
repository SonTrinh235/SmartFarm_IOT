const mqtt = require('mqtt');
const dataService = require('../service/data.service');

const connectMQTT = () => {
  const client = mqtt.connect(`mqtt://io.adafruit.com`, {
    port: 1883,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_KEY,
  });

  client.on('connect', () => {
    client.subscribe(`${process.env.MQTT_USERNAME}/feeds/+`);
    console.log('✅ MQTT đã sẵn sàng lưu dữ liệu');
  });

  client.on('message', async (topic, message) => {
    const value = Number(message.toString());
    
    let update = {};
    if (topic.includes('nhiet-do')) update.temperature = value;
    if (topic.includes('do-am-khì')) update.airHumidity = value;
    if (topic.includes('do-am-dat')) update.soilMoisture = value;
    if (topic.includes('anh-sang')) update.light = value;

    if (Object.keys(update).length > 0) {
      await dataService.saveSensorData(update);
      console.log('💾 Đã lưu dữ liệu từ feed:', topic);
    }
  });
};

module.exports = connectMQTT;