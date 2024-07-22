// Constants
const margin = { top: 50, right: 50, bottom: 50, left: 50 };
const width = 960 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;
const colorScale = d3.scaleSequential(d3.interpolateViridis).domain([0, 1000]);
const svgWidth = 960;
const svgHeight = 600;

// Load data
d3.csv("us-states.csv").then(data => {
    // Convert date strings to Date objects
    data.forEach(d => {
        d.date = new Date(d.date);
        d.cases = +d.cases;
        d.deaths = +d.deaths;
    });

    // Process data
    const heatmapData = processHeatmapData(data);
    const lineChartData = processLineChartData(data);

    // Draw heatmap on Nationwide Overview tab
    drawHeatmap(heatmapData);

    // Initialize the line chart
    drawLineChart(lineChartData);

    // Initialize the bar chart
    drawBarChart(data);

    // Event handlers for tabs
    document.querySelector("#overview-tab").addEventListener("click", () => {
        document.querySelector("#heatmap").style.display = "block";
        document.querySelector("#line-chart").style.display = "none";
        document.querySelector("#bar-chart").style.display = "none";
    });

    document.querySelector("#line-tab").addEventListener("click", () => {
        document.querySelector("#heatmap").style.display = "none";
        document.querySelector("#line-chart").style.display = "block";
        document.querySelector("#bar-chart").style.display = "none";
    });

    document.querySelector("#compare-tab").addEventListener("click", () => {
        document.querySelector("#heatmap").style.display = "none";
        document.querySelector("#line-chart").style.display = "none";
        document.querySelector("#bar-chart").style.display = "block";
    });
});

// Function to process heatmap data
function processHeatmapData(data) {
    // Example processing
    // Aggregate data by state and date
    const heatmapData = d3.nest()
        .key(d => d.state)
        .key(d => d.date.toISOString().split('T')[0])  // Only date part
        .rollup(v => d3.sum(v, d => d.cases))
        .entries(data);
    
    return heatmapData;
}

