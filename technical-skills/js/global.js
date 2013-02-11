"use strict";

var vars_hm = new Object;
var bar_width = 100,
	bar_padding = 2;

$(document).ready(function () {
	processHosData();		    		
	assignEventListeners();
});

function processHosData() {
	var w=1035,
		h=400,
		multiplier=6,
		chart_area_y_min = 80,
		chart_area_y_max = h-40;
		
	d3.json('data/heads_of_states.json', function(data) {
		var svg = d3.select("#hos_data .content svg");
		
		//draw y axis and ticks	
    	var yScale = d3.scale.linear()
	        .domain([0, 47])
        	.range([chart_area_y_min, chart_area_y_max]);
        	
        var yAxis = d3.svg.axis()
    	    .scale(yScale)
	        .orient("left")
    	    .tickFormat(d3.format("b")) //so e.g. convert 4,000,000 to 4M
        	.ticks(3);
        	
		svg.append("g")
    		.attr("class", "axis y")
	    	.attr("transform", "translate(" + 16 + ", 8)")
	    	.call(yAxis);
	    	
	    svg.append("text")
	    	.text("years")
	    	.attr("dx", 2)
	    	.attr("dy", 360)
	    	.style("font-family", "Georgia")
	    	.style("font-size", "10px")
	    	.style("font-style", "italic");

		var g = svg.selectAll('#hos_data .content rect')
    		.data(data.countries)
    		.enter()
    		.append("g")
    			.attr("class", function(d, i) { return d.country_code; });
		
		var j = 0;
    	g.append('text')
    		.text(function(d, i) { return d.country; })
			.attr('dx', function(d, i) { return (i*(bar_width+bar_padding)); })
			.attr('dy', 80)
			.attr("class", function(d) { return d.country_code + "_text"; })
			.attr('transform', function(d, i) { return 'rotate(-90,' + (((i*(bar_width+bar_padding)))+20) + ',' + 50 + ') translate(-7,-1)'; });
			
    	g.append('rect')
	    	.attr('x', function(d, i) { return (((i*(bar_width+bar_padding)))+40);})
    		.attr('y', 80)
    		.attr("class", function(d, i) {
    			if(d.is_democracy == "1") return "bars bars_democracy";
    			else return "bars";
    		})
    		.attr('shape-rendering', 'crispEdges')
    		.attr('width', function() {
    			if($.browser.mozilla)
    				return bar_width+1; //fixes border issue in firefox
    			else
    				return bar_width;
    		})
	    	.attr('height', function(d, i) { 
	    		var max = 0, n = 0, max_name = "", max_date = "";
	    		d.tenures = new Array();
	    		
	    		for(var i=0;i<d.data.length;i++) {
	    			//for the last item, compare to this year (2012)
					if(i == d.data.length-1) {
						n = 2013 - d.data[i].date;
						if(n >= max) {
							max = n;
							max_name = d.data[i].name;
		    				max_date = d.data[i].date;
						}
					}
					else {
		    			n = d.data[i+1].date - d.data[i].date;
		    			
		    			//if less than one year, round to one year
		    			if(n == 0) n = 1;
		    				
		    			//console.log(n);
		    			if(n >= max) { 
		    				max = n;
		    				max_name = d.data[i].name;
		    				max_date = d.data[i].date;
		    			}
		    		}
		    		
		    		//add the lengths to our data item for calculating median later on
		    		d["tenures"].push(n);
		    		console.log(d);
	    		}
	    		
	    		//console.log(d);
	    		
	    		d.longest_serving = max;
	    		d.longest_serving_name = max_name;
	    		d.longest_serving_date = max_date;
	    		
	    		return max*multiplier;
	    	})	
			
			//a transparent copy of each rect to make it easier to hover over rects
			g.append('rect')
	    	.attr('x', function(d, i) { return (((i*(bar_width+bar_padding)))+40);})
    		.attr('y', 80)
    		.attr("class", function(d, i) {
    			if(d.is_democracy == "1") return "bars_hover bars_democracy";
    			else return "bars_hover";
    		})
    		.attr('shape-rendering', 'crispEdges')
    		.style('opacity', '0')
    		.attr('width', function() {
    			if($.browser.mozilla)
    				return bar_width+1; //fixes border issue in firefox
    			else
    				return bar_width;
    		})
	    	.attr('height', function(d, i) {
				//get them from the original
	    		d.longest_serving = d3.select(".content svg ." + d.country_code + " .bars").data()[0].longest_serving;
	    		d.longest_serving_name = d3.select(".content svg ." + d.country_code + " .bars").data()[0].longest_serving_name;
	    		d.longest_serving_date = d3.select(".content svg ." + d.country_code + " .bars").data()[0].longest_serving_date;
	    		d.tenures = d3.select(".content svg ." + d.country_code + " .bars").data()[0].tenures;
	    		
	    		return 300; //height of transparent bar
	    	})
	    	.on('mouseover', function(d) {
		    	$("#seperator").css("border-left-width", "1px");
	    		$("#country_name_big #sparklines").show();
	    		$("#country_name_big #sparklines #geezers_name").html("");
	    		draw(d, "#sparklines #content_plot", "s", false, "");
	    		
	    		d3.selectAll("#hos_data .content svg .bars").style('fill', "#CDD7B6");
	    		
				$(".content svg ." + d.country_code + " .bars")
					.css('fill', "#aaba85"); //a9a8a8
				
				var max_term = function(d) {
					return (d.max_term > 0) ? d.max_term + " years" : "none";
				};
				
				console.log(d.tenures);
				
				var to_date = (Number(d.longest_serving_date) + Number(d.longest_serving));
				if(to_date == 2013)
					to_date = 2012;
				
		    	var html_content = d.skill + "<br /><span id='details'><p>" + d.longest_serving_name + "</p><p style='padding-bottom:10px'>" 
		    			+ "<p class='blob'>" + d.blob + "</p>"
		    			+ "</span>";
		    			
		    	$("#country_name_big #content").html(html_content);
			});	
	    	
	    //draw extended ticks (horizontal)
    	var ticks = svg.selectAll('.ticky')
	    	.data(yScale.ticks(3))
    		.enter()
    			.append('svg:g')
    			.attr('transform', function(d) {
	      			return "translate(0, " + (yScale(d)) + ")";
    			})
    			.attr('class', 'ticky')
	    	.append('svg:line')
    			.attr("stroke-dasharray","1,3")
    			.attr('y1', 1)
	    		.attr('y2', 1)
    			.attr('x1', 8)
    			.attr('x2', w+25);
	    	
	    //remove spacers
	    $(".spacer").hide();
	    
	    //initial state
		var html_content = "Java<br /><span id='details'><p>Was my first programming language!</p>";
		$("#country_name_big #content").html(html_content);
		
		//select Cuba when page first loads
		d3.select(".content svg .CU .bars").style('fill', "#aaba85");
		var data_cuba = d3.select("#hos_data .content svg .CU rect.bars").data()[0];
		draw(data_cuba, "#sparklines #content_plot", "s", false, "");
	});
}

