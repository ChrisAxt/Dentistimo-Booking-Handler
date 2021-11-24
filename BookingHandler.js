/**
 * Constants that define if the connection via MQTT happens locally or remotely
 * @type {string}
 */
const LOCALHOST = '' //TODO: fill with the local mqtt address
const HOST = 'mqtt://test.mosquitto.org' //mosquitto test server address

const mqtt = require('mqtt');
/**
 * Connects to the address defined in the constants above
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
    client.subscribe('Book', function (err) {
        if (!err) {
            client.on('message', function (topic, message) {
                const newBooking = JSON.parse(message.toString());
                //TODO: post the new booking into the DB
                //TODO: Probably adapt the message sent via MQTT or the topics to adapt if successful or not
                client.publish('BookingStatus', newBooking.toString(), {qos:0} ) //TODO: This has to be changed into the response from the DB eventually
            } )
        }
    })
})