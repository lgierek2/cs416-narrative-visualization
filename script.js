// Load the data
d3.csv("https://raw.githubusercontent.com/lgierek2/cs416-narrative-visualization/main/us-states.csv").then(data => {
    // Parse the data
    data.forEach(d => {
        d.date = d3.timeParse("%m/%d/%Y")(d.date); // Parse date
        d.cases = +d.cases; // Convert cases to number
        d.deaths = +d.deaths; // Convert deaths to number
    });

    let currentScene = 0;

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

    function renderScene() {
        // Clear the visualization area
        d3.select("#visualization").html("");

        // Render the current scene
        scenes[currentScene].render();

        // Update button visibility
        document.getElementById("prevButton").style.display = currentScene === 0 ? "none" : "inline";
        document.getElementById("nextButton").style.display = currentScene === scenes.length - 1 ? "none" : "inline";

        // Add title
        d3.select("#visualization")
            .append("h2")
            .text(scenes[currentScene].title);
    }

    function renderTotalCases(data) {
        const svg = d3.select("#visualization").append("svg").attr("width", 800).attr("height", 400);
        const margin = { top: 20, right: 30, bottom: 40, left: 60 };
        const width = +svg.attr("width") - margin.left - margin.right;
        const height = +svg.attr("height") - margin.top - margin.bottom;

        const x = d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.cases)])
            .range([height - margin.bottom, margin.top]);

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width - margin.right)
            .attr("y", height - margin.bottom + 30)
            .text("Date");

        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", margin.left - 40)
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

    function renderTotalDeaths(data) {
        const svg = d3.select("#visualization").append("svg").attr("width", 800).attr("height", 400);
        const margin = { top: 20, right: 30, bottom: 40, left: 60 };
        const width = +svg.attr("width") - margin.left - margin.right;
        const height = +svg.attr("height") - margin.top - margin.bottom;

        const x = d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.deaths)])
            .range([height - margin.bottom, margin.top]);

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width - margin.right)
            .attr("y", height - margin.bottom + 30)
            .text("Date");

        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", margin.left - 40)
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
        const svg = d3.select("#visualization").append("svg").attr("width", 800).attr("height", 400);
        const margin = { top: 20, right: 30, bottom: 40, left: 60 };
        const width = +svg.attr("width") - margin.left - margin.right;
        const height = +svg.attr("height") - margin.top - margin.bottom;

        const x = d3.scaleBand()
            .domain(data.map(d => d.date))
            .range([margin.left, width - margin.right])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => Math.max(d.cases, d.deaths))])
            .range([height - margin.bottom, margin.top]);

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m/%d/%Y")));

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width - margin.right)
            .attr("y", height - margin.bottom + 30)
            .text("Date");

        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", margin.left - 40)
            .attr("x", -margin.top)
            .text("Count");

        svg.selectAll(".bar.cases")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar cases")
            .attr("x", d => x(d.date))
            .attr("y", d => y(d.cases))
            .attr("width", x.bandwidth() / 2)
            .attr("height", d => height - margin.bottom - y(d.cases))
            .attr("fill", "steelblue");

        svg.selectAll(".bar.deaths")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar deaths")
            .attr("x", d => x(d.date) + x.bandwidth() / 2)
            .attr("y", d => y(d.deaths))
            .attr("width", x.bandwidth() / 2)
            .attr("height", d => height - margin.bottom - y(d.deaths))
            .attr("fill", "red");
    }
});