// Function to draw heatmap
function drawHeatmap(data) {
    // SVG setup
    const svg = d3.select("#heatmap-svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleBand().range([0, width]).padding(0.1);
    const yScale = d3.scaleBand().range([height, 0]).padding(0.1);
    
    xScale.domain(data.map(d => d.key));
    yScale.domain(data.flatMap(d => d.values.map(v => v.key)));

    // Draw heatmap
    svg.selectAll("rect")
        .data(data.flatMap(d => d.values.map(v => ({ ...v, state: d.key }))))
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.state))
        .attr("y", d => yScale(d.key))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .style("fill", d => colorScale(d.value));

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Add color legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 150},0)`);

    legend.selectAll("rect")
        .data(colorScale.ticks(10))
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 20)
        .attr("width", 30)
        .attr("height", 20)
        .style("fill", d => colorScale(d));
    
    legend.selectAll("text")
        .data(colorScale.ticks(10))
        .enter()
        .append("text")
        .attr("x", 40)
        .attr("y", (d, i) => i * 20 + 15)
        .text(d => d);
}

// Function to process line chart data
function processLineChartData(data) {
    // Example processing
    // Group data by date and calculate total cases and deaths
    const lineChartData = d3.nest()
        .key(d => d.date.toISOString().split('T')[0])
        .rollup(v => ({
            totalCases: d3.sum(v, d => d.cases),
            totalDeaths: d3.sum(v, d => d.deaths)
        }))
        .entries(data);
    
    return lineChartData;
}

// Function to draw line chart
function drawLineChart(data) {
    // SVG setup
    const svg = d3.select("#line-chart-svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleTime().range([0, width]);
    const yScale = d3.scaleLinear().range([height, 0]);

    xScale.domain(d3.extent(data, d => new Date(d.key)));
    yScale.domain([0, d3.max(data, d => Math.max(d.value.totalCases, d.value.totalDeaths))]);

    // Line generators
    const lineCases = d3.line()
        .x(d => xScale(new Date(d.key)))
        .y(d => yScale(d.value.totalCases));
    
    const lineDeaths = d3.line()
        .x(d => xScale(new Date(d.key)))
        .y(d => yScale(d.value.totalDeaths));

    // Draw lines
    svg.append("path")
        .data([data])
        .attr("d", lineCases)
        .style("stroke", "blue")
        .style("fill", "none");
    
    svg.append("path")
        .data([data])
        .attr("d", lineDeaths)
        .style("stroke", "red")
        .style("fill", "none");

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Add legend
    svg.append("circle").attr("cx", width - 100).attr("cy", 30).attr("r", 6).style("fill", "blue");
    svg.append("text").attr("x", width - 90).attr("y", 30).text("Total Cases").style("fill", "blue");

    svg.append("circle").attr("cx", width - 100).attr("cy", 60).attr("r", 6).style("fill", "red");
    svg.append("text").attr("x", width - 90).attr("y", 60).text("Total Deaths").style("fill", "red");
}

// Function to draw bar chart
function drawBarChart(data) {
    // SVG setup
    const svg = d3.select("#bar-chart-svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleBand().range([0, width]).padding(0.1);
    const yScale = d3.scaleLinear().range([height, 0]);

    xScale.domain(data.map(d => d.state));
    yScale.domain([0, d3.max(data, d => d.cases)]);

    // Draw bars
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.state))
        .attr("y", d => yScale(d.cases))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.cases))
        .style("fill", "steelblue")
        .on("mouseover", function(event, d) {
            d3.select(this).style("fill", "orange");
            const [x, y] = d3.pointer(event);
            d3.select("#tooltip")
                .style("left", x + 5 + "px")
                .style("top", y - 28 + "px")
                .style("display", "inline-block")
                .html(`State: ${d.state}<br>Cases: ${d.cases}`);
        })
        .on("mouseout", function()




more 
ChatGPT
Here’s the continuation of the script.js file, completing the drawBarChart function and including additional utility functions:

javascript
Copy code
        .on("mouseout", function() {
            d3.select(this).style("fill", "steelblue");
            d3.select("#tooltip").style("display", "none");
        });

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));
    
    svg.append("g")
        .call(d3.axisLeft(yScale));
}

// Function to handle state selection in the dropdown
function handleStateSelection() {
    d3.select("#state-dropdown").on("change", function() {
        const selectedState = d3.select(this).property("value");
        updateBarChartForState(selectedState);
    });
}

// Function to update bar chart based on selected state
function updateBarChartForState(state) {
    d3.csv("us-states.csv").then(data => {
        const filteredData = data.filter(d => d.state === state);
        const svg = d3.select("#bar-chart-svg").select("g");
        
        // Update bar chart
        svg.selectAll(".bar")
            .data(filteredData)
            .transition()
            .duration(750)
            .attr("y", d => yScale(d.cases))
            .attr("height", d => height - yScale(d.cases));
        
        svg.selectAll(".bar-text").remove();

        svg.selectAll(".bar-text")
            .data(filteredData)
            .enter()
            .append("text")
            .attr("class", "bar-text")
            .attr("x", d => xScale(d.state) + xScale.bandwidth() / 2)
            .attr("y", d => yScale(d.cases) - 5)
            .attr("text-anchor", "middle")
            .text(d => d.cases);
    });
}

// Function to initialize the dropdown with states
function initializeDropdown(states) {
    const dropdown = d3.select("#state-dropdown");
    dropdown.selectAll("option")
        .data(states)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);
}

// Function to process state list
function processStateList(data) {
    const states = Array.from(new Set(data.map(d => d.state)));
    initializeDropdown(states);
}

// Initial function to set up all components
function initialize() {
    d3.csv("us-states.csv").then(data => {
        processStateList(data);
        handleStateSelection();
    });
}

// Call the initialize function on page load
initialize();
