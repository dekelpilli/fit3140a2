module.exports = function (five, ref) {
    // initialises arduino board 
    var board = new five.Board()

    var VCA = 0
    var CCA = 0

    // listeners for each table that log values when the listener is first initialised, 
    // and when values are changed
    ref.child('/motionSensorData').on("value", function (snapshot) {   
        // updates local values so db values can be incremented accurately
        VCA = snapshot.val().votersCurrentlyAvailable
        CCA = snapshot.val().clientsCurrentlyAvailable
        console.log("VCA: " + snapshot.val().votersCurrentlyAvailable) 
        console.log("CCA: " + snapshot.val().clientsCurrentlyAvailable)          
    }, function (errorObject) {             
        console.log("The read failed: " + errorObject.code)
    })

    // arduino code
    board.on("ready", function () {
        // interfaces for led and motion detector
        var led = new five.Led(13)
        var motion = new five.Motion(6)
        // used to measure time
        var startTime = null
        var endTime = null

        // turn LED on and measure starting time
        motion.on("motionstart", function () {
            led.on()
            startTime = new Date()
        })

        // calculate time motion was detected using end time of motion
        motion.on("motionend", function () {
            led.off()
            endTime = new Date()
            if (startTime != null) {
                var secondsDiff = (endTime - startTime) / 1000

                var motionType = ""
                if (secondsDiff >= 5) {
                    // increments VCA when voter enters the station
                    ref.child('/motionSensorData').update({
                        votersCurrentlyAvailable: VCA + 1
                    });
                    motionType = "Long"
                } else {
                    // decrements VCA when voter leaves the station
                    ref.child('/motionSensorData').update({
                        votersCurrentlyAvailable: VCA - 1
                    });
                    motionType = "Short"
                }
                console.log(motionType + " motion detected (" + secondsDiff + " seconds)")
            }
        })
    })
}