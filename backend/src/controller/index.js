const dataController = require("./data.controller");
const equipmentController = require("./equipment.controller");

module.exports = (app) => {
    app.use("/api/sensors", dataController); 
    app.use("/api/equipment", equipmentController);
};