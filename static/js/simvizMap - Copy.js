queue()
    .defer(d3.json, "static/geojson/pyshp-central-stations.geojson")
    .defer(d3.json, "static/geojson/pyshp-central-lines_noGarage.geojson")
    .defer(d3.csv, "static/csv/trains_states.csv")
    
    .await(makeGraphs);

'use strict';

function makeGraphs(error, stationsJson, linesJson, trains_states) {


	// stations = stationsJson;

	// var dateFormat = d3.time.format("%y-%b-%d");
	// var timeFormat = d3.time.format("%H:%M");

	central_lines = linesJson
	central_stations = stationsJson;
	// console.log(central_stations)
	// console.log(central_lines)

	// console.log(trains_states)


	train_data = trains_states.map(function(d) {
		return {
			time : +d.t,
			car_id: d.car_id,
			x : +d.position.slice(2,-2).split(",")[0],
			y : +d.position.slice(2,-2).split(",")[1],
			position : d.position.slice(2,-2),
			load : +d.load,
			// http://stackoverflow.com/questions/13272406/javascript-string-to-array-conversion
			load_hist : JSON.parse("[" + d.load_history_array +"]")
		};
	});

 	// add proper time
	train_data.forEach(function(d) {
		var today = new Date(2015, 12, 25);
		var hrs = 6;
		d.Date = new Date(today.getTime() + hrs*60*60*1000 + d.time*1000)
	});

	nested_train_data = d3.nest()
		.key(function(w){
			return w.time
		})
		.map(train_data)


	// Timer 
	var timer_holder = d3.select("#timer")
		.append("svg")
		.attr("width", 400)
		.attr("height", 200)

	timer_holder
		.append("text")
		.style("fill", "white")
		.style("font-size", "56px")
		.attr("transform", "translate(150,100) rotate(0)")
		.text("0")

	
	//Cre



	// Map 

	var height = 800;
	var width = 1800;
	var projection = d3.geo.mercator()

	var path = d3.geo.path().projection(projection);
	
	var geoID = function(d) {
            return "c" + d.properties.name;
		};



	// var hover_stations = function(d) {
	// 	console.log('d', d, 'event', event);
	// 	var div = document.getElementById('tooltip');
	// 	div.style.left = event.pageX +'px';
	// 	div.style.top = event.pageY + 'px';
	// 	div.innerHTML =  d.properties.name ;
	// }

	// var hover_train = function(d) {
	// 	console.log('d', d, 'event', event);
	// 	var div = document.getElementById('tooltip');
	// 	// div.style.left = event.pageX +'px';
	// 	// div.style.top = event.pageY + 'px';
	// 	tip ='Train load: ' +  "<br />" + String(d.load);//d.load;
	// 	div.innerHTML = tip; 
	// }


	var tr_selected;
	var tr_click = function (d){  
		// console.log(d);
		// console.log(this)     
	   if(!tr_selected){
	   	// console.log(tr_selected)  
		// tr_selected = this;
		tr_selected.attr('fill-opacity', 0.2); 
		d3.select(tr_selected).attr('fill-opacity', 1);

	  } 
	  else if(tr_selected == this){
	     
	     tr_selected.attr('fill-opacity', 1); 
	     tr_selected = undefined;
	  }
	}


    
    var click_train = function(d) {
		// console.log('d', d, 'event', event);
		// d3.select(this).attr("class", "selected");

		
		train_id = d.car_id;
		// console.log("train id:" + String(train_id));
		var div = document.getElementById('train_tooltip');
		div.className = "tooltip"
		div.style.visibility = 'visible';
		// div.style.left = event.pageX +'px';
		// div.style.top = event.pageY + 'px';
		div.innerHTML = '<p><strong>Train ID: </strong></p>'  +String(d.car_id) + '<p><strong>Train load: </strong></p>' +  String(d.load) + "<br />" +"<br />"	;


        // console.log(d.load_hist);
        var margin = {top: 20, right: 5, bottom: 30, left: 80},
	        height = 150 - margin.top - margin.bottom,
            width = 300 - margin.left - margin.right ;

        // console.log(width + margin.left + margin.right)
        // conso.log(d.load_hist[0].length);
		var x = d3.scale.linear().domain([0, d.load_hist[0].length]).range([0,width]) //.range([0, width + margin.left + margin.right]);
		// console.log(x(0));
		// Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
		var y = d3.scale.linear().domain([0, d3.max(d.load_hist[0])]).range([height, 0]);
		// console.log(y(0));
		// console.log(d.load_hist[0]);

		var line = d3.svg.line()
		// http://bl.ocks.org/benjchristensen/2579599
			// assign the X function to plot our line as we wish
			.x(function(d,i) { 
				// console.log(d);
				// verbose logging to show what's actually being done
				// console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
				// return the X coordinate where we want to plot this datapoint
				return x(i); 
			})
			.y(function(d) { 
				// verbose logging to show what's actually being done
				// console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) + " using our yScale.");
				// return the Y coordinate where we want to plot this datapoint
				return y(d); 
		})

		// var chart_width = width - margin.left - margin.right
		// var chart_height = height - margin.top - margin.bottom

		var chart = d3.select('#train_tooltip')
			.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("fill", "rgba(255,0,0,0.1)") //#d6d6d6	
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            


        // create yAxis
			var xAxis = d3.svg.axis().scale(x).tickSubdivide(true);  // .tickSize(- height - margin.top - margin.bottom )
			// Add the x-axis.
			// console.log(height)
			chart.append("g")
			      .attr("class", "x axis")
			      .attr("transform", "translate(0," + (height )  + ")") //-  margin.bottom
			      .attr("stroke", "white")
			      .call(xAxis);


			// // create left yAxis
			var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");
			// // Add the y-axis to the left
			chart.append("g")
			      .attr("class", "y axis")
			      // .attr('transform', 'translate(' + (margin.left + margin.right) + ')')
			      .attr("stroke", "white")
			      .call(yAxisLeft);
			
		// console.log("load_hist");
		console.log(d.load_hist)
        chart.append("path")
	        .attr("d", line(d.load_hist[0]))
	        // .attr('transform', 'translate(' + (margin.left + margin.right)  + ')')
	        // .attr("transform", "translate(0," + (height -  margin.bottom)  + ")")
	        .attr({
			  "fill" : "none",
			  "stroke" : " #f47723 ",
			  "stroke-width" : "5px"
			})
	}



	var svg = d3.select("#map")
	  .append("svg")
	  .attr("width", width)
	  .attr("height", height)


	var b, s, t;
	projection.scale(1).translate([0, 0]);
	var b = path.bounds(central_stations);
	// console.log(b)
	var s = .9 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
	var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
	projection.scale(s).translate(t);




	var stations_holder = svg.append('g');
	stations = stations_holder
				.selectAll('path')
				.data(central_stations.features);



	// http://stackoverflow.com/questions/23580385/d3-select-unselect-node-onclick
	var selected;
	var click = function (d){    
	
	   if(!selected){
	   	
		selected = this;
		stations.attr('fill-opacity', 0.2); 
		d3.select(selected).attr('fill-opacity', 1);
	  } 
	  else if(selected == this){
	     stations.attr('fill-opacity', 1); 
	     selected = undefined;
	  }
	}



	

	stations.enter()
		.append('path')
		.attr('d', path)
		.attr('id', geoID)
		.attr('class', 'station')
		.on("click", click)

	stations.exit().remove();



	var lines_holder = svg.append('g');
	var lines = lines_holder
		.selectAll('path')
		.data(central_lines.features);

	lines.enter()
	 .append('path')
	 .attr('d', path)
	 .attr('class', 'line')
	 // .on("mouseover", hover_lines);

	lines.exit().remove();



	var currentTime = 0;
	interval = 100;
	var maxTime = d3.max(train_data, function(d){ return d.time;});


	var trainsHolder = svg.append('g')


	var zoom = d3.behavior.zoom()
		.scaleExtent([0.9, 10])
	    .on("zoom",function() {
	        lines_holder.attr("transform","translate("+ 
	            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
	        lines_holder.selectAll("path")  
	            .attr("d", path.projection(projection)); 

			stations_holder.attr("transform","translate("+ 
	            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
	        stations_holder.selectAll("path")  
	            .attr("d", path.projection(projection));

	        trainsHolder.attr("transform","translate("+ 
	            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
	        trainsHolder.selectAll("path")  
	            .attr("d", path.projection(projection));

	});
	 
	svg.call(zoom);




	function setAttributes(d){
		d3.select(this).attr({
			  cx: function(d){ return projection([d.x, d.y])[0]}, 
			  cy: function(d){ return projection([d.x, d.y])[1]},
			  r : 3
			})
			.attr("d", path)
			.attr("class", "train")
	}






    function render(t){
		trains = trainsHolder
				.selectAll('circle')
				.data(nested_train_data[t], function(d){ return d.car_id})

		// enter
		trains
			.enter()
			.append("circle")
			.each(setAttributes)
			// .on("mouseover", hover_train);
			.on("click", click_train);
			// .on("click", function(d){
			// 	console.log(this);
			//     click_train(d);
			//     tr_click(d);
			// })

		// update
		trains
			.transition()
			.duration(interval)
			.each(setAttributes)
		
		// exit
		trains.exit().remove();

		// update timer
		timer_holder
			.select("text")
			.transition()
			.duration(interval)
			// .text("Time : " + String(t/60))
			.text(String(nested_train_data[t][0].Date.getHours()) + ":"  + String( nested_train_data[t][0].Date.getMinutes()))

		};

	var paused = false; 
    render(currentTime);


    var callback = function () {
        return function () {
            currentTime = currentTime + 60; 
            console.log(paused);
            if (currentTime <= maxTime && !paused) {
                render(currentTime);
                d3.timer(callback(paused), interval);
            }
            return true;
        }
    }

	

    d3.timer(callback(), interval);


	$("#pauseBtn").click(function() {
		paused = true ;
		// console.log("Paused");
		console.log(currentTime);
	});

	$("#resumeBtn").click(function() {
		paused = false ;
		console.log("Resume");
		console.log(currentTime);
		// console.log("interval is :"); console.log(interval);
		d3.timer(callback(), interval);

	});


	$("#startBtn").click(function() {
		paused = false ;
		console.log("Started");
		currentTime = 0;
		// console.log("interval is :"); console.log(interval);
		render(currentTime)
		d3.timer(callback(), interval);

	});

	$("#fasterBtn").click(function(){
		interval = interval / 5;
		console.log(interval);
	})

	$("#slowerBtn").click(function(){
		interval = interval * 5;
		console.log(interval);
	})





	 
};
	
