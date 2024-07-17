d3.csv("us-states.csv").then(data => {
    data.forEach(d => {
        d.date = d3.timeParse("%m/%d/%Y")(d.date);
        d.cases = +d.cases; 
        d.deaths = +d.deaths; 
    });

    let currentScene = 0;

    const scenes = [
        {
            title: "Total Cases Over Time",
            render: () => renderLineChart(data, "cases", "Total Cases", "steelblue")
        },
        {
            title: "Total Deaths Over Time",
            render: () => renderLineChart(data, "deaths", "Total Deaths", "red")
        },
        {
            title: "Comparison of Cases and Deaths",
            render: () => renderComparison(data)
        }
    ];

    renderScene();

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

    function renderScene() {
        d3.select("#visualization").html("");
        scenes[currentScene].render();
        document.getElementById("prevButton").style.display = currentScene === 0 ? "none" : "inline";
        document.getElementById("nextButton").style.display = currentScene === scenes.length - 1 ? "none" : "inline";
        d3.select("#visualization")
            .append("h2")
            .text(scenes[currentScene].title);
    }

    function renderLineChart(data, type, title, color) {
        const svg = setupSVG();
        const x = d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .range([0, svg.width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d[type])])
            .range([svg.height, 0]);

        svg.append("g")
            .attr("transform", `translate(0,${svg.height})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .call(d3.axisLeft(y));

        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", svg.width)
            .attr("y", svg.height + 30)
            .text("Date");

        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -40)
            .text(title);

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(d => x(d.date))
                .y(d => y(d[type]))
            );
    }

    function renderComparison(data) {
        const svg = setupSVG();
        const x = d3.scaleBand()
            .domain(data.map(d => d.date))
            .range([0, svg.width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => Math.max(d.cases, d.deaths))])
            .range([svg.height, 0]);

        svg.append("g")
            .attr("transform", `translate(0,${svg.height})`)
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m/%d/%Y")));

        svg.append("g")
            .call(d3.axisLeft(y));

        svg.selectAll(".bar.cases")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar cases")
            .attr("x", d => x(d.date))
            .attr("y", d => y(d.cases))
            .attr("width", x.bandwidth() / 2)
            .attr("height", d => svg.height - y(d.cases))
            .attr("fill", "steelblue");

        svg.selectAll(".bar.deaths")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar deaths")
            .attr("x", d => x(d.date) + x.bandwidth() / 2)
            .attr("y", d => y(d.deaths))
            .attr("width", x.bandwidth() / 2)
            .attr("height", d => svg.height - y(d.deaths))
            .attr("fill", "red");
    }

    function setupSVG() {
        const svg = d3.select("#visualization").append("svg").attr("width", 800).attr("height", 400);
        const margin = { top: 20, right: 30, bottom: 40, left: 60 };
        const width = +svg.attr("width") - margin.left - margin.right;
        const height = +svg.attr("height") - margin.top - margin.bottom;

        return {
            svg: svg,
            width: width,
            height: height,
            margin: margin
        };
    }
});
