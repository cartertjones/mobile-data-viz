    // The svg
    const svgContainer = d3.select("#chloropleth_dataviz")
        .classed("img-fluid", true);
    const width = +svgContainer.style("width").slice(0, -2); // Get the width of the container
    const height = +svgContainer.style("height").slice(0, -2); // Get the height of the container

    const svg = svgContainer
        .append("svg")
        .attr("width", "100%") // Make the SVG width 100% of the parent div
        .attr("height", "100%") // Make the SVG height 100% of the parent div
        .attr("viewBox", `0 0 ${width} ${height}`) // Maintain aspect ratio with viewBox
        .attr("preserveAspectRatio", "xMidYMid meet"); // Maintain aspect ratio

    
    // Map and projection
    const path = d3.geoPath();
    const projection = d3.geoMercator()
      .scale(70)
      .center([0,20])
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
    d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", function(d) {
    data.set(d.code, +d.pop)
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
        tooltip
            .html(d.properties.name + "<br>" + "Population: " + (data.get(d.id) || 0))
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
          d.total = data.get(d.id) || 0;
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
var legendData = [100000, 1000000, 10000000, 30000000, 100000000, 500000000];

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
