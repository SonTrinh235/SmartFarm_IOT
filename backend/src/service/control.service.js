const { getMQTTClient } = require('../mqtt'); 

const fan = async (req, res) => {
    const { value } = req.body;
    const client = getMQTTClient();
    const topic = `${process.env.MQTT_USERNAME}/feeds/nut-nhan-quat`;

    client.publish(topic, value.toString(), { qos: 1 }, (err) => {
        if (err) return res.status(500).json({ message: "Lỗi gửi lệnh quạt" });
        res.status(200).json({ message: `Đã gửi lệnh quạt: ${value}` });
    });
};

const pump = async (req, res) => {
    const { value } = req.body;
    const client = getMQTTClient();
    const topic = `${process.env.MQTT_USERNAME}/feeds/nut-nhan-bom`;

    client.publish(topic, value.toString(), { qos: 1 }, (err) => {
        if (err) return res.status(500).json({ message: "Lỗi gửi lệnh bơm" });
        res.status(200).json({ message: `Đã gửi lệnh bơm: ${value}` });
    });
};

module.exports = { fan, pump };