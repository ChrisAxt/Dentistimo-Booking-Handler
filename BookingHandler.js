require('dotenv').config()
const mongoose = require("mongoose");

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@dentistimo0.vd9sq.mongodb.net/Dentistimo`);

const Booking = mongoose.model('Booking', { 
  name: String,
  userID: String,
  requestID: String,
  date: String,
  startTime: String,
  endTime: String
});

const newBooking = new Booking({ 
  dentistID: '1234',
  userID: '1',
  requestID: '1',
  date: '2021-11-25',
  startTime: '1100',
  endTime: '1130'
});
newBooking.save().then(() => console.log('saved booking'));