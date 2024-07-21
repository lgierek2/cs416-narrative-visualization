const scenes = [
    { title: "Total Cases Over Time", render: renderTotalCases },
    { title: "Total Deaths Over Time", render: renderTotalDeaths },
    { title: "Cases vs. Deaths Comparison", render: renderComparison }
];

let currentSceneIndex = 0;

d3.csv("https://raw.githubusercontent.com/lgierek2/cs416-narrative-visualization/main/us-states.csv");


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
}

function renderTotalDeaths(data) {
    const svg = d3.select("#content").append("svg").attr("width", 800).attr("height", 500);
}

function renderComparison(data) {
    const svg = d3.select("#content").append("svg").attr("width", 800).attr("height", 500);
}
