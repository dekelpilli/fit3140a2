$(document).ready(function () {
    var iosocket = io.connect()

    // setting up chart
    // styling
    Chart.defaults.global.defaultFontFamily = "Roboto"
    Chart.defaults.global.defaultFontSize = 16
    Chart.defaults.global.defaultFontColor = "#212121"
    var ctx = document.getElementById("myChart").getContext('2d')
    ctx.canvas.height = 450
    ctx.canvas.width = 650
    // defining a bar chart with 3 values
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["Red", "Green", "Blue"],
            datasets: [{
                label: '# of Votes',
                data: [0, 0, 0],
                backgroundColor: [
                    "#F44336",
                    "#4CAF50",
                    "#2196F3"
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        // ensuring chart begins at zero and minimum value is 0
                        beginAtZero: true,
                        min: 0,
                        // ensures a minimum step size of 1
                        callback: function (value, index, values) {
                            if (Math.floor(value) === value) {
                                return value
                            }
                        }
                    }
                }]
            }
        }
    })

    // gets current results from server
    iosocket.emit("getResults")

    // when server emits "updateResults"
    iosocket.on("updateResults", function (data) {
        // update graph
        myChart.data.datasets[0].data = data.currentResult
        myChart.update()
    })

    // when server emits "message"
    iosocket.on("message", function (data) {
        console.log(data)
    })

})