// Adjust these URLs to your actual data paths
const dataURL = 'https://raw.githubusercontent.com/lgierek2/cs416-narrative-visualization/main/us-states.csv';
const mapURL = 'https://raw.githubusercontent.com/lgierek2/cs416-narrative-visualization/main/us-map.topojson';

// Function to handle slide changes
function changeSlide(slideNumber) {
    // Hide all slides
    d3.selectAll(".slide").style("display", "none");

    // Show the selected slide
    d3.select(`#slide${slideNumber}`).style("display", "block");

    if (slideNumber === 1) {
        // Clear existing map content
        d3.select("#map").html("");

        // Render the map
        renderMap();

        // Load and render the heatmap
        d3.csv(dataURL).then(function(data) {
            data.forEach(d => {
                d.cases = +d.cases;
            });

            const width = 800;
            const height = 600;
            const margin = { top: 20, right: 20, bottom: 60, left: 70 };

            const x = d3.scaleBand()
                .domain(data.map(d => d.state).sort())
                .range([margin.left, width - margin.right])
                .padding(0.1);

            const y = d3.scaleBand()
                .domain(["Cases"])
                .range([height - margin.bottom, margin.top])
                .padding(0.1);

            const colorScale = d3.scaleSequential(d3.interpolateReds)
                .domain([0, d3.max(data, d => d.cases)]);

            const svg = d3.select("#slide1")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

            svg.selectAll(".cell")
                .data(data)
                .enter().append("rect")
                .attr("class", "cell")
                .attr("x", d => x(d.state))
                .attr("y", y("Cases"))
                .attr("width", x.bandwidth())
                .attr("height", y.bandwidth())
                .style("fill", d => colorScale(d.cases))
                .on("mouseover", function(event, d) {
                    d3.select("#tooltip")
                        .style("opacity", 1)
                        .html(`State: ${d.state}<br>Cases: ${d.cases}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    d3.select("#tooltip").style("opacity", 0);
                });

            svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "end");

            svg.append("g")
                .attr("class", "y-axis")
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y).tickSize(0));

            svg.append("text")
                .attr("class", "x-axis-label")
                .attr("text-anchor", "middle")
                .attr("x", width / 2)
                .attr("y", height - margin.bottom + 40)
                .text("States");

            svg.append("text")
                .attr("class", "y-axis-label")
                .attr("text-anchor", "middle")
                .attr("transform", `translate(${margin.left / 2},${height / 2}) rotate(-90)`)
                .text("Number of Cases");

            const highestCasesState = data.reduce((max, d) => d.cases > max.cases ? d : max, data[0]);

            svg.append("text")
                .attr("x", x(highestCasesState.state) + x.bandwidth() / 2)
                .attr("y", y("Cases") - 10)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .text(`Highest Cases in ${highestCasesState.state}`);  

            // Add a color legend
            const legend = svg.append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${width - margin.right + 30}, ${margin.top})`);

            const legendScale = d3.scaleSequential(d3.interpolateReds)
                .domain([0, d3.max(data, d => d.cases)]);

            legend.selectAll("rect")
                .data(legendScale.ticks(10))
                .enter().append("rect")
                .attr("x", 0)
                .attr("y", (d, i) => i * 20)
                .attr("width", 20)
                .attr("height", 20)
                .style("fill", d => legendScale(d));

            legend.selectAll("text")
                .data(legendScale.ticks(10))
                .enter().append("text")
                .attr("x", 30)
                .attr("y", (d, i) => i * 20 + 15)
                .text(d => d);

            d3.select("#graphDescriptionText").text("Darker shades represent higher case numbers");
        });
    } else if (slideNumber === 2) {
        // Code for Slide 2
        d3.csv(dataURL).then(function(data) {
            // Parse data
            data.forEach(d => {
                d.date = new Date(d.date);
                d.cases = +d.cases;
                d.deaths = +d.deaths;
            });

            const margin = { top: 20, right: 20, bottom: 30, left: 50 };
            const width = 800 - margin.left - margin.right;
            const height = 500 - margin.top - margin.bottom;

            const svg = d3.select("#slide2").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.date))
                .range([0, width]);

            const yCases = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.cases)])
                .range([height, 0]);

            const yDeaths = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.deaths)])
                .range([height, 0]);

            svg.append("path")
                .datum(data)
                .attr("class", "line line-cases")
                .attr("d", d3.line()
                    .x(d => x(d.date))
                    .y(d => yCases(d.cases))
                );

            svg.append("path")
                .datum(data)
                .attr("class", "line line-deaths")
                .attr("d", d3.line()
                    .x(d => x(d.date))
                    .y(d => yDeaths(d.deaths))
                );

            svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x));

            svg.append("g")
                .attr("class", "y-axis")
                .call(d3.axisLeft(yCases));

            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height + margin.bottom - 10)
                .attr("text-anchor", "middle")
                .text("Date");

            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left)
                .attr("x", 0 - height / 2)
                .attr("dy", "1em")
                .attr("text-anchor", "middle")
                .text("Cases and Deaths");

            svg.append("text")
                .attr("x", width / 2)
                .attr("y", -10)
                .attr("text-anchor", "middle")
                .text("COVID-19 Cases and Deaths Over Time");

            // Add legend
            const legend = svg.append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${width - 150}, 0)`);

            legend.append("rect")
                .attr("width", 20)
                .attr("height", 20)
                .style("fill", "#1f77b4");

            legend.append("text")
                .attr("x", 30)
                .attr("y", 15)
                .text("Total Cases");

            legend.append("rect")
                .attr("width", 20)
                .attr("height", 20)
                .attr("y", 30)
                .style("fill", "#ff7f0e");

            legend.append("text")
                .attr("x", 30)
                .attr("y", 45)
                .text("Total Deaths");

        });
    } else if (slideNumber === 3) {
        // Code for Slide 3
        d3.csv(dataURL).then(function(data) {
            // Prepare data
            data.forEach(d => {
                d.cases = +d.cases;
                d.deaths = +d.deaths;
            });

            const margin = { top: 20, right: 20, bottom: 30, left: 50 };
            const width = 800 - margin.left - margin.right;
            const height = 500 - margin.top - margin.bottom;

            const svg = d3.select("#slide3").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            const x = d3.scaleBand()
                .domain(data.map(d => d.state))
                .range([0, width])
                .padding(0.1);

            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.cases)])
                .range([height, 0]);

            const colorScale = d3.scaleOrdinal()
                .domain(["cases", "deaths"])
                .range(["#1f77b4", "#ff7f0e"]);

            svg.selectAll(".bar.cases")
                .data(data)
                .enter().append("rect")
                .attr("class", "bar cases")
                .attr("x", d => x(d.state))
                .attr("y", d => y(d.cases))
                .attr("width", x.bandwidth() / 2)
                .attr("height", d => height - y(d.cases))
                .style("fill", colorScale("cases"));

            svg.selectAll(".bar.deaths")
                .data(data)
                .enter().append("rect")
                .attr("class", "bar deaths")
                .attr("x", d => x(d.state) + x.bandwidth() / 2)
                .attr("y", d => y(d.deaths))
                .attr("width", x.bandwidth() / 2)
                .attr("height", d => height - y(d.deaths))
                .style("fill", colorScale("deaths"));

            svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x).tickSize(0))
                .selectAll("text")
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "end");

            svg.append("g")
                .attr("class", "y-axis")
                .call(d3.axisLeft(y));

            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height + margin.bottom - 10)
                .attr("text-anchor", "middle")
                .text("States");

            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left)
                .attr("x", 0 - height / 2)
                .attr("dy", "1em")
                .attr("text-anchor", "middle")
                .text("Number of Cases/Deaths");

            // Add legend for bar colors
            const legend = svg.append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${width - 150}, 0)`);

            legend.selectAll("rect")
                .data(["cases", "deaths"])
                .enter().append("rect")
                .attr("width", 20)
                .attr("height", 20)
                .attr("y", (d, i) => i * 25)
                .style("fill", d => colorScale(d));

            legend.selectAll("text")
                .data(["Cases", "Deaths"])
                .enter().append("text")
                .attr("x", 30)
                .attr("y", (d, i) => i * 25 + 15)
                .text(d => d);

        });
    }
}

