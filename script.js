let dataScenes = [];
let currentScene = 0;

d3.csv("data.csv").then(data => {
    data.forEach(d => {
        d.cases = +d.cases;
        d.deaths = +d.deaths;
        d.date = new Date(d.date);
    });

    dataScenes.push(data.map(d => d.cases));
    dataScenes.push(data.map(d => d.deaths));
    dataScenes.push(data.map((d, i) => ({ index: i, cases: d.cases, deaths: d.deaths })));

    renderScene(currentScene);
});

function renderScene(sceneIndex) {
    const svg = d3.select("#visualization").html("").append("svg")
        .attr("width", 400)
        .attr("height", 200);

    const data = dataScenes[sceneIndex];

    const x = d3.scaleBand()
        .domain(data.map((d, i) => i))
        .range([0, 400])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data)])
        .range([200, 0]);

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", (d, i) => x(i))
        .attr("y", d => y(d))
        .attr("width", x.bandwidth())
        .attr("height", d => 200 - y(d));

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
        .text(sceneIndex === 0 ? "Total Cases" : sceneIndex === 1 ? "Total Deaths" : "Counts");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 10)
        .attr("x", 0 - (200 / 2))
        .attr("text-anchor", "middle")
        .text(sceneIndex === 0 || sceneIndex === 1 ? "Counts" : "Counts");
}

document.getElementById("nextButton").onclick = function() {
    currentScene = (currentScene + 1) % dataScenes.length;
    renderScene(currentScene);
    document.getElementById("prevButton").style.display = currentScene === 0 ? "none" : "inline";
};

document.getElementById("prevButton").onclick = function() {
    currentScene = (currentScene - 1 + dataScenes.length) % dataScenes.length;
    renderScene(currentScene);
    document.getElementById("prevButton").style.display = currentScene === 0 ? "none" : "inline";
};
