var randomConfigObject = {
    size						: 200,
    clipWidth					: 200,
    clipHeight					: 110,
    ringInset					: 20,
    ringWidth					: 20,

    pointerWidth				: 10,
    pointerTailLength			: 5,
    pointerHeadLengthPercent	: 0.9,

    minValue					: 0,
    maxValue					: 10,

    minAngle					: -90 - 45,
    maxAngle					: 90 + 45,

    transitionMs				: 750,

    majorTicks					: 5,
    labelFormat					: d3.format(',g'),
    labelInset					: 10,

    arcColorFn					: d3.interpolateHsl(d3.rgb('#e8e2ca'), d3.rgb('#3e6c0a'))
};


var gauge = function(container, configuration, config) {
    var that = {};
    var range = undefined;
    var r = undefined;
    var pointerHeadLength = undefined;
    var value = 0;

    var minAngle = 0;
    var maxAngle = 0;

    var counter = 0;

    var svg = undefined;
    var arc = undefined;
    // a linear scale that maps domain values to a percent from 0..1
    var scale = d3.scale.linear()
        .range([0,1])
        .domain([config.minValue, config.maxValue]);
    var ticks = undefined;
    var tickData = undefined;
    var pointer = undefined;
    var minpointer = undefined;
    var maxpointer = undefined;
    var plane = undefined;

    var donut = d3.layout.pie();

    function deg2rad(deg) {
        return deg * Math.PI / 180;
    }

    function newAngle(d) {
        var ratio = scale(d);
        var newAngle = config.minAngle + (ratio * range);
        return newAngle;
    }

    function configure(configuration) {
        var prop = undefined;
        for ( prop in configuration ) {
            config[prop] = configuration[prop];
        }

        range = config.maxAngle - config.minAngle;
        r = config.size / 2;
        pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);



        ticks = scale.ticks(config.majorTicks);
        tickData = d3.range(config.majorTicks).map(function() {return 1/config.majorTicks;});

        arc = d3.svg.arc()
            .innerRadius(r - config.ringWidth - config.ringInset)
            .outerRadius(r - config.ringInset)
            .startAngle(function(d, i) {
                var ratio = d * i;
                return deg2rad(config.minAngle + (ratio * range));
            })
            .endAngle(function(d, i) {
                var ratio = d * (i+1);
                return deg2rad(config.minAngle + (ratio * range));
            });
    }
    that.configure = configure;

    function centerTranslation() {
        return 'translate('+r +','+ r +')';
    }

    function isRendered() {
        return (svg !== undefined);
    }
    that.isRendered = isRendered;

    function render(newValue) {
        svg = d3.select(container)
            .append('svg:svg')
            .attr('class', 'gauge')
            .attr('width', config.clipWidth)
            .attr('height', config.clipHeight);

        var centerTx = centerTranslation();

        var arcs = svg.append('g')
            .attr('class', 'arc')
            .attr('transform', centerTx);

        arcs.selectAll('path')
            .data(tickData)
            .enter().append('path')
            .attr('fill', function(d, i) {
                console.log(JSON.stringify('what is the output'));
                console.log(JSON.stringify(d));
                console.log(JSON.stringify(i));
                console.log(config.arcColorFn(d * i));
                // if(i === 1) {
                //     return '#000000';
                // }
                return config.arcColorFn(d * i);
            })
            .attr('d', arc);

        var lg = svg.append('g')
            .attr('class', 'label')
            .attr('transform', centerTx);
        lg.selectAll('text')
            .data(ticks)
            .enter().append('text')
            .attr('transform', function(d) {
                var ratio = scale(d);
                var newAngle = config.minAngle + (ratio * range);
                return 'rotate(' +newAngle +') translate(0,' +(config.labelInset - r) +')';
            })
            .text(config.labelFormat);


        var planeData = [ [config.pointerWidth / 2, 0],
            [4, -pointerHeadLength],
            [-(config.pointerWidth * 4), 0],
            [0, config.pointerTailLength],
            [config.pointerWidth / 2, 0] ];

        var svgPlaneData = [ [config.pointerWidth / 2, 0],
            [4, -pointerHeadLength],
            [-(config.pointerWidth * 4), 0],
            [0, config.pointerTailLength],
            [config.pointerWidth / 2, 0] ];


        var lineData = [ [config.pointerWidth / 2, 0],
            [0, -pointerHeadLength],
            [-(config.pointerWidth / 2), 0],
            [0, config.pointerTailLength],
            [config.pointerWidth / 2, 0] ];


        var pointerLine = d3.svg.line().interpolate('monotone');

        var pgplane = svg.append('g').data([planeData])
            .attr('class', 'planestyle')
            .attr('transform', centerTx);

        var pgplane = svg.append('g').data([planeData])
            .attr('id', 'plane')
            .attr('transform', 'scale(0.05, 0.05) rotate(-45 100 100)');

        var pg = svg.append('g').data([lineData])
            .attr('class', 'pointer')
            .attr('transform', centerTx);

        var pgmin = svg.append('g').data([lineData])
            .attr('class', 'minpointer')
            .attr('transform', centerTx);

        var pgmax = svg.append('g').data([lineData])
            .attr('class', 'maxpointer')
            .attr('transform', centerTx);

        // Shoot in plane direction in a directive
        plane = pgplane.append('path')
            .attr('d', pointerLine/*function(d) { return pointerLine(d) +'Z';}*/ )
            .attr('transform', 'rotate(' +config.minAngle +')');

        pointer = pg.append('path')
            .attr('d', pointerLine/*function(d) { return pointerLine(d) +'Z';}*/ )
            .attr('transform', 'rotate(' +config.minAngle +')');

        minpointer = pgmin.append('path')
            .attr('d', pointerLine/*function(d) { return pointerLine(d) +'Z';}*/ )
            .attr('transform', 'rotate(' +config.minAngle +')');

        maxpointer = pgmax.append('path')
            .attr('d', pointerLine/*function(d) { return pointerLine(d) +'Z';}*/ )
            .attr('transform', 'rotate(' +config.minAngle +')');

        update(newValue === undefined ? 0 : newValue);
    }
    that.render = render;

    function update(newValue, newConfiguration) {
        console.log('what is the counter?');
        console.log(counter);
        counter++;

        // d3.selectAll('path')
        //     .attr('class', 'gauge')
        //     .attr('fill', function (d, i) {
        //         if (i === 3) return '#000000';
        //     });

        if ( newConfiguration  !== undefined) {
            configure(newConfiguration);
        }
        var ratio = scale(newValue);
        var newAngle = config.minAngle + (ratio * range);
        pointer.transition()
            .duration(config.transitionMs)
            .ease('elastic')
            .attr('transform', 'rotate(' +newAngle +')');

        if(minAngle >= newAngle) {
            minAngle = newAngle;
        }

        if(maxAngle <= newAngle) {
            maxAngle = newAngle;
        }

        if(counter === 5) {
            maxAngle = newAngle + 5;
            minAngle = newAngle - 5;
            // Account for baseline doing something different on first iteration
            counter = 1;
        }

        minpointer.transition()
            .duration(config.transitionMs)
            .ease('elastic')
            .attr('transform', 'rotate(' +minAngle +')');

        maxpointer.transition()
            .duration(config.transitionMs)
            .ease('elastic')
            .attr('transform', 'rotate(' +maxAngle +')');
    }
    that.update = update;

    configure(configuration);

    return that;
};

