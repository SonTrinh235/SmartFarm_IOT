const api_home = (req, res) => {
    res.status(200).json({
        message: "🍀 Chào mừng bạn đến với SmartFarm API",
        version: "1.0.0",
        status: "Running",
        endpoints: {
            history: "/api/sensors/history",
            control: "/api/equipment/control"
        }
    });
};

module.exports = { api_home };