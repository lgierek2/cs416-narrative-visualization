// Load the data
d3.csv('https://raw.githubusercontent.com/lgierek2/cs416-narrative-visualization/main/us-states.csv').then(data => {
    // Parse the date and convert values to numbers
    const parseDate = d3.timeParse("%m/%d/%Y");
    data.forEach(d => {
        d.date = parseDate(d.date);
        d.cases = +d.cases;
        d.deaths = +d.deaths;
    });

    // Define scenes
    const scenes = [
        {
            title: "Total Cases Over Time",
            render: renderTotalCases
        },
        {
            title: "Total Deaths Over Time",
            render: renderTotalDeaths
        },
        {
            title: "Cases vs. Deaths Comparison",
            render: renderComparison
        }
    ];

    let currentSceneIndex = 0;

    // Function to render a scene
    function renderScene(index) {
        d3.select("#visualization").html(""); // Clear previous content
        scenes[index].render(data);
        updateButtons(index);
    }

    // Update button visibility
    function updateButtons(index) {
        document.getElementById("prevButton").style.display = index > 0 ? "inline" : "none";
        document.getElementById("nextButton").style.display = index < scenes.length - 1 ? "inline" : "none";
    }

    // Navigation buttons
    document.getElementById("prevButton").addEventListener("click", () => {
        if (currentSceneIndex > 0) {
            currentSceneIndex--;
            renderScene(currentSceneIndex);
        }
    });

    document.getElementById("nextButton").addEventListener("click", () => {
        if (currentSceneIndex < scenes.length - 1) {
            currentSceneIndex++;
            renderScene(currentSceneIndex);
        }
    });

    // Initial render
    renderScene(currentSceneIndex);
});

// Define scene rendering functions
function renderTotalCases(data) {
    // Implement the rendering logic for the total cases scene
    const svg = d3.select("#visualization").append("svg").attr("width", 800).attr("height", 500);
    const margin = {top: 20, right: 20, bottom: 30, left: 40};
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    x.domain(d3.extent(data, d => d.date));
    y.domain([0, d3.max(data, d => d.cases)]);

    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    g.append("g")
        .call(d3.axisLeft(y));

    g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => x(d.date))
            .y(d => y(d.cases)));
}

function renderTotalDeaths(data) {
    // Implement the rendering logic for the total deaths scene
    const svg = d3.select("#visualization").append("svg").attr("width", 800).attr("height", 500);
    const margin = {top: 20, right: 20, bottom: 30, left: 40};
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    x.domain(d3.extent(data, d => d.date));
    y.domain([0, d3.max(data, d => d.deaths)]);

    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    g.append("g")
        .call(d3.axisLeft(y));

    g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => x(d.date))
            .y(d => y(d.deaths)));
}

function renderComparison(data) {
    // Implement the rendering logic for the cases vs deaths comparison scene
    const svg = d3.select("#visualization").append("svg").attr("width", 800).attr("height", 500);
    const margin = {top: 20, right: 20, bottom: 30, left: 40};
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    x.domain(d3.extent(data, d => d.date));
    y.domain([0, d3.max(data, d => Math.max(d.cases, d.deaths))]);

    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    g.append("g")
        .call(d3.axisLeft(y));

    g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => x(d.date))
            .y(d => y(d.cases)));

    g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => x(d.date))
            .y(d => y(d.deaths)));

    // Add annotations for significant points
    const highestCases = data.reduce((a, b) => (a.cases > b.cases ? a : b));
    const highestDeaths = data.reduce((a, b) => (a.deaths > b.deaths ? a : b));

    g.append("circle")
        .attr("cx", x(highestCases.date))
        .attr("cy", y(highestCases.cases))
        .attr("r", 5)
        .attr("fill", "steelblue");

    g.append("circle")
        .attr("cx", x(highestDeaths.date))
        .attr("cy", y(highestDeaths.deaths))
        .attr("r", 5)
        .attr("fill", "red");

    g.append("text")
        .attr("x", x(highestCases.date))
        .attr("y", y(highestCases.cases) - 10)
        .attr("text-anchor", "middle")
        .text("Highest cases");

    g.append("text")
        .attr("x", x(highestDeaths.date))
        .attr("y", y(highestDeaths.deaths) - 10)
        .attr("text-anchor", "middle")
        .text
