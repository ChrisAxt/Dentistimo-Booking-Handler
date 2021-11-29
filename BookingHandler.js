require('dotenv').config()
const mongoose = require("mongoose");

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@dentistimo0.vd9sq.mongodb.net/Dentistimo`);

const Booking = require('./models/booking.js')

const newBooking = new Booking({ 
  dentistID: '1234',
  userID: '1',
  requestID: '1',
  date: '2021-11-25',
  startTime: '11:00',
  endTime: '11:30'
});

newBooking.save().then(() => console.log('saved booking'));