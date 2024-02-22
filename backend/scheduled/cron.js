const {populateThisWeeksTimeSlots} = require('../src/api/controllers/timeslotGeneration')

export const runWeeklyPopulation = () => {
	populateThisWeeksTimeSlots()
}