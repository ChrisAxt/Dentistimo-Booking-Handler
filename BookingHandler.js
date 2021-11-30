require('dotenv').config()
/** Required libraries */
const mongoose = require("mongoose");

/** Database Models */
const Booking = require('./Models/booking.js')

/** Subscribed topics for MQTT */
const createBookingTopic = '/Team5/Dentistimo/Booking/Create'
const deleteBookingTopic = '/Team5/Dentistimo/Booking/Delete'

/** Published topics for MQTT */
const createBookingStatusTopic = '/Team5/Dentistimo/BookingStatus/Create'
const deleteBookingStatusTopic = '/Team5/Dentistimo/BookingStatus/delete'

/** Import the Mqtt file which connects to the broker and provide client,as well as publishing and subscribing functions */
const mqtt = require('./Mqtt')

/** Import the database. Connection happens in the Database.js file */
const database = require('./Database')

mqtt.subscribeToTopic(createBookingTopic);
mqtt.subscribeToTopic(deleteBookingTopic);

/**  Listens to message reception and reacts based on the topic */
mqtt.client.on('message', function(topic, message){
    switch (topic) {
        case createBookingTopic:
            createNewBooking(message);
            break;
        case deleteBookingTopic:
            deleteBooking(message);
            break;
        default:
            break;
    }
})

/**
 * Handle a new booking request and publish the result to the status topic via mqtt
 * @param message as a buffer or a string
 */
function createNewBooking(message) {
    let newBooking = new Booking(JSON.parse(message.toString()))
    let bookingResult = saveBookingToDB(newBooking)
    mqtt.publishToTopic(createBookingStatusTopic, JSON.stringify(bookingResult), {qos:1})
}

/**
 * Helper method that saves a new booking to the Database and returns the result
 * -> Either an error message
 * -> Either the new booking JSON object
 * @param newBooking
 */
function saveBookingToDB(newBooking) {
    let result;
    newBooking.save( function(err, newBooking){
        if(err){
            result = err.message
        }else{
            result = newBooking
        }
    })
    return result
}

function deleteBooking(message) {
    let booking = JSON.parse(message.toString())
    let deleteResult = deleteFromDatabase(booking)
    mqtt.publishToTopic(deleteBookingStatusTopic, JSON.stringify(deleteResult), {qos:1})
}

function deleteFromDatabase(booking){
    let bookingId = booking._id;
    let result;
    Booking.findOneAndDelete({'_id': bookingId}, function(err, booking){
        if (err){
            result = err.message
        }else{
            result = booking
        }
    })
    return result;
}