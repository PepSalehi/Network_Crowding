queue()
    .defer(d3.json, "static/geojson/tfl_stations_2.json")
    .defer(d3.json, "static/geojson/tfl_lines.json")
    .defer(d3.csv, "static/csv/trains_states.csv")
    .await(makeGraphs);

'use strict';

function makeGraphs(error, stationsJson, linesJson, station_states) {


	stations = stationsJson;

	var dateFormat = d3.time.format("%y-%b-%d");
	var timeFormat = d3.time.format("%H:%M");

	central_lines = linesJson.features.filter(function(d) {return(d.properties.lines[0].name=="Central")});
	central_stations = stationsJson.features.filter(function(d) {return(d.properties.lines[0].name=="Central")});


	var height = 600;
	var width = 1400;
	var projection = d3.geo.mercator()

	var path = d3.geo.path().projection(projection);

	 var geoID = function(d) {
            return "c" + d.properties.name;
          };

          var click = function(d) {
            stations.attr('fill-opacity', 0.2); // Another update!
            d3.select('#' + geoID(d)).attr('fill-opacity', 1);
          };

          var hover_stations = function(d) {
            console.log('d', d, 'event', event);
            var div = document.getElementById('tooltip');
            div.style.left = event.pageX +'px';
            div.style.top = event.pageY + 'px';
            div.innerHTML = d.properties.name;
          }
          var hover_lines = function(d) {
            console.log('d', d, 'event', event);
            var div = document.getElementById('tooltip');
            div.style.left = event.pageX +'px';
            div.style.top = event.pageY + 'px';
            div.innerHTML = d.properties.id;
          }


            

            // New function
            var zoom = d3.behavior.zoom()
                        .scaleExtent([1, 8])
                        .on("zoom", zoomed);

            // var mapZoom = d3.behavior.zoom()
            //                 .translate(projection.translate())
            //                 .scale(projection.scale())
            //                 .on("zoom", zoomed);

          var path = d3.geo.path().projection(projection);

          var svg = d3.select("#map")
              .append("svg")
              .attr("width", width)
              .attr("height", height)
              
          var zoomed = function () {
              g.attr("transform", "translate("+ d3.event.translate + ")scale(" + d3.event.scale + ")");
              // stations.attr("transform", "translate("+ d3.event.translate + ")scale(" + d3.event.scale + ")");
              // lines.attr("transform", "translate("+ d3.event.translate + ")scale(" + d3.event.scale + ")");

            };

          // d3.select("#map")
          //   .selectAll("path")
          //   .data(central_stations)
          //   .enter()
          //   .append("path")
          //   .attr("d", path)


          



          var b, s, t;
          projection.scale(1).translate([0, 0]);
          var b = path.bounds(stations);
          var s = .9 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
          var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
          projection.scale(s).translate(t);



          var stations = svg.append('g')
                        .selectAll('path')
                        .data(central_stations);

          stations.enter()
             .append('path')
             .attr('d', path)
             .attr('id', geoID)
             .attr('class', 'station')
             .on("click", click)
             .on("mouseover", hover_stations);

          // stations.exit().remove();


          var lines = svg.append('g')
            .selectAll('path')
            .data(central_lines);
          lines.enter()
             .append('path')
             .attr('d', path)
             .attr('class', 'line')
             // .on("mouseover", hover_lines);

          lines.exit().remove();


          // svg.append("rect")
          //   .attr("class", "overlay")
          //   .attr("width", width)
          //   .attr("height", height)
          //   .call(zoom);


          var trains = svg
                          .selectAll('trains')
                          .data(central_stations)
          trains
            .enter()
            .append("circle")
            .attr({
              cx: function(d){ return projection(d.geometry.coordinates)[0]}, 
              cy: function(d){ return projection(d.geometry.coordinates)[1]},
              r : 5
            })
            .attr("d", path)
            .attr("class", "train")

            console.log(trains)
            console.log(lines)
}

}();
	
