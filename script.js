let data = [];
let currentScene = 0;

d3.csv("data.csv").then(csvData => {
    data = csvData.map(d => ({
        date: new Date(d.date),
        cases: +d.cases,
        deaths: +d.deaths
    }));

    renderScene(currentScene);
});

function renderScene(sceneIndex) {
    const svg = d3.select("#visualization").html("").append("svg")
        .attr("width", 400)
        .attr("height", 200);

    let sceneData;
    let yLabel;

    switch (sceneIndex) {
        case 0:
            sceneData = data.map(d => d.cases); // Total cases
            yLabel = "Total Cases";
            break;
        case 1:
            sceneData = data.map(d => d.deaths); // Total deaths
            yLabel = "Total Deaths";
            break;
        case 2:
            sceneData = data.map((d, i) => ({ index: i, cases: d.cases, deaths: d.deaths })); // Comparison
            yLabel = "Counts";
            break;
    }

    const x = d3.scaleBand()
        .domain(sceneData.map((_, i) => i))
        .range([0, 400])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(sceneData)])
        .range([200, 0]);

    svg.selectAll(".bar")
        .data(sceneData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", (d, i) => x(i))
        .attr("y", d => y(d))
        .attr("width", x.bandwidth())
        .attr("height", d => 200 - y(d))
        .attr("fill", "steelblue");

    svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + 200 + ")")
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("x", 200)
        .attr("y", 220)
        .attr("text-anchor", "middle")
        .text(yLabel);

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 10)
        .attr("x", 0 - (200 / 2))
        .attr("text-anchor", "middle")
        .text("Counts");
}

document.getElementById("nextButton").onclick = function() {
    currentScene = (currentScene + 1) % 3;
    renderScene(currentScene);
    document.getElementById("prevButton").style.display = currentScene === 0 ? "none" : "inline";
};

document.getElementById("prevButton").onclick = function() {
    currentScene = (currentScene - 1 + 3) % 3;
    renderScene(currentScene);
    document.getElementById("prevButton").style.display = currentScene === 0 ? "none" : "inline";
};

renderScene(currentScene);
