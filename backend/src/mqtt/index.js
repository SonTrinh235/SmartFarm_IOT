// backend/src/mqtt/index.js
const mqtt = require('mqtt');
const Sensor = require('../model/Sensor'); 

const connectMQTT = () => {
    const username = process.env.MQTT_USERNAME;
    const client = mqtt.connect(`mqtt://io.adafruit.com`, {
        port: 1883,
        username: username,
        password: process.env.MQTT_KEY,
    });

    client.on('connect', () => {
        console.log('Current: 4 sensor feeds');
        client.subscribe(`${username}/feeds/+`); 
    });

    client.on('message', async (topic, message) => {
        const value = Number(message.toString());
        const feedName = topic.split('/').pop();
        
        let updateField = {};

        switch (feedName) {
            case 'nhiet-do':
                updateField.temperature = value;
                break;
            case 'do-am-khong-khi':
                updateField.airHumidity = value;
                break;
            case 'do-am-dat':
                updateField.soilMoisture = value;
                break;
            case 'anh-sang':
                updateField.light = value;
                break;
            default:
                return; 
        }

        if (Object.keys(updateField).length > 0) {
            try {
                /* CHỈNH THỜI GIAN Ở ĐÂY:
                   --> 5 * 60 * 1000 = 300000ms (5p)
                */
                const TIME_WINDOW = 5 * 60 * 1000; 
                const recentLimit = new Date(Date.now() - TIME_WINDOW);

                await Sensor.findOneAndUpdate(
                    { timestamp: { $gte: recentLimit } }, 
                    { $set: updateField },
                    { 
                        sort: { timestamp: -1 }, 
                        upsert: true, 
                        new: true 
                    }
                );

                console.log(`💾 [MQTT] Đã gộp dữ liệu ${feedName}: ${value}`);
            } catch (err) {
                console.error("❌ Lỗi khi cập nhật dữ liệu vào MongoDB:", err);
            }
        }
    });
};

module.exports = connectMQTT;