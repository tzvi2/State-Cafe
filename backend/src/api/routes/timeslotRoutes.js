const express = require('express')
const router = express.Router()

const {handle_get_available_timeslots, handleBookTimeslot} = require('../controllers/timeslotsController')

router.get('/available-timeslots/', handle_get_available_timeslots)
router.post('/book-timeslot', handleBookTimeslot)

module.exports = router