function draw(data, container, format) {
	//console.log(data);
	$(container).html("");

	var w = 200,
		h = 110,
		xPadding = 0,
		yPadding = 30;
	
	//for clarity, we reassign
	var which_metric = container;
	
    //prepare our scales and axes
    var xMin = 0, //d3.min(data.data, function(d){ return d.date; }),
	    xMax = data.data.length, //d3.max(data.data, function(d){ return d.date; }),
	    yMin = d3.min(data.tenures),
        yMax = d3.max(data.tenures);

    //scale exceptions
    if(format == "%") {
    	yMax = 1; //0 to 100%
    }
	
	//console.log(data_to_plot);
   	var xScale = d3.scale.linear()
        .domain([0, xMax])
        .range([5, w]);
            
    var yScale = d3.scale.linear()
        .domain([yMin, yMax])
        .range([h-yPadding+2, yPadding-6]);
            
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");
            
	var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .tickFormat(d3.format(format)) //so e.g. convert 4,000,000 to 4M
        .ticks(2);
            
    //draw svg
	var svg = d3.select(container)
        .append("svg")
        .attr("width", w+50)
        .attr("height", h);
    		
	//draw x axis
	var xAxis = svg.append("g")
    	.attr("class", "axis x")
	    .attr("transform", "translate(-26," + (h-xPadding-3) + ")")
    	.call(xAxis);
    	    	
	//draw y axis
	svg.append("g")
    	.attr("class", "axis y")
	    .attr("transform", "translate(" + (yPadding+10) + ",0)")
    	.call(yAxis);
    	
	var line = d3.svg.line()
		.x(function(d,i){ return xScale(i); })
		.y(function(d){ return yScale(d); });
		//.interpolate("basis");

	var paths = svg.append("svg:path")
	    .attr("class", "the_glorious_line default_path_format")
    	.attr("d", line(data.tenures));  	

	//draw points
	var circle = svg.selectAll("circle")
   		.data(data.tenures)
   		.enter()
   			.append("circle")
   			.attr('class','point')
   			.attr('opacity', 1)
   			.attr("cx", function(d,i) {
        		return xScale(i);
   			})
   			.attr("cy", function(d) { return yScale(d); })
   			.attr("r", 3)
   			.each(function(d, i) {
					//a transparent copy of each rect to make it easier to hover over rects
					svg.append('rect')
		    			.attr('shape-rendering', 'crispEdges')
		    			.style('opacity', 0)
			    		.attr('x', function() { return xScale(i)-5; })
    					.attr('y', 10)
	    				.attr("class", "trans_rect")
    					.attr('shape-rendering', 'crispEdges')
	    				.attr('width', function() {
	    					return w/data.tenures.length;
			    		})
				    	.attr('height', 120) //height of transparent bar
				    	.on('mouseover', function() {
							d3.selectAll(".tooltip").remove(); //timestamp is used as id
							d3.selectAll(".tooltip_box").remove(); //timestamp is used as id
							
							d3.select(which_metric + " svg")
								.append("svg:rect")
								.attr("width", 40)
								.attr("height", 18)
								.attr("x", function() { return xScale(i)-5; })
								.attr("y", function() { return yScale(d)-25; })
								.attr("class", "tooltip_box");
						
							d3.select(which_metric + " svg")
								.append("text")
									.attr("x", function() { return xScale(i)+15; })
									.attr("y", function() { return yScale(d)-12; })
									.attr("text-anchor", "start")
									.attr("class", "tooltip")
									.attr("cursor", "default");
						})
						.attr('class', 'line_label');
				});
		
		
		//hide axes
		$("#sparklines svg text").hide();
}


function assignEventListeners() {
	$("#hos_data .content svg").on("click", function() {
		d3.selectAll("#hos_data .content .bars")
			.style('fill', "#CDD7B6");
	    $("#country_name_big #content").html("");
	    $("#country_name_big #sparklines #content_plot").html("");
	    $("#country_name_big #sparklines").hide();
	    $("#seperator").css("border-left-width", "0px");
	});
}

function addCommas(nStr) {
	nStr += '';
	var x = nStr.split('.');
	var x1 = x[0];
	var x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {

		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

function getHumanSize(size) {
	var sizePrefixes = ' kmbtpezyxwvu';
	if(size <= 0) return '0';
	var t2 = Math.min(Math.floor(Math.log(size)/Math.log(1000)), 12);
	return (Math.round(size * 100 / Math.pow(1000, t2)) / 100) +
		sizePrefixes.charAt(t2).replace(' ', '');
}
