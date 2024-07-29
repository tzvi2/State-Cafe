require('dotenv').config();
const express = require("express");
const cors = require("cors");
const menuRoutes = require('./src/api/routes/menuRoutes');
const paymentRoutes = require('./src/api/routes/paymentRoutes');
const orderRoutes = require('./src/api/routes/orderRoutes');
const configRoutes = require('./src/api/routes/configRoutes');
const timeslotRoutes = require('./src/api/routes/timeslotRoutes');
const editMenuRoutes = require('./src/api/routes/editMenuRoutes');
const stockRoutes = require('./src/api/routes/stockRoutes');
const emails = require('./src/api/routes/emailRoutes')
const morgan = require('morgan');
const { handleFileUpload, upload } = require('./src/api/controllers/uploadHandler');
const helmet = require('helmet');
const path = require('path');

const app = express();

console.log('Node Environment:', process.env.NODE_ENV);

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());
app.use(helmet());

app.set('trust proxy', 1);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, 
//   max: 100, 
// });

// app.use(limiter);

app.get('/favicon.ico', (req, res) => res.sendFile(path.join(__dirname, 'public', 'favicon.png')));

app.use('/edit-menu/', editMenuRoutes);
app.use('/menu-data', menuRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/config', configRoutes);
app.use('/timeslots', timeslotRoutes);
app.use('/stock', stockRoutes);
app.post('/upload', upload.single('image'), handleFileUpload);
app.use('/api/check-email', emails)

app.listen(8000, () => {
  console.log('Server started on port 8000');
});

module.exports = app;
