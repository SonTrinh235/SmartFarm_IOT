const dataController = require("./data.controller");
const equipmentController = require("./equipment.controller");
const assistantController = require("./assistant.controller");

module.exports = (app) => {
    app.use("/api/sensors", dataController); 
    app.use("/api/equipment", equipmentController);
    app.use("/api/assistant", assistantController);
};