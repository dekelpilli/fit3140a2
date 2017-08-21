module.exports = function (app, ref) {
    var VCA = 0
    var CCA = 0

    ref.on("value", function (snapshot) {
        VCA = snapshot.val().votersCurrentlyAvailable
        CCA = snapshot.val().clientsCurrentlyAvailable
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code)
    })

    // serves voting/index page
    app.route("/")
        .get(function (req, res) {
            // If there are more voters than clients, increment the amount of clients, and serve the voting page
            if (VCA > CCA) {
                ref.update({
                    clientsCurrentlyAvailable: CCA + 1
                });
                res.sendFile(process.cwd() + "/index.html")
            // otherwise, deny access
            } else {
                res.sendFile(process.cwd() + "/public/accessdenied.html")
            }
        })

    // serves error page
    app.route("*")
        .get(function (req, res) {
            res.sendFile(process.cwd() + "/public/error.html")
        })
}
