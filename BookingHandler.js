require('dotenv').config()
/** Required libraries */
const mongoose = require("mongoose");

/** Database Models */
const Booking = require('./Models/booking.js')

/** Subscribed topics for MQTT */
const createBookingTopic = '/Team5/Dentistimo/Booking/Create'
const deleteBookingTopic = '/Team5/Dentistimo/Booking/Delete'
const getBookingsTopic = 'Team5/Dentistimo/Booking/Get'
const getUserBookingsTopic = 'Team5/Dentistimo/Booking/user'

/** Published topics for MQTT */
const createBookingStatusTopic = '/Team5/Dentistimo/BookingStatus/Create'
const deleteBookingStatusTopic = '/Team5/Dentistimo/BookingStatus/delete'

/** Import the Mqtt file which connects to the broker and provide client,as well as publishing and subscribing functions */
const mqtt = require('./Mqtt')

/** Import the database. Connection happens in the Database.js file */
const database = require('./Database')

mqtt.subscribeToTopic(createBookingTopic);
mqtt.subscribeToTopic(deleteBookingTopic);
mqtt.subscribeToTopic(getBookingsTopic);
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
        case getBookingsTopic:
            getAllBookings();
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

/**
 * handles the delete request for a given booking.
 * @param message as Stringified json object sent via mqtt. -> needs the _id of the booking in the json object.
 */
function deleteBooking(message) {
    let booking = JSON.parse(message.toString())
    let deleteResult = deleteFromDatabase(booking)
    mqtt.publishToTopic(deleteBookingStatusTopic, JSON.stringify(deleteResult), {qos:1})
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
            result = err.message
        }else{
            result = booking
        }
    })
    return result;
}

function getAllBookings(){
    // TODO: implement
}


function findUserBookings(message){
    // TODO:implement
    let info = JSON.parse(message.toString());
    let user = info._userID;
    Booking.find({ 'userID' : userID})
}