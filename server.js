var admin = require("firebase-admin"),
    five = require("johnny-five"),
    arduino = require("./app/arduino.js"),
    express = require("express"),
    app = express(),
    server = require("http").Server(app),
    io = require("socket.io")(server),
    routes = require("./app/index.js"),
    sockets = require("./app/sockets.js")

// Fetch the service account key JSON file contents for firebase
var serviceAccount = require("./serviceAccountKey.json")

// Initialize the firebase app with a service account, granting admin privileges
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://fit3140-assignment2-27209.firebaseio.com"
})

// Connect to firebase database as admin, and create references for each table
var db = admin.database()
var ref = db.ref("/motionSensorData") 


// serves static pages
app.use("/public", express.static(__dirname + '/public')); 

// routes connections
routes(app, ref)
// handles sockets
sockets(io, server, ref)
// handles arduino-related behaviour
arduino(five, ref)

server.listen(8080, function() {
    console.log('Listening on port 8080')
})
