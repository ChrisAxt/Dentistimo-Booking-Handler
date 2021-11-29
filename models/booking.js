const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Booking = new Schema({ 
    name: String,
    userID: String,
    requestID: String,
    date: String,
    startTime: String,
    endTime: String
  });

  module.exports = mongoose.model("booking", Booking);