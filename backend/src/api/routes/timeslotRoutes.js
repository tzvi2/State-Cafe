const express = require('express');
const router = express.Router();

const { handle_get_available_timeslots, handleBookTimeslot, handleGetOpenHours, handleAddTimeslot, handleRemoveTimeslot} = require('../controllers/timeslotsController');

router.get('/available-timeslots/', handle_get_available_timeslots);
router.post('/book-timeslot', handleBookTimeslot);
router.get('/open-hours', handleGetOpenHours);
router.post('/add-time-slot', handleAddTimeslot);
router.post('/remove-time-slot', handleRemoveTimeslot);

module.exports = router;
