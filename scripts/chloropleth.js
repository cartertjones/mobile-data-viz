    // The svg
    let margin = { top: 30, right: 30, bottom: 100, left: 60 };
    const parentDiv = document.getElementById("chloropleth_dataviz"); // Replace "bar_dataviz" with the actual ID of the parent div
    const width = parentDiv.clientWidth - margin.left - margin.right;
    const height = 400 * 2 - margin.top - margin.bottom;

    const svg = d3.select(parentDiv)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      //.attr("transform", `translate(${margin.left},${margin.top})`);
    
      //title
      svg.append("text")
        .attr("x", width / 2)  // Center the title horizontally
        .attr("y", 0 + (margin.top))  // Position above the top margin
        .attr("text-anchor", "middle")  // Center the text anchor
        .attr("id", 'chloropleth-title')
        .text("Global population distribution")
        .attr("class", "graph-title");
    // Map and projection
    const path = d3.geoPath();
    const projection = d3.geoMercator()
      .scale(130)
      .center([0,40])
      .translate([width / 2, height / 2]);
    
    // Data and color scale
    const data = new Map();
    const colorScale = d3.scaleThreshold()
      .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
      .range(d3.schemeBlues[7]);

    // Create a tooltip
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip");

    // Load external data and boot
    Promise.all([
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
    d3.csv("https://raw.githubusercontent.com/cartertjones/mobile-data-viz/production/data/merged_data.csv", function(d) {
    data.set(d.code, { 
      pop: +d.pop, 
      household_estimate_pc: +d.household_estimate_pc,
      household_estimate_t: +d.household_estimate_t,
      food_service_estimate_pc: +d.food_service_estimate_pc,
      food_service_estimate_t: +d.food_service_estimate_t,
      retail_estimate_pc: +d.retail_estimate_pc,
      retail_estimate_t: +d.retail_estimate_t
    })
})]).then(function(loadData){
    let topo = loadData[0]

    let mouseOver = function(d) {
        tooltip.style("opacity", 1);
        d3.selectAll(".Country")
          .transition()
          .duration(200)
          .style("opacity", .5)
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 1)
          //.style("stroke", "black")
    }

    let mousemove = function (event, d) {
    if (d.properties && d.properties.name) {
      console.log(data.get(d.id).household_estimate_pc)
        tooltip
            .html(
              d.properties.name 
              + "<br>" 
              + "Population: " 
              + (data.get(d.id).pop || 0)
              + "<br>" 
              + "Household estimate (kg/capita/year): "
              + (data.get(d.id).household_estimate_pc || "Unknown")
              + "<br>" 
              + "Household estimate (tonnes/year): "
              + (data.get(d.id).household_estimate_t || "Unknown")
              + "<br>" 
              + "Food service estimate (kg/capita/year): "
              + (data.get(d.id).food_service_estimate_pc || "Unknown")
              + "<br>" 
              + "Food service estimate (tonnes/year): "
              + (data.get(d.id).food_service_estimate_t || "Unknown")
              + "<br>" 
              + "Retail estimate (kg/capita/year): "
              + (data.get(d.id).retail_estimate_pc || "Unknown")
              +"<br>"
              + " Retail estimate (tonnes/year): "
              + (data.get(d.id).retail_estimate_t || "Unknown")
            )
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 30) + "px");
        }
    }


    let mouseLeave = function(d) {
        tooltip.style("opacity", 0);
        d3.selectAll(".Country")
          .transition()
          .duration(200)
          .style("opacity", .8)
        d3.select(this)
          .transition()
          .duration(200)
          //.style("stroke", "transparent")
    }

    // Draw the map
    svg.append("g")
      .selectAll("path")
      .data(topo.features)
      .enter()
      .append("path")
        // draw each country
        .attr("d", d3.geoPath()
          .projection(projection)
        )
        // set the color of each country
        .attr("fill", function (d) {
          d.total = (data.get(d.id) && data.get(d.id).pop) || 0;
          return colorScale(d.total);
        })
        .style("stroke", "transparent")
        .attr("class", function(d){ return "Country" } )
        .style("opacity", .8)
        .on("mouseover", mouseOver )
        .on("mousemove", mousemove )
        .on("mouseleave", mouseLeave )

    //end  
    }) 
    
// Create a legend
const legend = d3.select("#chloropleth_legend")
    .append("svg")
    .attr("width", "100%") // Make the SVG width 100% of the parent div
    .attr("height", "100%") // Make the SVG height 100% of the parent div
    .attr("viewBox", "0 0 200 200") // Maintain aspect ratio with viewBox
    .attr("preserveAspectRatio", "xMidYMid meet") // Maintain aspect ratio
    .append("g")
    .attr("transform", "translate(10,10)");

// Add a title to the legend
legend.append("text")
    .attr("x", 0)
    .attr("y", 10)
    .text("Population")
    .style("font-weight", "bold");

// Set the color scale values for the legend
let legendData = [100000, 1000000, 10000000, 30000000, 100000000, 500000000];

// Create color rectangles in the legend
legend.selectAll("rect")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", function (d, i) {
        return i * 20 + 20;
    })
    .attr("width", 20)
    .attr("height", 20)
    .style("fill", function (d) {
        return colorScale(d);
    });

// Add text labels to the legend
legend.selectAll("text")
    .data(legendData)
    .enter()
    .append("text")
    .attr("x", 30)
    .attr("y", function (d, i) {
        return i * 20 + 14 + 20;
    })
    .text(function (d) {
        return d;
    });
