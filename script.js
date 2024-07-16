const svg = d3.select("#visualization").append("svg")
    .attr("width", 800)
    .attr("height", 600);

let currentScene = 0;

const scenes = [
    createScene1,
    createScene2,
    createScene3
];

d3.csv("data.csv").then(data => {
    data.forEach(d => {
        d.date = new Date(d.date);
        d.cases = +d.cases;
        d.deaths = +d.deaths;
    });

    scenes[currentScene](data);
});

function createScene1(data) {
    svg.selectAll("*").remove();

    const casesByState = d3.rollup(data, v => d3.sum(v, d => d.cases), d => d.state);
    const sortedData = Array.from(casesByState).sort((a, b) => d3.descending(a[1], b[1]));
    const states = sortedData.map(d => d[0]);
    const cases = sortedData.map(d => d[1]);

    const x = d3.scaleBand().domain(states).range([0, 800]).padding(0.1);
    const y = d3.scaleLinear().domain([0, d3.max(cases)]).nice().range([600, 0]);

    svg.selectAll(".bar")
        .data(sortedData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d[0]))
        .attr("y", d => y(d[1]))
        .attr("width", x.bandwidth())
        .attr("height", d => 600 - y(d[1]))
        .attr("fill", "steelblue");

    const annotations = [
        {
            note: { label: "State with highest cases" },
            x: x(sortedData[0][0]) + x.bandwidth() / 2,
            y: y(sortedData[0][1]),
            dy: -50,
            dx: 50
        }
    ];

    const makeAnnotations = d3.annotation()
        .annotations(annotations);

    svg.append("g")
        .call(makeAnnotations);
}

function createScene2(data) {
    svg.selectAll("*").remove();

    const x = d3.scaleLinear().domain([0, d3.max(data, d => d.cases)]).range([0, 800]);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.deaths)]).range([600, 0]);

    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.cases))
        .attr("cy", d => y(d.deaths))
        .attr("r", 5)
        .attr("fill", "steelblue");

    const annotations = [
        {
            note: { label: "Example point" },
            x: x(data[10].cases),
            y: y(data[10].deaths),
            dy: -30,
            dx: 30
        }
    ];

    const makeAnnotations = d3.annotation()
        .annotations(annotations);

    svg.append("g")
        .call(makeAnnotations);
}

function createScene3(data) {
    svg.selectAll("*").remove();

    const stateData = data.filter(d => d.state === "New York");
    const x = d3.scaleTime().domain(d3.extent(stateData, d => d.date)).range([0, 800]);
    const y = d3.scaleLinear().domain([0, d3.max(stateData, d => d.cases)]).range([600, 0]);

    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.cases));

    svg.append("path")
        .datum(stateData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line);

    const annotations = [
        {
            note: { label: "Trend line" },
            x: x(stateData[Math.floor(stateData.length / 2)].date),
            y: y(stateData[Math.floor(stateData.length / 2)].cases),
            dy: -50,
            dx: 50
        }
    ];

    const makeAnnotations = d3.annotation()
        .annotations(annotations);

    svg.append("g")
        .call(makeAnnotations);
}

d3.select("#nextButton").on("click", function() {
    currentScene = (currentScene + 1) % scenes.length;
    d3.csv("data.csv").then(data => {
        data.forEach(d => {
            d.date = new Date(d.date);
            d.cases = +d.cases;
            d.deaths = +d.deaths;
        });
        scenes[currentScene](data);
    });
});
