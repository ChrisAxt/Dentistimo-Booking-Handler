require('dotenv').config()
/** Required libraries */
const mongoose = require("mongoose");

/** Database Models */
const Booking = require('./Models/booking.js')

/** Subscribed topics for MQTT */
const createBookingTopic = 'Team5/Dentistimo/Booking/Create/Request'
const deleteBookingTopic = 'Team5/Dentistimo/Booking/Delete/Request'
const getUserBookingsTopic = 'Team5/Dentistimo/Booking/User'

/** Published topics for MQTT */
const topicBookingSucceeded = 'Team5/Dentistimo/Booking/Create/Success'
const topicBookingFailed = 'Team5/Dentistimo/Booking/Create/Fail'

const topicDeleteBookingFailed = 'Team5/Dentistimo/Booking/Delete/Fail'
const topicDeleteBookingSucceeded = 'Team5/Dentistimo/Booking/Delete/Success'
/** Import the Mqtt file which connects to the broker and provide client,as well as publishing and subscribing functions */
const mqtt = require('./Mqtt')

/** Import the database. Connection happens in the Database.js file */
const database = require('./Database')

mqtt.subscribeToTopic(createBookingTopic);
mqtt.subscribeToTopic(deleteBookingTopic);
mqtt.subscribeToTopic(getUserBookingsTopic);
 
/**  Listens to message reception and reacts based on the topic */
mqtt.client.on('message', function(topic, message){
    switch (topic) {
        case createBookingTopic:
            createNewBooking(message);
            break;
        case deleteBookingTopic:
            deleteBooking(message);
            break;
        case getUserBookingsTopic:
            findUserBookings(message);
            break;
        default:
            break;
    }
})

/**
 * Handle a new booking request and publish the result to the status topic via mqtt
 * @param message as Stringified json object sent via mqtt. -> format of the object should follow the booking.js model
 */
function createNewBooking(message) {
    let newBooking = new Booking(JSON.parse(message.toString()))
    saveBookingToDB(newBooking)
}

/**
 * Helper method that saves a new booking to the Database and publish the result via MQTT to the relevant topics
 * -> Either an error message
 * -> Either the new booking JSON object
 * @param newBooking
 */
function saveBookingToDB(newBooking) {
    newBooking.save( function(err, newBooking){
        if(err){
            mqtt.publishToTopic(topicBookingFailed, JSON.stringify({'error' : err.message}), {qos:1})
            console.log(err.message)
        }else{
            mqtt.publishToTopic(topicBookingSucceeded, JSON.stringify(newBooking), {qos:1})
        }
    })
}

/**
 * handles the delete request for a given booking.
 * @param message as Stringified json object sent via mqtt. -> needs the _id of the booking in the json object.
 */
function deleteBooking(message) {
    let booking = JSON.parse(message.toString())
    deleteFromDatabase(booking)
}

/**
 * delete the given booking (_id based) from the database and return the result of the operation.
 * @param booking as an json object with the _id key value pair of the booking to be deleted.
 * @returns result of the operation
 */
function deleteFromDatabase(booking){
    let bookingId = booking._id;
    let result;
    Booking.findOneAndDelete({'_id': bookingId}, function(err, booking){
        if (err){
            mqtt.publishToTopic(topicDeleteBookingFailed, JSON.stringify({'error' : err.message}), {qos:1})
        }else{
            mqtt.publishToTopic(topicDeleteBookingSucceeded, JSON.stringify(booking), {qos:1})
        }
    })
    return result;
}

function findUserBookings(message){
    // TODO:implement
    let user = JSON.parse(message.toString())
    let userID = user.userID;
    let bookingsResult = findUserBookingsinDB(userID)
    mqtt.publishToTopic(`Team5/Dentistimo/Booking/${userID}`, JSON.stringify(bookingsResult), {qos:1})
}

function findUserBookingsinDB(userID){
    let result;
    Booking.find({ userID : userID}, function(err, bookings) {
        if (err) {
            result = err.message;     
        } else {
            result = bookings;
        }
        return bookings;
    })
}