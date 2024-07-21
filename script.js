const scenes = [
    { title: "Total Cases Over Time", render: renderTotalCases },
    { title: "Total Deaths Over Time", render: renderTotalDeaths },
    { title: "Cases vs. Deaths Comparison", render: renderComparison }
];

let currentSceneIndex = 0;

d3.csv('https://raw.githubusercontent.com/lgierek2/cs416-narrative-visualization/main/us-states.csv').then(data => {
    // Preprocess data
    data.forEach(d => {
        d.date = new Date(d.date);
        d.cases = +d.cases;
        d.deaths = +d.deaths;
    });

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

function renderTotalCases(data) {
    const svg = d3.select("#content").append("svg").attr("width", 800).attr("height", 500);
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime().rangeRound([0, width]);
    const y = d3.scaleLinear().rangeRound([height, 0]);

    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.cases));

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
        .attr("d", line);

    // Add annotations
    const annotations = [
        {
            note: { label: "Highest point" },
            data: data.reduce((a, b) => (a.cases > b.cases ? a : b)),
            dy: -30,
            dx: -30
        }
    ];

    const makeAnnotations = d3.annotation()
        .annotations(annotations)
        .accessors({
            x: d => x(d.date),
            y: d => y(d.cases)
        });

    g.append("g")
        .call(makeAnnotations);
}

function renderTotalDeaths(data) {
    const svg = d3.select("#content").append("svg").attr("width", 800).attr("height", 500);
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime().rangeRound([0, width]);
    const y = d3.scaleLinear().rangeRound([height, 0]);

    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.deaths));

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
        .attr("d", line);

    // Add annotations
    const annotations = [
        {
            note: { label: "Highest point" },
            data: data.reduce((a, b) => (a.deaths > b.deaths ? a : b)),
            dy: -30,
            dx: -30
        }
    ];

    const makeAnnotations = d3.annotation()
        .annotations(annotations)
        .accessors({
            x: d => x(d.date),
            y: d => y(d.deaths)
        });

    g.append("g")
        .call(makeAnnotations);
}

function renderComparison(data) {
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

    // Add annotations
    const annotationsCases = [
        {
            note: { label: "Highest cases point" },
            data: data.reduce((a, b) => (a.cases > b.cases ? a : b)),
            dy: -30,
            dx: -30
        }
    ];

    const annotationsDeaths = [
        {
            note: { label: "Highest deaths point" },
            data: data.reduce((a, b) => (a.deaths > b.deaths ? a : b)),
            dy: -30,
            dx: -30
        }
    ];

    const makeAnnotations = d3.annotation()
        .annotations([...annotationsCases, ...annotationsDeaths])
        .accessors({
            x: d => x(d.date),
            y: d => y(d.cases || d.deaths)
        });

    g.append("g")
        .call(makeAnnotations);
}
