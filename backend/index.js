require('dotenv').config();

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const express = require("express");
const cors = require("cors")
const menuRoutes = require('./src/api/routes/menuRoutes');
const paymentRoutes = require('./src/api/routes/paymentRoutes')
const webhookRoutes = require('./src/api/routes/webhookRoutes')
const orderRoutes = require('./src/api/routes/orderRoutes')
const configRoutes = require('./src/api/routes/configRoutes')
const timeslotRoutes = require('./src/api/routes/timeslotRoutes')
const editMenuRoutes = require('./src/api/routes/editMenuRoutes')
const morgan = require('morgan');
const cron = require('node-cron');
const {db, admin} = require('./firebase/firebaseAdminConfig')
const startWebSocketServer = require('./src/websocketServer');
const { handleFileUpload, upload } = require('./src/api/controllers/uploadHandler');
const {populateTwoDays, populateThisWeeksTimeSlots} = require('./src/api/controllers/timeslotGeneration')
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cors())
app.use(express.json())
app.use(morgan('dev'));

app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
}));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.use('/edit-menu/', editMenuRoutes)
app.use('/menu-data', menuRoutes);
app.use('/api/payment', paymentRoutes)
//app.use('/webhook', webhookRoutes)
app.use('/api/orders', orderRoutes)
app.use('/config', configRoutes)
app.use('/timeslots', timeslotRoutes)

app.get('/populate-timeslots', populateTwoDays);

app.post('/upload', upload.single('image'), handleFileUpload);

app.listen(8000, () => {
  console.log('Server started on port 8000');
});

//startWebSocketServer();

module.exports = app
