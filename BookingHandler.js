require('dotenv').config()
/** Required libraries */
const mqtt = require('mqtt');
const mongoose = require("mongoose");

/** Mocked Data for testing */
const testBooking = {
    dentistID: '1234',
    userID: '1',
    requestID: '1',
    date: '2021-11-25',
    startTime: '11:00',
    endTime: '11:30'
};

/** Database Models */
const Booking = require('./models/booking.js')

/** Different MQTT servers */
const LOCALHOST = '' //TODO: fill with the local mqtt address
const HOST = 'mqtt://test.mosquitto.org' //mosquitto test server address

/** Subscribed topics for MQTT */
const createBookingTopic = '/Team5/Dentistimo/Booking/Create'
const deleteBookingTopic = '/Team5/Dentistimo/Booking/Delete'

/** Published topics for MQTT */
const statusTopic = '/Team5/Dentistimo/BookingStatus'

//TODO: define options for mqtt connection (client ID, etc)

/** Connect to Database */
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@dentistimo0.vd9sq.mongodb.net/Dentistimo`);

/**
 * Connects to the servers defined in the constants above
 * @type {MqttClient}
 */
const client = mqtt.connect(HOST) //Change the parameter between HOST or LOCALHOST if you want to connect to the mosquitto test broker or a local broker. For local, mosquitto needs to be installed and running

/**
 * Subscribes to the needed topic(s)
 * Manage tests for each topic.
 */
client.on('connect', function() {
    console.log("Connected to Mqtt broker successfully" )
    subscribeToTopic(createBookingTopic, false, testBooking);
})

/**
 * Helper method that subscribe to a certain topic and react to the subscription.
 * Publish also to the subscribed topic for testing purposes if test boolean is true.
 * @param topic of type String
 * @param testIsActive of type boolean
 * @param mockedData of type JSON object
 */
function subscribeToTopic(topic, testIsActive, mockedData){
    client.subscribe(topic, function (err) {
        if (!err) {
            console.log("Subscribed to " + topic + " successfully")
            if(testIsActive){
                testTopic(topic, mockedData);
            }
        }else{
            console.log(err.message);
        }
    })
}

/**
 * Helper method for testing a topic.
 * Publish to a given topic a mocked json object.
 * @param isActive
 * @param mockedData
 */
function testTopic(topic, mockedData) {
    client.publish(topic, JSON.stringify(mockedData), {qos:0})
}

/**
 * Listen to topic(s) and call the right method based on the topic.
 */
client.on('message', function (topic, message) {

    switch (topic){
        case createBookingTopic:
            saveBooking(message);
            break;
        case deleteBookingTopic:
            //TODO: Insert the delete function here when coded
            break;
        default:
            break;
    }
})

/**
 * Helper method that save a new booking into the database
 * @param mqttMessage of type Buffer
 */
function saveBooking(mqttMessage){
    let newBooking = new Booking(JSON.parse(mqttMessage.toString()));
    newBooking.save(function (err, newBooking) {
        if (err) {
            console.log(err.message)
            client.publish(statusTopic, err.message, {qos:1} )
        }else{
            client.publish(statusTopic, JSON.stringify(newBooking), {qos:1} )
            console.log('Booking saved')
        }
    });
}