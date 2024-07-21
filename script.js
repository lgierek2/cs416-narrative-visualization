const parseDate = d3.timeParse("%Y-%m-%d");
// Load the data
d3.csv("https://raw.githubusercontent.com/lgierek2/cs416-narrative-visualization/main/us-states.csv").then(data => {
    // Parse the data
    data.forEach(d => {
        d.date = parseDate(d.date); // Parse date
        d.cases = +d.cases; // Convert cases to number
        d.deaths = +d.deaths; // Convert deaths to number
    });

    let currentScene = 0;
    // Get unique states
    const states = Array.from(new Set(data.map(d => d.state)));

    // Populate the dropdown with state options
    const stateFilter = d3.select("#stateFilter");
    stateFilter.selectAll("option")
        .data(states)
        .enter().append("option")
        .attr("value", d => d)
        .text(d => d);

    // Define scenes
    const scenes = [
        {
            title: "Total Cases Over Time",
            render: () => renderTotalCases(data)
        },
        {
            title: "Total Deaths Over Time",
            render: () => renderTotalDeaths(data)
        },
        {
            title: "Comparison of Cases and Deaths",
            render: () => renderComparison(data)
        }
    ];

    // Render the first scene
    renderScene();

    // Button event listeners
    document.getElementById("prevButton").addEventListener("click", () => {
        if (currentScene > 0) {
            currentScene--;
            renderScene();
        }
    });

    document.getElementById("nextButton").addEventListener("click", () => {
        if (currentScene < scenes.length - 1) {
            currentScene++;
            renderScene();
        }
    });

    document.getElementById("stateFilter").addEventListener("change", () => {
        if (currentScene === 2) { // Update only when on the comparison scene
            renderComparison(data);
        }
    });

    function renderScene() {
        // Clear the visualization area
        d3.select("#visualization").html("");
        // Render the current scene
        scenes[currentScene].render();
        // Update button visibility
        document.getElementById("prevButton").style.display = currentScene === 0 ? "none" : "inline";
        document.getElementById("nextButton").style.display = currentScene === scenes.length - 1 ? "none" : "inline";
        // Show/hide dropdown based on scene
        document.getElementById("stateFilter").style.display = currentScene === 2 ? "inline" : "none";
        // Add title
        d3.select("#visualization")
            .append("h2")
            .text(scenes[currentScene].title);
    }

// Function to render total cases over time
function renderTotalCases(data) {
    const svg = d3.select("#visualization").append("svg").attr("width", 800).attr("height", 400);
    const margin = { top: 20, right: 30, bottom: 80, left: 60 }; // Adjust bottom margin for axis labels
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([margin.left, width - margin.right]);
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.cases)])
        .range([height - margin.bottom, margin.top]);

    const xAxis = d3.axisBottom(x)
        .ticks(d3.timeMonth.every(1))
        .tickFormat(d3.timeFormat("%b %Y")); // Month abbreviation and year

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width - margin.right)
        .attr("y", height - margin.bottom + 40) // Adjust for label space
        .text("Date");
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", margin.left - 50) // Adjust for label space
        .attr("x", -margin.top)
        .text("Total Cases");

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => x(d.date))
            .y(d => y(d.cases))
        );
}

// Function to render total deaths over time
function renderTotalDeaths(data) {
    const svg = d3.select("#visualization").append("svg").attr("width", 800).attr("height", 400);
    const margin = { top: 20, right: 30, bottom: 80, left: 60 }; // Adjust bottom margin for axis labels
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([margin.left, width - margin.right]);
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.deaths)])
        .range([height - margin.bottom, margin.top]);

    const xAxis = d3.axisBottom(x)
        .ticks(d3.timeMonth.every(1))
        .tickFormat(d3.timeFormat("%b %Y")); // Month abbreviation and year

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width - margin.right)
        .attr("y", height - margin.bottom + 40) // Adjust for label space
        .text("Date");
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", margin.left - 50) // Adjust for label space
        .attr("x", -margin.top)
        .text("Total Deaths");

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => x(d.date))
            .y(d => y(d.deaths))
        );
}

    function renderComparison(data) {
        const selectedState = d3.select("#stateFilter").property("value");
        const filteredData = data.filter(d => d.state === selectedState);

        const svg = d3.select("#visualization").append("svg").attr("width", 800).attr("height", 400);
        const margin = { top: 20, right: 30, bottom: 40, left: 60 };
        const width = +svg.attr("width") - margin.left - margin.right;
        const height = +svg.attr("height") - margin.top - margin.bottom;
        const x = d3.scaleBand()
            .domain(filteredData.map(d => d.date))
            .range([margin.left, width - margin.right])
            .padding(0.1);
        const y = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => Math.max(d.cases, d.deaths))])
            .range([height - margin.bottom, margin.top]);
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m/%d/%Y")));
        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));
        svg.append("text")
    }
});
