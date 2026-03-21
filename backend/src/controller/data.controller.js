const dataService = require('../service/data.service');

const getSensorHistory = async (req, res) => {
  try {
    const history = await dataService.getHistory();
    res.json(history.reverse());
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy dữ liệu lịch sử" });
  }
};

module.exports = { getSensorHistory };