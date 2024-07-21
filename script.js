// Function to display a list of dates
function displayDateList(data) {
    const dateListContainer = d3.select("#date-list");
    dateListContainer.html("");  // Clear previous content

    const ul = dateListContainer.append("ul");
    
    data.forEach(d => {
        ul.append("li")
            .text(`${d.date.toDateString()} (${d.date.toISOString()})`);
    });
}

function renderTotalCases(data) {
    // Your existing code for rendering total cases
}

function renderTotalDeaths(data) {
    // Your existing code for rendering total deaths
}

function renderComparison(data) {
    const parseDate = d3.timeParse("%m/%d/%Y");
    data.forEach(d => {
        d.date = parseDate(d.date);
        d.cases = +d.cases;
        d.deaths = +d.deaths;
    });

    // Display the date list
    displayDateList(data);

    const svg = d3.select("#content").append("svg").attr("width", 800).attr("height", 500);
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime().rangeRound([0, width]);
    const y = d3.scaleLinear().rangeRound([height, 0]);

    x.domain(d3.extent(data, d => d.date));
    y.domain([0, d3.max(data, d => Math.max(d.cases, d.deaths))]);

    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    g.append("g")
        .call(d3.axisLeft(y));

    const lineCases = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.cases));

    const lineDeaths = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.deaths));

    g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", lineCases);

    g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr("d", lineDeaths);

    // Add annotations for the highest points
    const highestCases = data.reduce((a, b) => (a.cases > b.cases ? a : b));
    const highestDeaths = data.reduce((a, b) => (a.deaths > b.deaths ? a : b));

    const annotations = [
        {
            note: { label: "Highest cases point" },
            x: x(highestCases.date),
            y: y(highestCases.cases),
            dy: -30,
            dx: -30
        },
        {
            note: { label: "Highest deaths point" },
            x: x(highestDeaths.date),
            y: y(highestDeaths.deaths),
            dy: -30,
            dx: -30
        }
    ];

    const makeAnnotations = d3.annotation()
        .annotations(annotations);

    g.append("g")
        .call(makeAnnotations);
}

// Main code
d3.csv('https://raw.githubusercontent.com/lgierek2/cs416-narrative-visualization/main/us-states.csv').then(data => {
    const parseDate = d3.timeParse("%m/%d/%Y");
    data.forEach(d => {
        d.date = parseDate(d.date);
        d.cases = +d.cases;
        d.deaths = +d.deaths;
    });

    const scenes = [
        { title: "Total Cases Over Time", render: renderTotalCases },
        { title: "Total Deaths Over Time", render: renderTotalDeaths },
        { title: "Cases vs. Deaths Comparison", render: renderComparison }
    ];

    let currentSceneIndex = 0;

    function renderScene(index) {
        d3.select("#content").html("");
        scenes[index].render(data);
    }

    document.getElementById("prev").addEventListener("click", () => {
        if (currentSceneIndex > 0) {
            currentSceneIndex--;
            renderScene(currentSceneIndex);
        }
    });

    document.getElementById("next").addEventListener("click", () => {
        if (currentSceneIndex < scenes.length - 1) {
            currentSceneIndex++;
            renderScene(currentSceneIndex);
        }
    });

    renderScene(currentSceneIndex);
});
