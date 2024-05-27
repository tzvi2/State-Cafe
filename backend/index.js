require('dotenv').config()

const express = require("express");
const cors = require("cors")
const menuRoutes = require('./src/api/routes/menuRoutes');
const paymentRoutes = require('./src/api/routes/paymentRoutes')
const orderRoutes = require('./src/api/routes/orderRoutes')
const configRoutes = require('./src/api/routes/configRoutes')
const timeslotRoutes = require('./src/api/routes/timeslotRoutes')
const editMenuRoutes = require('./src/api/routes/editMenuRoutes')
const morgan = require('morgan');
const { handleFileUpload, upload } = require('./src/api/controllers/uploadHandler');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const corsOptions = {
  origin: 'https://statecafeteaneck.com', 
  optionsSuccessStatus: 200
};

const app = express();
app.use(cors(corsOptions))
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
app.use('/api/orders', orderRoutes)
app.use('/config', configRoutes)
app.use('/timeslots', timeslotRoutes)
app.post('/upload', upload.single('image'), handleFileUpload);

app.listen(8000, () => {
  console.log('Server started on port 8000');
});

module.exports = app
