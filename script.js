d3.csv("data.csv").then(data => {
    data.forEach(d => {
        d.date = new Date(d.date);
        d.case = +d.case;
        d.death = +d.death;
    });

    let currentScene = 0;

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

    function renderTotalCases(data) {
        const svg = d3.select("#visualization").append("svg").attr("width", 800).attr("height", 400);
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = +svg.attr("width") - margin.left - margin.right;
        const height = +svg.attr("height") - margin.top - margin.bottom;

        const x = d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.case)])
            .range([height - margin.bottom, margin.top]);

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(d => x(d.date))
                .y(d => y(d.case))
            );
    }

    function renderTotalDeaths(data) {
        const svg = d3.select("#visualization").append("svg").attr("width", 800).attr("height", 400);
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = +svg.attr("width") - margin.left - margin.right;
        const height = +svg.attr("height") - margin.top - margin.bottom;

        const x = d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.death)])
            .range([height - margin.bottom, margin.top]);

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(d => x(d.date))
                .y(d => y(d.death))
            );
    }

    function renderComparison(data) {
        const svg = d3.select("#visualization").append("svg").attr("width", 800).attr("height", 400);
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = +svg.attr("width") - margin.left - margin.right;
        const height = +svg.attr("height") - margin.top - margin.bottom;

        const x = d3.scaleBand()
            .domain(data.map(d => d.date))
            .range([margin.left, width - margin.right])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.case)])
            .range([height - margin.bottom, margin.top]);

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y-%m-%d")));

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        svg.selectAll(".bar.case")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar case")
            .attr("x", d => x(d.date))
            .attr("y", d => y(d.case))
            .attr("width", x.bandwidth() / 2)
            .attr("height", d => height - margin.bottom - y(d.case));

        svg.selectAll(".bar.death")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar death")
            .attr("x", d => x(d.date) + x.bandwidth() / 2)
            .attr("y", d => y(d.death))
            .attr("width", x.bandwidth() / 2)
            .attr("height", d => height - margin.bottom - y(d.death));
    }
});
