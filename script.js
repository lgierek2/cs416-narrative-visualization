var currentSlide = 1;
var margin = { top: 50, right: 150, bottom: 120, left: 150 };
const width = 1900 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;
const dataURL = "https://raw.githubusercontent.com/lgierek2/cs416-narrative-visualization/main/us-states.csv";
const yAxisLabels = [
    "Heatmap of Cases",
    "Total Cases and Deaths Over Time",
    "Detailed State Comparison"
];
let data = [];
const svg = d3.select("#myData")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
d3.csv(dataURL).then(function(csvData) {
    data = csvData;
    data.forEach(d => {
        d.date = new Date(d.date);
        d.cases = +d.cases;
        d.deaths = +d.deaths;
    });
    const states = Array.from(new Set(data.map(d => d.state))).sort();
    const dropdown = d3.select("#stateDropdown");
    states.forEach(state => {
        dropdown.append("option")
            .attr("value", state)
            .text(state);
    });
    renderSlide(currentSlide);
});
function renderSlide(slideNumber) {
    d3.select("#myData svg").remove();
    const svg = d3.select("#myData")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    if (slideNumber === 1) {
        d3.csv(dataURL).then(function(data) {
            data.forEach(d => {
                d.cases = +d.cases;  
            });

            const x = d3.scaleBand()
                .domain(data.map(d => d.state).sort())  
                .range([0, width])
                .padding(0.1);

            const y = d3.scaleBand()
                .domain(["Cases"])  
                .range([height, 0])
                .padding(0.1);

            const colorScale = d3.scaleSequential(d3.interpolateReds)
                .domain([0, d3.max(data, d => d.cases)]);

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
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "end");

            svg.append("g")
                .attr("class", "y-axis")
                .call(d3.axisLeft(y).tickSize(0));

            svg.append("text")
                .attr("class", "x-axis-label")
                .attr("text-anchor", "middle")
                .attr("x", width / 2)
                .attr("y", height + margin.bottom - 10)
                .text("States");    
            
            svg.append("text")
                .attr("class", "y-axis-label")
                .attr("text-anchor", "middle")
                .attr("transform", `translate(${-margin.left / 2},${height / 2}) rotate(-90)`)
                .text("Number of Cases");
            
            const highestCasesState = data.reduce((max, d) => d.cases > max.cases ? d : max, data[0]);

            svg.append("text")
                .attr("x", x(highestCasesState.state) + x.bandwidth() / 2)
                .attr("y", y("Cases") - 10)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .text(`Highest Cases in ${highestCasesState.state}`);  

            svg.append("text")
                .attr("x", 1700)
                .attr("y", 0)
                .style("font-size", "12px")
                .text("Darker shades represent higher case numbers");

            const legend = svg.append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${width + 30},0)`);

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
            d3.select("#graphDescriptionText").text(yAxisLabels[slideNumber - 1]);
        });
    } else if (slideNumber === 2) {
        const x = d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .range([0, width]);
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => Math.max(d.cases, d.deaths))])
            .nice()
            .range([height, 0]);
        const lineCases = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.cases));
        const lineDeaths = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.deaths));
        svg.append("path")
            .datum(data)
            .attr("class", "line line-cases")
            .attr("d", lineCases)
            .style("stroke", "blue")
            .on("mouseover", function(event, d) {
            })
            .on("mousemove", function(event) {
                const mouseDate = x.invert(d3.pointer(event)[0]);
                const closestData = data.reduce((prev, curr) => {
                    return Math.abs(curr.date - mouseDate) < Math.abs(prev.date - mouseDate) ? curr : prev;
                });
                d3.select("#tooltip")
                    .style("opacity", 1)
                    .html(`Date: ${d3.timeFormat("%Y-%m-%d")(closestData.date)}<br>Cases: ${closestData.cases}<br>Deaths: ${closestData.deaths}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                d3.select("#tooltip").style("opacity", 0);
            });
        svg.append("path")
            .datum(data)
            .attr("class", "line line-deaths")
            .attr("d", lineDeaths)
            .style("stroke", "red")
            .on("mouseover", function(event, d) {
            })
            .on("mousemove", function(event) {
                const mouseDate = x.invert(d3.pointer(event)[0]);
                const closestData = data.reduce((prev, curr) => {
                    return Math.abs(curr.date - mouseDate) < Math.abs(prev.date - mouseDate) ? curr : prev;
                });
                d3.select("#tooltip")
                    .style("opacity", 1)
                    .html(`Date: ${d3.timeFormat("%Y-%m-%d")(closestData.date)}<br>Cases: ${closestData.cases}<br>Deaths: ${closestData.deaths}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                d3.select("#tooltip").style("opacity", 0);
            });
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));
        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y));
        svg.append("text")
            .attr("class", "x-axis-label")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .text("Date");

        svg.append("text")
            .attr("class", "y-axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(${-margin.left / 2},${height / 2}) rotate(-90)`)
            .text("Number of Cases/Deaths");

        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width - 150},10)`);

        legend.append("rect")
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", "blue");
        legend.append("text")
            .attr("x", 30)
            .attr("y", 15)
            .text("Cases");
        legend.append("rect")
            .attr("y", 30)
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", "red");
        legend.append("text")
            .attr("x", 30)
            .attr("y", 45)
            .text("Deaths");

        svg.append("line")
            .attr("x1", x(new Date('2020-03-13')))
            .attr("x2", x(new Date('2020-03-13')))
            .attr("y1", 0)
            .attr("y2", height)
            .style("stroke", "black")
            .style("stroke-dasharray", "4");
         svg.append("text")
            .attr("x", x(new Date('2020-03-13')))
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text("U.S. declares National Emergency - March 2020");

        svg.append("line")
            .attr("x1", x(new Date('2020-12-24')))
            .attr("x2", x(new Date('2020-12-24')))
            .attr("y1", 0)
            .attr("y2", height)
            .style("stroke", "black")
            .style("stroke-dasharray", "4");
         svg.append("text")
            .attr("x", x(new Date('2020-12-24')))
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text("1M U.S. Citizens Vaccinated");

        svg.append("line")
            .attr("x1", x(new Date('2021-12-01')))
            .attr("x2", x(new Date('2021-12-01')))
            .attr("y1", 0)
            .attr("y2", height)
            .style("stroke", "black")
            .style("stroke-dasharray", "4");
         svg.append("text")
            .attr("x", x(new Date('2021-12-01')))
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text("New COVID Variant in U.S.");

        svg.append("line")
            .attr("x1", x(new Date('2021-02-01')))
            .attr("x2", x(new Date('2021-02-01')))
            .attr("y1", height)
            .attr("y2", height-25)
            .style("stroke", "black")
            .style("stroke-dasharray", "4");
         svg.append("text")
            .attr("x", x(new Date('2021-02-01')))
            .attr("y", 25)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Federal Mask Mandate");
        
        svg.append("line")
            .attr("x1", x(new Date('2022-04-27')))
            .attr("x2", x(new Date('2022-04-27')))
            .attr("y1", 0)
            .attr("y2", height)
            .style("stroke", "black")
            .style("stroke-dasharray", "4");
         svg.append("text")
            .attr("x", x(new Date('2022-04-27')))
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Federal Mask Mandate ends");
        d3.select("#graphDescriptionText").text(yAxisLabels[slideNumber - 1]);
    }   
else if (slideNumber === 3) {
        const statesSorted = Array.from(new Set(data.map(d => d.state))).sort();
        const x = d3.scaleBand()
            .domain(statesSorted)
            .range([0, width])
            .padding(0.1);
        const y = d3.scaleLog()
            .domain([1, d3.max(data, d => Math.max(d.cases, d.deaths))])
            .nice()
            .range([height, 0]);
        svg.selectAll(".bar-cases")
        .data(data.filter(d => statesSorted.includes(d.state))) 
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.state))
            .attr("y", d => y(d.cases))
            .attr("width", x.bandwidth() / 2)
            .attr("height", d => height - y(d.cases))
            .style("fill", "blue")
            .on("mouseover", function(event, d) {
                d3.select("#tooltip")
                    .style("opacity", 1)
                    .html(`State: ${d.state}<br>Cases: ${d.cases}<br>Deaths: ${d.deaths}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                d3.select("#tooltip").style("opacity", 0);
            });
        svg.selectAll(".bar-deaths")
            .data(data.filter(d => statesSorted.includes(d.state)))
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.state) + x.bandwidth() / 2)
            .attr("y", d => y(d.deaths))
            .attr("width", x.bandwidth() / 2)
            .attr("height", d => height - y(d.deaths))
            .style("fill", "red")
            .on("mouseover", function(event, d) {
                d3.select("#tooltip")
                    .style("opacity", 1)
                    .html(`State: ${d.state}<br>Cases: ${d.cases}<br>Deaths: ${d.deaths}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                d3.select("#tooltip").style("opacity", 0);
            });
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");
        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y));
        svg.append("text")
            .attr("class", "x-axis-label")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .text("States");

        svg.append("text")
            .attr("class", "y-axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(${-margin.left / 2},${height / 2}) rotate(-90)`)
            .text("Number of Cases/Deaths");
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width - 150},10)`);
        legend.append("rect")
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", "blue");
        legend.append("text")
            .attr("x", 30)
            .attr("y", 15)
            .text("Cases");
        legend.append("rect")
            .attr("y", 30)
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", "red");
        legend.append("text")
            .attr("x", 30)
            .attr("y", 45)
            .text("Deaths");

        const lowestCasesState = data.reduce((min, d) => d.cases < min.cases ? d : min, data[0]);
        svg.append("text")
           .attr("x", x(lowestCasesState.state) + x.bandwidth() / 4)
           .attr("y", y(lowestCasesState.cases) - 10)
           .attr("text-anchor", "middle")
           .style("font-size", "12px")
           .style("font-weight", "bold")
           .text("Lowest Total Cases");

        d3.select("#graphDescriptionText").text(yAxisLabels[slideNumber - 1]);
    }
}
function updateState() {
    const selectedState = document.getElementById("stateDropdown").value;
    d3.csv(dataURL).then(function(csvData) {
        data = csvData.filter(d => d.state === selectedState || selectedState === "");
        data.forEach(d => {
            d.date = new Date(d.date);
            d.cases = +d.cases;
            d.deaths = +d.deaths;
        });
        renderSlide(currentSlide);
    });
}
function changeSlide(slideNumber) {
    currentSlide = slideNumber;
    renderSlide(slideNumber);
}
function nextSlide() {
    currentSlide = (currentSlide % 3) + 1;
    renderSlide(currentSlide);
};
