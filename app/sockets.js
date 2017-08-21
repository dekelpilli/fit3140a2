module.exports = function (io, server, ref) {
    results = [] // index represents option, value repesents number of votes
    var credentials = [1234, 4321]

    function checkCredentials(cred) {
        if (credentials.indexOf(parseInt(cred)) > -1) {
            return true
        } else {
            return false
        }
    }

    // specifies behaviour when something connects to the socket
    io.on("connection", function (socket) {

        // when client emits "vote"
        socket.on("vote", function (msg) {
            // logging and converting from string to JSON object
            console.log("Vote Received: ", msg)
            vote = JSON.parse(msg)
            // correct credentials
            if (checkCredentials(vote.credentials)) {
                // decrement CCA
                ref.once("value", function (snapshot) {
                    CCA = parseInt(snapshot.val().clientsCurrentlyAvailable) || 0
                    ref.update({
                        clientsCurrentlyAvailable: CCA - 1
                    });

                    // updating voting totals (form data indexes from one, so it's subtracting one)
                    results[vote.option - 1]++
                    io.sockets.emit("updateResults", {
                        currentResult: results
                    })

                    // disable form once vote is cast
                    socket.emit("voteDone")
                }, function (errorObject) {
                    console.log("The read failed: " + errorObject.code)
                })
                // incorrect credentials 
            } else {
                socket.emit("message", "Incorrect credentials.")
            }
        })

        // validating credentials
        socket.on("cred", function (msg) {
            msg = JSON.parse(msg)
            if (checkCredentials(msg.credential)) {
                socket.emit("cred", {
                    valid: "true"
                })
            } else {
                socket.emit("cred", {
                    valid: "false"
                })
            }
        })

        // when messaged, print to the console, and send message to every client
        socket.on("message", function (msg) {
            console.log("Message Received: ", msg)
            io.sockets.emit("message", msg)
        })

        // when client want to get results, emit them to the client
        socket.on("getResults", function () {
            socket.emit("updateResults", {
                currentResult: results
            })
        })

        // setting up results array for first time - if already setup, update client with results
        socket.on("setup", function (msg) {
            msg = JSON.parse(msg)
            if (results.length == 0) {
                for (var i = 0; i < parseInt(msg.numOfOptions); i++) {
                    results.push(0)
                }
                console.log("Results array initialised with length ", msg)
            } else {
                socket.emit("updateResults", {
                    currentResult: results
                })
            }
        })
    })
}