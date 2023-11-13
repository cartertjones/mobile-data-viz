// class instance variables
const regionDropdown = document.getElementById("region-dropdown");
let regionOfInterest = regionDropdown.value;

const categoryDropdown = document.getElementById("category");
let selectedCategory = categoryDropdown.value;

let margin, svg, x, xAxis, y, yAxis;

// dropdown eventListeners
regionDropdown.addEventListener("change", function () {
    regionOfInterest = regionDropdown.value;
    update();
});
categoryDropdown.addEventListener("change", function () {
    selectedCategory = categoryDropdown.value;
    update();
});

// set the dimensions and margins of the graph
margin = { top: 30, right: 30, bottom: 100, left: 60 };
const parentDiv = document.getElementById("bar_dataviz"); // Replace "bar_dataviz" with the actual ID of the parent div
const width = parentDiv.clientWidth - margin.left - margin.right;
const height = 400 * 2 - margin.top - margin.bottom;

// append the svg object to the body of the page
svg = d3.select(parentDiv)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Initialize the X axis
x = d3.scaleBand()
    .range([0, width])
    .padding(0.2);
xAxis = svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .attr("class", "x-axis");

// Initialize the Y axis
y = d3.scaleLinear()
    .range([height, 0]);
yAxis = svg.append("g")
    .attr("class", "y-axis");

function update() {
    // Parse the Data
    d3.json("https://raw.githubusercontent.com/cartertjones/mobile-data-viz/production/data/data.json")
        .then(function (data) {
            try {
                // Filters data, removes missing values
                const filteredData = data.filter(d =>
                    d.Region === regionOfInterest &&
                    parseFloat(d[selectedCategory]) !== 0 &&
                    !isNaN(parseFloat(d[selectedCategory]))
                );

                // Sort the filtered data by the selected variable in descending order
                filteredData.sort((a, b) => parseFloat(b[selectedCategory]) - parseFloat(a[selectedCategory]));

                // X axis
                x.domain(filteredData.map(d => d.Country));
                const xAxisTransition = xAxis.transition().duration(1000).call(d3.axisBottom(x));

                // Rotate X labels if there are 15 or more data points
                if (filteredData.length >= 15) {
                    xAxisTransition.selectAll("text")
                        .attr("transform", "rotate(-45)")
                        .attr("text-anchor", "end")
                        .attr("dx", "-.8em")
                        .attr("dy", ".15em");
                } else {
                    xAxisTransition.selectAll("text").attr("transform", null);
                }

                // Add Y axis
                y.domain([0, d3.max(filteredData, d => +d[selectedCategory])]);
                yAxis.transition().duration(1000).call(d3.axisLeft(y));

                // Select all existing rectangles and remove them
                svg.selectAll("rect")
                    .data(filteredData)
                    .exit()
                    .remove();

                // variable u: map data to existing bars
                const u = svg.selectAll("rect")
                    .data(filteredData);

                // Enter new bars
                u.enter()
                    .append("rect")
                    .attr("x", d => x(d.Country))
                    .attr("y", height)
                    .attr("width", x.bandwidth())
                    .attr("fill", "#ddaaff")
                    .merge(u) // Update existing and new bars
                    .transition()
                    .duration(1000)
                    .attr("x", d => x(d.Country))
                    .attr("y", d => y(+d[selectedCategory]))
                    .attr("width", x.bandwidth())
                    .attr("height", d => height - y(+d[selectedCategory]))
                    .attr("class", "bar");
            } catch (error) {
                console.error("An error occurred: " + error);
            }
        });
}

update();
