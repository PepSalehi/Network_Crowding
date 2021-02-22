queue()
    .defer(d3.json, "static/geojson/victoria_stations_noG.geojson")
    .defer(d3.json, "static/geojson/victoria_line_lines_sn.json")
    .defer(d3.csv, "static/csv/trains_states_victoria.csv")
    .defer(d3.csv, "static/csv/stations_states_victoria.csv")
    .defer(d3.json, "static/csv/victoria_station_lookup_by_nlc_noC.txt")

    .defer(d3.json, "static/geojson/pyshp-central-stations.geojson")
    .defer(d3.json, "static/geojson/pyshp-central-lines_noGarage.geojson")
    .defer(d3.csv, "static/csv/trains_states.csv")
    .defer(d3.csv, "static/csv/stations_states.csv")
    .defer(d3.json, "static/csv/central_station_lookup_by_nlc_noC.txt")
    .await(makeGraphs);

'use strict';

function makeGraphs(error, stationsJson, linesJson, trains_states, stations_states, victoria_station_lookup_by_nlc,  centralStations, centralLineJson, central_trains_states, central_stations_state, central_station_lookup_by_nlc) {

    /// Victoria
	victoria_station_lookup = victoria_station_lookup_by_nlc
	victoria_lines = linesJson
	victoria_stations = stationsJson;

	victoria_train_data = trains_states.map(function(d) {
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
	victoria_train_data.forEach(function(d) {
		var today = new Date(2015, 12, 25);
		var hrs = 6;
		d.Date = new Date(today.getTime() + hrs*60*60*1000 + d.time*1000)
	});

	victoria_nested_train_data = d3.nest()
		.key(function(w){
			return w.time
		})
		.map(victoria_train_data)


	victoria_station_data = stations_states.map(function	(d){
		return {
			time : +d.t,
			station_id : d.station_id,
			platform : d.platform,
			queue : +d.queue,
			queue_hist : JSON.parse("[" + d.hist_queue_array +"]")
		}
	});
	// add proper time
	victoria_station_data.forEach(function(d) {
		var today = new Date(2015, 12, 25);
		var hrs = 6;
		d.Date = new Date(today.getTime() + hrs*60*60*1000 + d.time*1000)
	});
	victoria_nested_station_data = d3.nest()
		.key(function(w){
			return w.time
		})
		.map(victoria_station_data)

	victoria_nested_station_data_by_timeAndStationid = d3.nest()
		.key(function(w){
			return w.time
		})
		.key(function(w){
			return w.station_id
		})
		.map(victoria_station_data)

	victoria_stations.features.forEach(function(d,i){

				shp_name = d.properties.name // d is a path
				console.log(shp_name)
				// console.log(victoria_nested_station_data[1].filter(function(d){ return shp_name == victoria_station_lookup[d.station_id]}))
				var df = victoria_station_data.filter(function(d){ return shp_name == victoria_station_lookup[d.station_id]})
				// console.log(df)
				// console.log(df[0])
				d.properties.DATA = df
				// console.log(df[0].station_id)
				d.properties.station_id= df[0].station_id;			
			})


	/// Central
	central_station_lookup = central_station_lookup_by_nlc
	central_lines = centralLineJson
	central_stations = centralStations;

	// console.log(centralStations)

	central_train_data = central_trains_states.map(function(d) {
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


	central_train_data.forEach(function(d) {
		var today = new Date(2015, 12, 25);
		var hrs = 6;
		d.Date = new Date(today.getTime() + hrs*60*60*1000 + d.time*1000)
	});

	central_nested_train_data = d3.nest()
		.key(function(w){
			return w.time
		})
		.map(central_train_data)


	central_station_data = central_stations_state.map(function	(d){
		return {
			time : +d.t,
			station_id : d.station_id,
			platform : d.platform,
			queue : +d.queue,
			queue_hist : JSON.parse("[" + d.hist_queue_array +"]")
		}
	});

	central_station_data.forEach(function(d) {
		var today = new Date(2015, 12, 25);
		var hrs = 6;
		d.Date = new Date(today.getTime() + hrs*60*60*1000 + d.time*1000)
	});
	central_nested_station_data = d3.nest()
		.key(function(w){
			return w.time
		})
		.map(central_station_data)

	central_nested_station_data_by_timeAndStationid = d3.nest()
		.key(function(w){
			return w.time
		})
		.key(function(w){
			return w.station_id
		})
		.map(central_station_data)

	central_stations.features.forEach(function(d,i){

				shp_name = d.properties.name // d is a path
				console.log(shp_name)
				// console.log(victoria_nested_station_data[1].filter(function(d){ return shp_name == victoria_station_lookup[d.station_id]}))
				var df = central_station_data.filter(function(d){ return shp_name == central_station_lookup[d.station_id]})
				console.log(df)
				// console.log(df[0])
				d.properties.DATA = df
				// console.log(df[0].station_id)
				d.properties.station_id= df[0].station_id;			
			})
 
 	/// end of central


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



	// Map 

	var height = 800;
	var width = 1300;
	var projection = d3.geo.mercator()
	var path = d3.geo.path().projection(projection);
	var geoID = function(d) {
            return "c" + d.properties.name;
		};



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
        var margin = {top: 20, right: 25, bottom: 30, left: 80},
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
			var xAxis = d3.svg.axis().scale(x).tickSubdivide(true).tickFormat(d3.format("d"));;  // .tickSize(- height - margin.top - margin.bottom )
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
	var b = path.bounds(victoria_stations);  // this needs to change
	// console.log(b)
	// console.log(path.bounds(central_stations)[1])
	b[0] = path.bounds(central_stations)[0]

	var s = .9 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
	var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
	projection.scale(s).translate(t);




	var victoria_stations_holder = svg.append('g');
	victoria_stations = victoria_stations_holder
				.selectAll('path')
				.data(victoria_stations.features);



	var central_stations_holder = svg.append('g');
	central_stations = central_stations_holder
				.selectAll('path')
				.data(central_stations.features);


	victoria_stations.enter()
		.append('path')
		.attr('d', path)
		.attr('id', geoID)
		.attr('class', 'station')

	central_stations.enter()
		.append('path')
		.attr('d', path)
		.attr('id', geoID)
		.attr('class', 'station')
		// .on("click", click)



	var victoria_lines_holder = svg.append('g');
	var victoria_lines = victoria_lines_holder
		.selectAll('path')
		.data(victoria_lines.features);

	victoria_lines.enter()
	 .append('path')
	 .attr('d', path)
	 .attr('class', 'line')
	 // .on("mouseover", hover_lines);



	var central_lines_holder = svg.append('g');
	var central_lines = central_lines_holder
		.selectAll('path')
		.data(central_lines.features);

	central_lines.enter()
	 .append('path')
	 .attr('d', path)
	 .attr('class', 'line')


	var currentTime = 0;
	interval = 100;
	var maxTime = d3.max(victoria_train_data, function(d){ return d.time;});


	var victoria_trainsHolder = svg.append('g')

	var central_trainsHolder = svg.append('g')


	var zoom = d3.behavior.zoom()
		.scaleExtent([0.5, 10])
	    .on("zoom",function() {
	        victoria_lines_holder.attr("transform","translate("+ 
	            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
	        victoria_lines_holder.selectAll("path")  
	            .attr("d", path.projection(projection)); 

			victoria_stations_holder.attr("transform","translate("+ 
	            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
	        victoria_stations_holder.selectAll("path")  
	            .attr("d", path.projection(projection));

	        victoria_trainsHolder.attr("transform","translate("+ 
	            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
	        victoria_trainsHolder.selectAll("path")  
	            .attr("d", path.projection(projection));


	        central_lines_holder.attr("transform","translate("+ 
	            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
	        central_lines_holder.selectAll("path")  
	            .attr("d", path.projection(projection)); 

			central_stations_holder.attr("transform","translate("+ 
	            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
	        central_stations_holder.selectAll("path")  
	            .attr("d", path.projection(projection));

	        central_trainsHolder.attr("transform","translate("+ 
	            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
	        central_trainsHolder.selectAll("path")  
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
			.style("fill", function(d) {
					    return (d.load < 892) ? "orange" : "rgb(107, 66, 244)"
					})
				};



	// http://stackoverflow.com/questions/23580385/d3-select-unselect-node-onclick
	var selected;
	var click = function (d){    
	
	   if(!selected){
	   	
		selected = this;
		victoria_stations.attr('fill-opacity', 0.2); 
		d3.select(selected).attr('fill-opacity', 1);
	  } 
	  else if(selected == this){
	     victoria_stations.attr('fill-opacity', 1); 
	     selected = undefined;
	  }

	  // console.log(d)
	  // console.log(d3.select(this))
	}



    function render(t){
		victoria_trains = victoria_trainsHolder
				.selectAll('circle')
				.data(victoria_nested_train_data[t], function(d){ return d.car_id})

		central_trains = central_trainsHolder
				.selectAll('circle')
				.data(central_nested_train_data[t], function(d){ return d.car_id})




		// enter
		victoria_trains
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
		victoria_trains
			.transition()
			.duration(interval)
			.each(setAttributes)
		
		// exit
		victoria_trains.exit().remove();
		victoria_stations 
			.each(function(d,i){
				shp_name = d.properties.name // d is a path
				// console.log(victoria_nested_station_data[t].filter(function(d){ return shp_name == victoria_station_lookup[d.station_id]}))
				var df = victoria_nested_station_data_by_timeAndStationid[t][d.properties.station_id] // .filter(function(d){ return shp_name == victoria_station_lookup[d.station_id]})
		
				d3.select(this)

					.attr("time", t)
					.attr("station_id", function(d) {
						if (!jQuery.isEmptyObject(df) ){
							return df[0].station_id
						}
					})

					.style("fill", function(d) {
						if (!jQuery.isEmptyObject(df) ){
							// return (df[0].queue < 50) ? "green" : "red";
							return ( Math.max(df[0].queue, df[1].queue) < 50 ) ? "green" : "red";
					}
				})
			})
			.on("click", function(d){
				// console.log(d)
				shp_name = d.properties.name // d is a path
				var df = victoria_nested_station_data_by_timeAndStationid[t][d.properties.station_id] //.filter(function(d){ return shp_name == victoria_station_lookup[d.station_id]})

				console.log("clicked")
				// console.log(df)

				// var idx = -1;
				// var temp = ['station_tooltip1', 'station_tooltip2']
				// for (j in temp){
				// 	var divName = temp[j]
					// idx += 1
					// console.log(divName)
					// var div = document.getElementById("parent_tooltip").getElementsByClassName(divName)[0];
					var div = document.getElementById("station_tooltip")
					div.className = "stationTooltip"
					div.style.visibility = 'visible';
					// div.style.left = event.pageX +'px';
					// div.style.top = event.pageY + 'px';
					div.innerHTML = '<p><strong>Station : </strong></p>'  +String(shp_name) + 
						'<p><strong>Passengers on platform ' + String(df[0].platform) + ': </strong></p>' +  String(df[0].queue) + "<br />"  ;
						
						// '<p><strong>Passengers on platform ' + String(df[1].platform) + ': </strong></p>' +  String(df[1].queue) + "<br />" +"<br />"	;
			        // console.log(d.load_hist);
			        var margin = {top: 20, right: 25, bottom: 30, left: 80},
				        height = 150 - margin.top - margin.bottom,
			            width = 300 - margin.left - margin.right ;
			        // console.log(width + margin.left + margin.right)
			        // console.log(df[0].queue_hist);
			        // console.log( d3.max(df[0].queue_hist[0]))
					var x = d3.scale.linear().domain([0, df[0].queue_hist[0].length]).range([0,width]) //.range([0, width + margin.left + margin.right]);
					var y = d3.scale.linear().domain([0, d3.max(df[0].queue_hist[0])]).range([height, 0]);		
					var line = d3.svg.line()
					// http://bl.ocks.org/benjchristensen/2579599
						// assign the X function to plot our line as we wish
						.x(function(d,i) { 
					
							return x(i); 
						})
						.y(function(d) { 
					
							return y(d); 
					})

					// var divNameHash = "#" + divName
					// console.log(divNameHash)
					var chart = d3.select("#station_tooltip")
						.append("svg")
			            .attr("width", width + margin.left + margin.right)
			            .attr("height", height + margin.top + margin.bottom)
			            .style("fill", "rgba(255,0,0,0.1)") //#d6d6d6	
						.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
			            
			        // create yAxis
						var xAxis = d3.svg.axis().scale(x).tickSubdivide(false).tickFormat(d3.format("d"));;  // .tickSize(- height - margin.top - margin.bottom )
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
					// console.log(d.load_hist)
			        chart.append("path")
				        .attr("d", line(df[0].queue_hist[0]))
				        // .attr('transform', 'translate(' + (margin.left + margin.right)  + ')')
				        // .attr("transform", "translate(0," + (height -  margin.bottom)  + ")")
				        .attr({
						  "fill" : "none",
						  "stroke" : " #f47723 ",
						  "stroke-width" : "5px"
						})



				//////////////////////////////////
				///////////////////////////////////
				//////////////////////////////////
				var div = document.getElementById("station_tooltip2")
					div.className = "stationTooltip2"
					div.style.visibility = 'visible';
					// div.style.left = event.pageX +'px';
					// div.style.top = event.pageY + 'px';
					div.innerHTML = '<p><strong>Station : </strong></p>'  +String(shp_name) + 
						'<p><strong>Passengers on platform ' + String(df[1].platform) + ': </strong></p>' +  String(df[1].queue) + "<br />"  ;
						
						// '<p><strong>Passengers on platform ' + String(df[1].platform) + ': </strong></p>' +  String(df[1].queue) + "<br />" +"<br />"	;
			        // console.log(d.load_hist);
			        var margin = {top: 20, right: 25, bottom: 30, left: 80},
				        height = 150 - margin.top - margin.bottom,
			            width = 300 - margin.left - margin.right ;
			        // console.log(width + margin.left + margin.right)
			        // console.log(df[0].queue_hist);
			        // console.log( d3.max(df[0].queue_hist[0]))
					var x = d3.scale.linear().domain([0, df[1].queue_hist[0].length]).range([0,width]) //.range([0, width + margin.left + margin.right]);
					var y = d3.scale.linear().domain([0, d3.max(df[1].queue_hist[0])]).range([height, 0]);		
					var line = d3.svg.line()
					// http://bl.ocks.org/benjchristensen/2579599
						// assign the X function to plot our line as we wish
						.x(function(d,i) { 
					
							return x(i); 
						})
						.y(function(d) { 
					
							return y(d); 
					})

					// var divNameHash = "#" + divName
					// console.log(divNameHash)
					var chart = d3.select("#station_tooltip2")
						.append("svg")
			            .attr("width", width + margin.left + margin.right)
			            .attr("height", height + margin.top + margin.bottom)
			            .style("fill", "rgba(255,0,0,0.1)") //#d6d6d6	
						.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
			            
			        // create yAxis
						var xAxis = d3.svg.axis().scale(x).tickSubdivide(false).tickFormat(d3.format("d")).ticks(5);  // .tickSize(- height - margin.top - margin.bottom )
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
					// console.log(d.load_hist)
			        chart.append("path")
				        .attr("d", line(df[1].queue_hist[0]))
				        // .attr('transform', 'translate(' + (margin.left + margin.right)  + ')')
				        // .attr("transform", "translate(0," + (height -  margin.bottom)  + ")")
				        .attr({
						  "fill" : "none",
						  "stroke" : " #f47723 ",
						  "stroke-width" : "5px"
						})
		

				
			})
			

		// enter
		central_trains
			.enter()
			.append("circle")
			.each(setAttributes)
			.on("click", click_train);
	
		// update
		central_trains
			.transition()
			.duration(interval)
			.each(setAttributes)
		
		// exit
		central_trains.exit().remove();


		central_stations 
			.each(function(d,i){
				shp_name = d.properties.name // d is a path
				// console.log(victoria_nested_station_data[t].filter(function(d){ return shp_name == victoria_station_lookup[d.station_id]}))
				var df = central_nested_station_data_by_timeAndStationid[t][d.properties.station_id] // .filter(function(d){ return shp_name == victoria_station_lookup[d.station_id]})
		
				d3.select(this)

					.attr("time", t)
					.attr("station_id", function(d) {
						if (!jQuery.isEmptyObject(df) ){
							return df[0].station_id
						}
					})

					.style("fill", function(d) {
						if (!jQuery.isEmptyObject(df) ){
							// return (df[0].queue < 50) ? "green" : "red";
							return ( Math.max(df[0].queue, df[1].queue) < 50 ) ? "green" : "red";
					}
				})
			})
			.on("click", function(d){
				// console.log(d)
				shp_name = d.properties.name // d is a path
				var df = central_nested_station_data_by_timeAndStationid[t][d.properties.station_id] //.filter(function(d){ return shp_name == victoria_station_lookup[d.station_id]})

				console.log("clicked")
				// console.log(df)

				var idx = -1;
				var temp = ['station_tooltip', 'station_tooltip2']
				var classTypes = ["stationTooltip", "stationTooltip2"]
				for (j in temp){
					var divName = temp[j]
					idx += 1
					// var div = document.getElementById("parent_tooltip").getElementsByClassName(divName)[0];
					var div = document.getElementById(String(divName))
					// console.log(classTypes[idx])
					div.className = classTypes[idx]
					div.style.visibility = 'visible';
					// div.style.left = event.pageX +'px';
					// div.style.top = event.pageY + 'px';
					div.innerHTML = '<p><strong>Station : </strong></p>'  +String(shp_name) + 
						'<p><strong>Passengers on platform ' + String(df[idx].platform) + ': </strong></p>' +  String(df[idx].queue) + "<br />"  ;
						
						// '<p><strong>Passengers on platform ' + String(df[1].platform) + ': </strong></p>' +  String(df[1].queue) + "<br />" +"<br />"	;
			        // console.log(d.load_hist);
			        var margin = {top: 20, right: 25, bottom: 30, left: 80},
				        height = 150 - margin.top - margin.bottom,
			            width = 300 - margin.left - margin.right ;
			        // console.log(width + margin.left + margin.right)
			        // console.log(df[0].queue_hist);
			        // console.log( d3.max(df[0].queue_hist[0]))
					var x = d3.scale.linear().domain([0, df[idx].queue_hist[0].length]).range([0,width]) //.range([0, width + margin.left + margin.right]);
					var y = d3.scale.linear().domain([0, d3.max(df[idx].queue_hist[0])]).range([height, 0]);		
					var line = d3.svg.line()
					// http://bl.ocks.org/benjchristensen/2579599
						// assign the X function to plot our line as we wish
						.x(function(d,i) { 
					
							return x(i); 
						})
						.y(function(d) { 
					
							return y(d); 
					})

					var divNameHash = "#" + divName
					// console.log(divNameHash)
					var chart = d3.select(divNameHash)
						.append("svg")
			            .attr("width", width + margin.left + margin.right)
			            .attr("height", height + margin.top + margin.bottom)
			            .style("fill", "rgba(255,0,0,0.1)") //#d6d6d6	
						.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
			            
			        // create yAxis
						var xAxis = d3.svg.axis().scale(x).tickSubdivide(false).tickFormat(d3.format("d"));;  // .tickSize(- height - margin.top - margin.bottom )
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
					// console.log(d.load_hist)
			        chart.append("path")
				        .attr("d", line(df[idx].queue_hist[0]))
				        // .attr('transform', 'translate(' + (margin.left + margin.right)  + ')')
				        // .attr("transform", "translate(0," + (height -  margin.bottom)  + ")")
				        .attr({
						  "fill" : "none",
						  "stroke" : " #f47723 ",
						  "stroke-width" : "5px"
						})
				}
			})




		// update timer
		timer_holder
			.select("text")
			.transition()
			.duration(interval)
			// .text("Time : " + String(t/60))
			.text(String(victoria_nested_train_data[t][0].Date.getHours()) + ":"  + String( victoria_nested_train_data[t][0].Date.getMinutes()))

		};

	var paused = false; 
    render(currentTime);

    var callback = function () {
        return function () {
            currentTime = currentTime + 60; 
            // console.log(paused);
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
		// console.log(currentTime);
	});

	$("#resumeBtn").click(function() {
		paused = false ;
		console.log("Resume");
		// console.log(currentTime);
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
	
