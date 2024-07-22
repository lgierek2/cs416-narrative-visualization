// Constants
const margin = { top: 50, right: 50, bottom: 50, left: 50 };
const width = 960 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;
const colorScale = d3.scaleSequential(d3.interpolateRed).domain([0, 1000]);
const svgWidth = 960;
const svgHeight = 600;

// Load data
d3.csv("https://raw.githubusercontent.com/lgierek2/cs416-narrative-visualization/main/us-states.csv").then(data => {
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

    // Initialize dropdown
    processStateList(data);
    handleStateSelection();
});

// Function to process heatmap data
function processHeatmapData(data) {
    const heatmapData = d3.group(data, d => d.state, d => d.date.toISOString().split('T')[0]);
    return Array.from(heatmapData, ([state, dates]) => ({
        state,
        values: Array.from(dates, ([date, records]) => ({
            date,
            cases: d3.sum(records, d => d.cases)
        }))
    }));
}

// Function to draw heatmap
function drawHeatmap(data) {
    const svg = d3.select("#heatmap-svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleBand().range([0, width]).padding(0.1);
    const yScale = d3.scaleBand().range([height, 0]).padding(0.1);

    const allDates = Array.from(new Set(data.flatMap(d => d.values.map(v => v.date))));
    xScale.domain(allDates);
    yScale.domain(data.map(d => d.state));

    // Draw heatmap
    svg.selectAll("rect")
        .data(data.flatMap(d => d.values.map(v => ({ ...v, state: d.state }))))
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.date))
        .attr("y", d => yScale(d.state))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .style("fill", d => colorScale(d.cases));

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
    const lineChartData = d3.group(data, d => d.date.toISOString().split('T')[0])
        .entries()
        .map(([date, records]) => ({
            date: new Date(date),
            totalCases: d3.sum(records, d => d.cases),
            totalDeaths: d3.sum(records, d => d.deaths)
        }));

    return lineChartData;
}

// Function to draw line chart
function drawLineChart(data) {
    const svg = d3.select("#line-chart-svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleTime().range([0, width]);
    const yScale = d3.scaleLinear().range([height, 0]);

    xScale.domain(d3.extent(data, d => d.date));
    yScale.domain([0, d3.max(data, d => Math.max(d.totalCases, d.totalDeaths))]);

    // Line generators
    const lineCases = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.totalCases));
    
    const lineDeaths = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.totalDeaths));

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
    const svg = d3.select("#bar-chart-svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleBand().range([0, width]).padding};
    
    initialize();
