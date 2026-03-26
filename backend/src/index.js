require('dotenv').config();
const express = require('express');
const cors = require('cors');


const connectDB = require('./config'); 
const setupRoutes = require('./controller'); 
const connectMQTT = require('./mqtt');

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get('/', (req, res) => {
  res.send('🚀 Smart Farm API is running');
});

setupRoutes(app); 

connectMQTT();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server ready at port ${PORT}`);
});