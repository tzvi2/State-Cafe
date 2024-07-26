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
const cronController = require('./src/api/controllers/cron')
const emails = require('./src/api/routes/emailRoutes')
const morgan = require('morgan');
const { handleFileUpload, upload } = require('./src/api/controllers/uploadHandler');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const allowedOrigins = [
  'https://statecafeteaneck.com', 
  'https://www.statecafeteaneck.com',
  'http://localhost:3000', // Add this for local development, remove it in production
  'http://localhost:3001', // Add this for local development, remove it in production
  'http://192.168.1.152:3000',
  '192.168.1.152:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  optionsSuccessStatus: 200,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE, OPTIONS",
  preflightContinue: false,
  allowedHeader: ['Content-Type']
};

const app = express();

//console.log('Stripe Secret Key:', process.env.STRIPE_SECRET_KEY);
console.log('Node Environment:', process.env.NODE_ENV);

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '192.168.1.152:3000')
  res.setHeader('Access-Control-Allow-Origin', 'http://192.168.1.152:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});



// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve favicon from the public directory
app.get('/favicon.ico', (req, res) => res.sendFile(path.join(__dirname, 'public', 'favicon.png')));

// Set the trust proxy setting
app.set('trust proxy', 1);

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
});

app.use(limiter);

app.options('*', cors(corsOptions)); 

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.use('/edit-menu/', editMenuRoutes);
app.use('/menu-data', menuRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/config', configRoutes);
app.use('/timeslots', timeslotRoutes);
app.use('/stock', stockRoutes);
app.post('/upload', upload.single('image'), handleFileUpload);
app.get('/api/cron', cronController);
app.use('/api/check-email', emails)

app.listen(8000, () => {
  console.log('Server started on port 8000');
});

module.exports = app;
