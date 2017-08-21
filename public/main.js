$(document).ready(function () {
    var iosocket = io.connect()
    var currentCreds = ""

    function disableForm() {
        $(".poll-form input").attr("disabled", "disabled")
        $(".poll-form button").attr("disabled", "disabled")
        $(".poll-form label").addClass("is-disabled")
    }

    function enableForm() {
        $(".poll-form input").removeAttr("disabled")
        $(".poll-form button").removeAttr("disabled")
        $(".poll-form label").removeClass("is-disabled")
    }

    // disables form initally 
    disableForm()

    // will emit if running for the first time, notifies server of amount of options
    // server will only listen if results array is empty
    iosocket.emit("setup", JSON.stringify({ "numOfOptions": 3 }))

    // when server emits "message"
    iosocket.on("message", function (data) {
        alert(data)
    })

    iosocket.on("voteDone", function (data) {
        disableForm()
    })

    // when server emits "message"
    iosocket.on("cred", function (data) {
        if (data.valid == "true") {
            enableForm()
        } else {
            disableForm()
            alert("Invalid PIN")
        }
    })

    // when server emits "updateResults", update percentage in results box
    iosocket.on("updateResults", function (data) {
        // getting total
        total = 0
        for (var i in data.currentResult) {
            total += data.currentResult[i]
        }
        // getting percentage of each option
        var listItems = $(".result-text .percentage");
        listItems.each(function (idx, element) {
            var percentage = $(element);
            // converting from number between 0-1 to percentage
            percentage.text((data.currentResult[idx] / total * 100).toFixed(0) + "%")
        });
    })

    // credential submission
    $(".cred-form").submit(function (event) {
        event.preventDefault()
        currentCreds = $(".cred-form input").val()
        iosocket.emit("cred", JSON.stringify({credential: $(".cred-form input").val()}))
    })

    $('#username').keypress(function(event) {
        if (event.keyCode == 13 || event.which == 13) {
            event.preventDefault()
            $(".cred-form").submit()
        }
    });

    // poll form submission
    $(".poll-form").submit(function (event) {
        event.preventDefault()
        // if no options have been selected, return an error
        if ($(".poll-form").serialize() === null || $(".poll-form").serialize() === "") {
            alert("Must select an option before submitting.")
            // otherwise, if everything is correct, send poll data to the backend as a JSON string
        } else {
            pollData = $(".poll-form").serializeObject()
            pollData["credentials"] = currentCreds
            // will be in the form {"option":"2","credentials":"22"}, with options indexing from 1
            iosocket.emit("vote", JSON.stringify(pollData))
        }
    })


})
