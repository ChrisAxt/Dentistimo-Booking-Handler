/** Required libraries */
const mqtt = require('mqtt');

/** Different MQTT servers */
const LOCALHOST = '' //TODO: fill with the local mqtt address
const HOST = 'mqtt://test.mosquitto.org' //mosquitto test server address

/** Subscribed topics for MQTT */
const subscribeBookingTopic = '/Team5/Dentistimo/Book'

/** Published topics for MQTT */
const publishStatusTopic = '/Team5/Dentistimo/BookingStatus'

/**
 * Connects to the servers defined in the constants above
 * @type {MqttClient}
 */
const client = mqtt.connect(HOST) //Change the parameter between HOST or LOCALHOST if you want to connect to the mosquitto test broker or a local broker. For local, mosquitto needs to be installed and running


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
        }else{
            console.log(err.message);
        }
    })
})

client.on('message', function (topic, message) {
    const newBooking = JSON.parse(message.toString());
    //TODO: post the new booking into the DB
    //TODO: Probably adapt the message sent via MQTT or the topics to adapt if successful or not
    client.publish(publishStatusTopic, newBooking.stringify, {qos:0} ) //TODO: This has to be changed into the response from the DB eventually, QOS needs to be defined
} )