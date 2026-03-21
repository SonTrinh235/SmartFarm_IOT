const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const apiRoutes = require('./routes');
const connectMQTT = require('./mqtt');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('🍃 MongoDB Connected'))
  .catch(err => console.log(err));

app.use('/api', apiRoutes);

connectMQTT();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server ready at port ${PORT}`));