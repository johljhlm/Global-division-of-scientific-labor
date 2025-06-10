const width = 960;
const height = 600;

const svg = d3.select("svg")
    .attr("viewBox", [0, 0, width, height]);

const tooltip = d3.select("#tooltip");

// 在地图容器中添加加载提示
d3.select("#map")
    .append("div")
    .attr("class", "loading-indicator")
    .text("正在加载地图...");

// 加载数据并绘制地图
Promise.all([
    d3.json("data/world.json"),
    d3.csv("data/average_papers_per_country.csv")
]).then(([geoData, paperData]) => {
    // 在地图加载完成后移除加载提示
    d3.select("#map .loading-indicator").remove();

    const paperMap = {};
    paperData.forEach(d => {
        paperMap[d.Country.trim()] = +d.Papers;
    });

    // 对数最大值（为 log10 变换做准备）
    const maxPapersRaw = d3.max(paperData, d => +d.Papers);
    const maxPapers = Math.log10(maxPapersRaw);

    // 对数颜色映射：log10(papers)
    const colorScale = d3.scaleSequential()
        .domain([maxPapers, 0])
        .interpolator(d3.interpolateViridis);

    geoData.features.forEach(feature => {
        const countryName = feature.properties.NAME;
        const rawValue = paperMap[countryName] || 0;
        feature.properties.papers = rawValue;
        feature.properties.logPapers = rawValue > 0 ? Math.log10(rawValue) : 0;
    });

    const projection = d3.geoNaturalEarth1()
        .scale(160)
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    svg.selectAll("path")
        .data(geoData.features)
        .join("path")
        .attr("class", "country")
        .attr("fill", d => colorScale(d.properties.logPapers))
        .attr("d", path)
        .on("mouseover", (event, d) => {
            tooltip.style("display", "block")
                .html(`<strong>${d.properties.NAME}</strong><br/>Papers: ${d.properties.papers}`);
        })
        .on("mousemove", (event) => {
            const tooltipWidth = tooltip.node().offsetWidth;
            const tooltipHeight = tooltip.node().offsetHeight;
            const pageWidth = window.innerWidth;
            const pageHeight = window.innerHeight;

            let x = event.clientX + 10;
            let y = event.clientY + 100;

            if (x + tooltipWidth > pageWidth) {
                x = event.clientX - tooltipWidth - 10;
            }
            if (y < 0) {
                y = event.clientY + 5;
            }

            tooltip.style("left", x + "px")
                .style("top", y + "px");
        })
        .on("mouseout", () => tooltip.style("display", "none"));

    // --- 添加 Legend ---
    const legendHeight = 200;
    const legendWidth = 20;
    const legendX = width - 80;
    const legendY = 50;

    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
        .attr("id", "legend-gradient")
        .attr("x1", "0%").attr("y1", "100%")
        .attr("x2", "0%").attr("y2", "0%");

    const nStops = 20;
    for (let i = 0; i <= nStops; i++) {
        const t = i / nStops;
        linearGradient.append("stop")
            .attr("offset", `${t * 100}%`)
            .attr("stop-color", colorScale(t * maxPapers));
    }

    svg.append("rect")
        .attr("x", legendX)
        .attr("y", legendY)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)")
        .style("stroke", "#000")
        .style("stroke-width", 0.5);

    const legendScale = d3.scaleLinear()
        .domain([0, maxPapers])
        .range([legendHeight, 0]);

    const legendAxis = d3.axisRight(legendScale)
        .ticks(6)
        .tickFormat(d => Math.round(Math.pow(10, d))); // 转换回原始论文数显示

    svg.append("g")
        .attr("class", "legend-axis")
        .attr("transform", `translate(${legendX + legendWidth}, ${legendY})`)
        .call(legendAxis);

    // 图例标题
    svg.append("text")
        .attr("x", legendX + legendWidth / 2)
        .attr("y", legendY - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Log₁₀ PublishedPapers");
}).catch(error => {
    console.error("Error loading data:", error);
    d3.select("#map .loading-indicator")
        .text("地图加载失败，请刷新页面重试");
});

// 在颜色更新完成后移除加载提示
function updateColors(year) {
    paths.transition()
        .duration(500)
        .attr("fill", d => {
            const val = paperMap[d.properties.name] ? Math.log10(paperMap[d.properties.name]) : null;
            return val ? colorScale(val) : "#eee";
        })
        .on("end", function () {
            // 在过渡完成后移除加载提示
            d3.select("#map .loading-indicator").remove();
        });
}