// Function to render the map
function renderMap() {
    // Clear existing map content
    d3.select("#map").html("");

    // Set up the dimensions and

// Function to render the map
function renderMap() {
    const width = 960;
    const height = 600;

    // Create SVG element for the map
    const svg = d3.select("#map").append("svg")
        .attr("width", width)
        .attr("height", height);

    // Load the map and data
    d3.json(mapURL).then(function(us) {
        const projection = d3.geoAlbersUsa()
            .scale(1000)
            .translate([width / 2, height / 2]);

        const path = d3.geoPath().projection(projection);

        // Draw the states
        svg.append("g")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("d", path)
            .attr("class", "state");

        // Load and render the heatmap data
        d3.csv(dataURL).then(function(data) {
            // Aggregate cases by state
            const casesByState = d3.rollup(data, v => d3.sum(v, d => +d.cases), d => d.state);
            const colorScale = d3.scaleSequential(d3.interpolateReds)
                .domain([0, d3.max(Array.from(casesByState.values()))]);

            svg.selectAll("path")
                .style("fill", d => colorScale(casesByState.get(d.properties.name) || 0))
                .style("stroke", "#fff")
                .style("stroke-width", "1px");

            // Add tooltips
            svg.selectAll("path")
                .on("mouseover", function(event, d) {
                    const state = d.properties.name;
                    const cases = casesByState.get(state) || 0;
                    d3.select("#tooltip")
                        .style("opacity", 1)
                        .html(`State: ${state}<br>Cases: ${cases}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    d3.select("#tooltip").style("opacity", 0);
                });
        });
    });
}

// Function to update state dropdown
function updateState() {
    const selectedState = d3.select("#stateDropdown").property("value");
    if (selectedState) {
        // Filter and update data for selected state
        d3.csv(dataURL).then(function(data) {
            data = data.filter(d => d.state === selectedState);
            // Update charts with filtered data
            // (You can add specific code here to update Slide 2 and Slide 3 based on selected state)
        });
    }
}

// Function to move to the next slide
function nextSlide() {
    const currentSlide = d3.select(".slide.active");
    const currentSlideId = parseInt(currentSlide.attr("id").replace("slide", ""));
    const nextSlideId = (currentSlideId % 3) + 1; // Assuming 3 slides
    changeSlide(nextSlideId);
}

// Initial setup: show the first slide
changeSlide(1);}
