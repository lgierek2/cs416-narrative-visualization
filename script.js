function renderScene(sceneIndex) {
    const svg = d3.select("#visualization").html("").append("svg")
        .attr("width", 400)
        .attr("height", 200);

    let currentData;

    if (sceneIndex === 0) {
        currentData = data.map(d => +d.cases); // Total cases
        console.log("First 5 Cases:", data.slice(0, 5)); // Log first 5 rows
    } else if (sceneIndex === 1) {
        currentData = data.map(d => +d.deaths); // Total deaths
        console.log("First 5 Deaths:", data.slice(0, 5)); // Log first 5 rows
    } else {
        currentData = data.map(d => +d.cases + +d.deaths); // Counts
        console.log("First 5 Counts:", data.slice(0, 5)); // Log first 5 rows
    }

    const yLabel = sceneLabels[sceneIndex];

    const x = d3.scaleBand()
        .domain(currentData.map((_, i) => i))
        .range([0, 400])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(currentData)])
        .range([200, 0]);

    svg.selectAll(".bar")
        .data(currentData)
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
