var opts = {
    angle: -50, // The span of the gauge arc
    lineWidth: 30, // The line thickness
    radiusScale: 1, // Relative radius
    pointer: {
        length: 0.6, // // Relative to gauge radius
        strokeWidth: 0.035, // The thickness
        color: '#000000' // Fill color
    },
    staticZones: [
        {strokeStyle: "#F03E3E", min: 100, max: 130}, // Red from 100 to 130
        {strokeStyle: "#FFDD00", min: 130, max: 150}, // Yellow
        {strokeStyle: "#30B32D", min: 150, max: 220}, // Green
        {strokeStyle: "#FFDD00", min: 220, max: 260}, // Yellow
        {strokeStyle: "#F03E3E", min: 260, max: 300}  // Red
    ],
    limitMax: false,     // If false, max value increases automatically if value > maxValue
    limitMin: false,     // If true, the min value of the gauge will be fixed
    colorStart: '#6FADCF',   // Colors
    colorStop: '#8FC0DA',    // just experiment with them
    strokeColor: '#E0E0E0',  // to see which ones work best for you
    generateGradient: true,
    highDpiSupport: true    // High resolution support

};


function drawGauge(opts) {
    var target = document.getElementById('foo'); // your canvas element
    var gauge = new Gauge(target).setOptions(opts); // create sexy gauge!
    gauge.maxValue = 3000; // set max gauge value
    gauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
    gauge.animationSpeed = 29; // set animation speed (32 is default value)
    gauge.set(1525); // set actual value
}


drawGauge(opts);
// drawGauge(opts);