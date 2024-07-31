const express = require('express');
const router = express.Router();

const { get_available_delivery_slots_for_order, handleBookTimeslot, handleGetOpenHours, handleAddTimeslot, handleRemoveTimeslot} = require('../controllers/timeslotsController');

router.get('/available-timeslots/', get_available_delivery_slots_for_order);
router.post('/book-timeslot', handleBookTimeslot);
router.get('/open-hours', handleGetOpenHours);
router.post('/add-time-slot', handleAddTimeslot);
router.post('/remove-time-slot', handleRemoveTimeslot);

module.exports = router;