function onDocumentReady() {
    var config = {
        size						: 200,
        clipWidth					: 200,
        clipHeight					: 110,
        ringInset					: 20,
        ringWidth					: 20,

        pointerWidth				: 10,
        pointerTailLength			: 5,
        pointerHeadLengthPercent	: 0.9,

        minValue					: 0,
        maxValue					: 10,

        minAngle					: -90 - 45,
        maxAngle					: 90 + 45,

        transitionMs				: 750,

        majorTicks					: 5,
        labelFormat					: d3.format(',g'),
        labelInset					: 10,

        arcColorFn					: d3.interpolateHsl(d3.rgb('#e8e2ca'), d3.rgb('#3e6c0a'))
    }

    var powerGauge = gauge('#power-gauge', {
        size: 300,
        clipWidth: 300,
        clipHeight: 300,
        ringWidth: 60,
        maxValue: 10,
        transitionMs: 4000,
    }, config);
    powerGauge.render();

    function updateReadings() {
        // just pump in random data here...
        // document.getElementById('power-gauge').remove();
        console.log('what is powergage?');
        console.log(powerGauge);
        console.log();
        randomConfigObject.minAngle = randomConfigObject.minAngle + 20;

        var randomValue = Math.random() * 10;
        config.minAngle = randomValue * 10;

        var powerGauge2 = gauge('#power-gauge', {
            size: 300,
            clipWidth: 300,
            clipHeight: 300,
            ringWidth: 60,
            maxValue: 10,
            transitionMs: 4000,
        }, config);

        // powerGauge.render();
        // powerGauge.update(randomValue + 1);
        powerGauge.update(randomValue);
    }

    // every few seconds update reading values
    updateReadings();
    setInterval(function() {
        updateReadings();
    }, 5 * 1000);
}

if ( !window.isLoaded ) {
    window.addEventListener("load", function() {
        onDocumentReady();
    }, false);
} else {
    onDocumentReady();
}