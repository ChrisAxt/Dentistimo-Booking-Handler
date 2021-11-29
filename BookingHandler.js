require('dotenv').config()
/** Required libraries */
const mqtt = require('mqtt');
const mongoose = require("mongoose");

/** Database Models */
const Booking = require('./models/booking.js')

/** Different MQTT servers */
const LOCALHOST = '' //TODO: fill with the local mqtt address
const HOST = 'mqtt://test.mosquitto.org' //mosquitto test server address

/** Connect to Database */
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@dentistimo0.vd9sq.mongodb.net/Dentistimo`);
//TODO: .env file with credential for this component -> user profile for component
/** Subscribed topics for MQTT */
const subscribeBookingTopic = '/Team5/Dentistimo/Book'

/** Published topics for MQTT */
const publishStatusTopic = '/Team5/Dentistimo/BookingStatus'

//TODO: define options for mqtt connection (client ID, etc)

/**
 * Connects to the servers defined in the constants above
 * @type {MqttClient}
 */
const client = mqtt.connect(HOST) //Change the parameter between HOST or LOCALHOST if you want to connect to the mosquitto test broker or a local broker. For local, mosquitto needs to be installed and running

/** Mocked Data for testing */
const testBooking = {
    dentistID: '1234',
    userID: '1',
    requestID: '1',
    date: '2021-11-25',
    startTime: '11:00',
    endTime: '11:30'
};

/**
 * Subscribes to the topic
 * Posts a new booking with the info received in the message
 * Publish the confirmation via MQTT
 */
client.on('connect', function() {
    console.log("Connected to Mqtt broker successfully" )
    client.subscribe(subscribeBookingTopic, function (err) {
        if (!err) {
           console.log("Subscribed to " + subscribeBookingTopic + " successfully")
           // client.publish(subscribeBookingTopic, JSON.stringify(testBooking), {qos:0}) // uncomment for testing using mocked data
        }else{
            console.log(err.message);
        }
    })
})

client.on('message', function (topic, message) {
    let newBooking = new Booking(JSON.parse(message.toString()));
    newBooking.save(function (err, newBooking) {
        if (err) {
            console.log(err.message)
            client.publish(publishStatusTopic, err.message, {qos:1} )
        }else{
            client.publish(publishStatusTopic, JSON.stringify(newBooking), {qos:1} )
            console.log('Booking saved')
        }
    });
} )