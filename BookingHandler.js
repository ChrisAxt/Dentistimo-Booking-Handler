require('dotenv').config()
/** Required libraries */
const mongoose = require("mongoose");

/** Database Models */
const Booking = require('./Models/booking.js')

/** Subscribed topics for MQTT */

const createBookingTopic = 'Team5/Dentistimo/Booking/Create/Request'
const deleteBookingTopic = 'Team5/Dentistimo/Booking/Delete/Request'
const getUserBookingsTopic = 'Team5/Dentistimo/Booking/User'
const getABookingTopic = 'Team5/Dentistimo/Booking/Get/Request'

const topicsToSubscribeTo = [
    createBookingTopic,
    deleteBookingTopic,
    getUserBookingsTopic,
    getABookingTopic
]
module.exports.listOfTopics = topicsToSubscribeTo
/** Published topics for MQTT */
const topicBookingSucceeded = 'Team5/Dentistimo/Booking/Create/Success'
const topicBookingFailed = 'Team5/Dentistimo/Booking/Create/Fail'

const topicDeleteBookingFailed = 'Team5/Dentistimo/Booking/Delete/Fail'
const topicDeleteBookingSucceeded = 'Team5/Dentistimo/Booking/Delete/Success'

const topicGetABookingSucceeded = 'Team5/Dentistimo/Booking/Get/Success'
const topicGetABookingFailed = 'Team5/Dentistimo/Booking/Get/Failed'

/** Import the Mqtt file which connects to the broker and provide client,as well as publishing and subscribing functions */
const mqtt = require('./Mqtt')
exports.mqtt = mqtt

/** Import the database. Connection happens in the Database.js file */
const database = require('./Database')

mqtt.subscribeToAll(topicsToSubscribeTo)

/**  Listens to message reception and reacts based on the topic */
mqtt.client.on('message', function(topic, message){
    switch (topic) {
        case createBookingTopic:
            console.log(message)
            createNewBooking(message);
            break;
        case deleteBookingTopic:
            deleteBooking(message);
            break;
        case getUserBookingsTopic:
            findUserBookings(message);
            break;
        case getABookingTopic:
            getABooking(message)
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
    try {
        let newBooking = new Booking(JSON.parse(message.toString()));
        saveBookingToDB(newBooking);
    } catch (error) {
        mqtt.publishToTopic(topicBookingFailed, JSON.stringify({'error' : err.message}), {qos:1})
        console.log(error);
    }
    
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
    try {
        let booking = JSON.parse(message.toString())
        deleteFromDatabase(booking)
    } catch (error) {
        mqtt.publishToTopic(topicDeleteBookingFailed, JSON.stringify({'error' : err.message}), {qos:1})
        console.log(error);
    }
    
}

/**
 * delete the given booking (_id based) from the database and publishes the result of the operation.
 * @param booking as an json object with the _id key value pair of the booking to be deleted.
 */
function deleteFromDatabase(booking){
    let bookingId = booking._id;
    Booking.findOneAndDelete({'_id': bookingId}, function(err, booking){
        if (err){
            mqtt.publishToTopic(topicDeleteBookingFailed, JSON.stringify({'error' : err.message}), {qos:1})
        }else{
            mqtt.publishToTopic(topicDeleteBookingSucceeded, JSON.stringify(booking), {qos:1})
        }
    })
}
/**
 * handles the get request for all booking for a given user.
 * @param message as Stringified json object sent via mqtt. -> needs the _id of the booking in the json object.
 */
function findUserBookings(message){
    try {
        let user = JSON.parse(message.toString())
        let userSSN = user.userSSN;
        findUserBookingsInDB(userSSN)
    } catch (error) {
        mqtt.publishToTopic(topicGetABookingFailed, JSON.stringify({'error' : err.message}), {qos:1})
        console.log(error);
    }
}

/**
 * helper method that retrieves the bookings that are attached to a given SSN and publishes the result of the operation.
 * @param UserID as an json object with the _id key value pair of the booking to be deleted.
 */
function findUserBookingsInDB(userSSN){
    Booking.find({ userSSN : userSSN }).populate('dentist').exec( function(err, bookings) {
        if (err) {
            mqtt.publishToTopic(`Team5/Dentistimo/Booking/${userSSN}`, JSON.stringify({'error': err.message}), {qos:1})
        } else {
            if(bookings !== null){
                mqtt.publishToTopic(`Team5/Dentistimo/Booking/${userSSN}/Success`, JSON.stringify({bookings}), {qos:1})
            }else{
                mqtt.publishToTopic(`Team5/Dentistimo/Booking/${userSSN}/Failure`, JSON.stringify({'error': 'There is no booking for this SSN in our database'}), {qos:1})
            }
        }
    })
}


/**
 * handles the get request for a given booking.
 * @param message as Stringified json object sent via mqtt. -> needs the _id of the booking in the json object.
 */
function getABooking(message){
    try {
        let booking = JSON.parse(message.toString())
        getABookingFromDatabase(booking);
    } catch (error) {
        mqtt.publishToTopic(topicGetABookingFailed, JSON.stringify({'error' : err.message}), {qos:1})
        console.log(error);
    }
    
}

/**
 * helper method that retrieves the given booking (_id based) from the database and publishes the result of the operation.
 * @param booking as an json object with the _id key value pair of the booking to be deleted.
 */
function getABookingFromDatabase(booking) {
    let bookingID = booking._id;
    Booking.findById(bookingID).populate('clinic').exec( function(err, booking) {
        if (err){
            mqtt.publishToTopic(topicGetABookingFailed, JSON.stringify({'error':err.message}), {qos:1})
        }else{
            if(booking !== null){
                mqtt.publishToTopic(topicGetABookingSucceeded, JSON.stringify(booking), {qos:1})
            }else{
                mqtt.publishToTopic(topicGetABookingFailed, JSON.stringify({'error':'The booking has not been found'}), {qos:1})
            }
        }
    })
}