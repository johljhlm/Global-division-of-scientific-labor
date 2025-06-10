// 假设你的 HTML 中已有四个 div: #chart-2014, #chart-2015, #chart-2016, #chart-2017
d3.select("#node-info").style("display", "none").html("");
const width = 450;
const height = 400;
const projection = d3.geoMercator().scale(95).translate([width / 2, height / 1.5]);
const path = d3.geoPath().projection(projection);
let countriesPaths = {}; // 保存每年地图上的 path 元素
let rawDataBySubject = new Map(); // 按学科缓存所有数据
let currentSubject = "Botany"; // 默认选中学科

// 添加tooltip div
d3.select("body").append("div")
    .attr("id", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid #ddd")
    .style("border-radius", "4px")
    .style("padding", "8px")
    .style("pointer-events", "none")
    .style("font-size", "12px")
    .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)");

// 定义颜色比例尺（初始定义，会在每次切换学科时动态更新 domain）
const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
    .domain([-1, 1.5]);

// 初始化地图结构（只执行一次）
function initMap(containerId, countries) {
    // 添加加载提示
    const container = d3.select(`#${containerId}`);
    container.append("div")
        .attr("class", "loading-indicator")
        .text("正在加载地图...");

    const svg = container.append("svg")
        .style("width", "100%")
        .style("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`);

    countriesPaths[containerId] = svg.selectAll("path")
        .data(countries)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#eee")
        .attr("stroke", "#999")
        .attr("stroke-width", 0.5)
        .attr("data-name", d => d.properties.name || d.properties.ADMIN || "")
        .on("mouseover", function (event, d) {
            const countryName = d.properties.name || d.properties.ADMIN || "";
            const val = d3.select(this).attr("data-rca-val");
            d3.select("#tooltip")
                .style("opacity", 1)
                .html(`<strong>${countryName}</strong>${val ? `<br/>Log₁₀RCA: ${(+val).toFixed(2)}` : ""}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function (event) {
            d3.select("#tooltip")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            d3.select("#tooltip")
                .style("opacity", 0);
        });

    // 在所有路径加载完成后移除加载提示
    container.select(".loading-indicator").remove();
}
let legendCreated = false;

function createLegend(containerId, legendWidth = 250, legendHeight = 15) {
    const legendContainer = d3.select(`#${containerId}`)
        .style("position", "absolute")
        .style("Top", "260px")
        .style("right", "90px")
        .style("width", `${legendWidth}px`)
        .style("margin", "10px auto");

    legendContainer.append("div")
        .style("text-align", "center")
        .style("font-size", "12px")
        .style("margin-bottom", "5px")
        .text("Log₁₀ RCA指数");

    const gradientSvg = legendContainer.append("svg")
        .attr("width", legendWidth + 20)
        .attr("height", legendHeight + 25);

    // 添加 defs 和 linearGradient
    const defs = gradientSvg.append("defs");
    defs.append("linearGradient")
        .attr("id", `gradient-${containerId}`)
        .attr("x1", "0%").attr("x2", "100%")
        .attr("y1", "0%").attr("y2", "0%");

    // 添加矩形，绑定渐变填充
    gradientSvg.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("stroke", "#ccc")
        .style("stroke-width", "0.5px");

    // 添加坐标轴组
    gradientSvg.append("g")
        .attr("class", "legend-axis")
        .attr("transform", `translate(0, ${legendHeight})`);

    legendCreated = true;
}

function updateLegend(containerId, colorScale, minVal, maxVal, legendWidth = 250, legendHeight = 15) {
    const gradientId = `gradient-${containerId}`;
    const gradient = d3.select(`#${gradientId}`);

    // 更新渐变色
    gradient.selectAll("stop").remove(); // 先清空旧的stop
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", colorScale(minVal));
    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", colorScale(maxVal));

    // 更新矩形填充url
    d3.select(`#${containerId} svg rect`)
        .style("fill", `url(#${gradientId})`);

    // 更新比例尺和坐标轴
    const scale = d3.scaleLinear()
        .domain([minVal, maxVal])
        .range([0, legendWidth]);

    const axis = d3.axisBottom(scale).ticks(5).tickFormat(d3.format(".2f"));

    d3.select(`#${containerId} svg g.legend-axis`)
        .call(axis)
        .selectAll("text")
        .style("font-size", "12px");
}
// 更新某一张地图的颜色
function updateMapColors(containerId, dataForYear) {
    const rcaMap = new Map(dataForYear.map(d => [d.Country, Math.log10(+d.RCA_Specialty)]));

    // 更新颜色比例尺 domain
    const rcaValues = Array.from(rcaMap.values());
    const minVal = d3.min(rcaValues);
    const maxVal = d3.max(rcaValues);
    colorScale.domain([minVal, maxVal]);

    countriesPaths[containerId]
        .transition()
        .duration(500)
        .attr("fill", function (d) {
            const name = d.properties.name || d.properties.ADMIN || "";
            const val = rcaMap.get(name);
            d3.select(this).attr("data-rca-val", val != null ? val : "");
            return val != null ? colorScale(val) : "#eee";
        })
        .on("end", function () {
            // 在过渡完成后移除加载提示
            d3.select(`#${containerId} .loading-indicator`).remove();
        });
}

// 更新所有年份的地图
function updateAllMaps() {
    const yearList = [2014, 2015, 2016, 2017];
    let allRcaValues = [];

    yearList.forEach(year => {
        const data = rawDataBySubject.get(currentSubject)?.filter(d => +d.Year === year) || [];
        allRcaValues.push(...data.map(d => Math.log10(+d.RCA_Specialty)));
        updateMapColors(`chart-${year}`, data);
    });

    if (allRcaValues.length > 0) {
        const minVal = d3.min(allRcaValues);
        const maxVal = d3.max(allRcaValues);
        colorScale.domain([minVal, maxVal]);

        if (!legendCreated) {
            createLegend("color-legend");
        }
        updateLegend("color-legend", colorScale, minVal, maxVal);
    }
}

function drawAllMaps(countries, rawData) {
    // 缓存每个学科的数据
    const dataBySubject = d3.group(rawData, d => d.Specialty);
    dataBySubject.forEach((val, key) => {
        rawDataBySubject.set(key, val);
    });

    // 初始化地图（只做一次）
    [2014, 2015, 2016, 2017].forEach(year => {
        initMap(`chart-${year}`, countries);
    });

    updateAllMaps();

    // 学科选择框事件
    d3.select("#select-subject").on("change", function () {
        currentSubject = this.value;
        updateAllMaps();
    });
}

function drawGeographic() {
    // 只在首次加载时显示加载提示
    [2014, 2015, 2016, 2017].forEach(year => {
        d3.select(`#chart-${year}`)
            .append("div")
            .attr("class", "loading-indicator")
            .text("正在加载地图...");
    });

    // 加载数据并绘制地图
    Promise.all([
        d3.json("../data/world.json"),
        d3.csv("../data/ceo_geoo.csv")
    ]).then(([geoData, csvData]) => {
        drawAllMaps(geoData.features, csvData);
        // 数据加载完成后移除加载提示
        [2014, 2015, 2016, 2017].forEach(year => {
            d3.select(`#chart-${year} .loading-indicator`).remove();
        });
    }).catch(error => {
        console.error("Error loading data:", error);
        // 如果加载失败，显示错误信息
        [2014, 2015, 2016, 2017].forEach(year => {
            d3.select(`#chart-${year}`)
                .select(".loading-indicator")
                .text("地图加载失败，请刷新页面重试");
        });
    });
}
