const width = 960;
const height = 600;

const svg = d3.select("body").append("svg")
    .attr("viewBox", [0, 0, width, height]);

const tooltip = d3.select("#tooltip");

// 颜色比例尺
const colorScale = d3.scaleThreshold()
    .domain([100, 500, 1000, 1500, 2000])
    .range(["#f7fbff", "#c6dbef", "#6baed6", "#3182bd", "#08519c", "#08306b"]);



Promise.all([
    d3.json("../data/world.json"),
    d3.csv("../data/average_papers_per_country.csv")  // CSV文件中为Country和Papers字段
]).then(([geoData, paperData]) => {
    // 创建国家名称 => 发文量的映射表
    const paperMap = {};
    paperData.forEach(d => {
        paperMap[d.Country.trim()] = +d.Papers;
    });

    // 添加发文量到每个国家的属性中
    geoData.features.forEach(feature => {
        const countryName = feature.properties.NAME;
        feature.properties.papers = paperMap[countryName] || 0;
    });

    const projection = d3.geoNaturalEarth1()
        .scale(160)
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    svg.selectAll("path")
        .data(geoData.features)
        .join("path")
        .attr("class", "country")
        .attr("fill", d => colorScale(d.properties.papers))
        .attr("d", path)
        .on("mouseover", (event, d) => {
            tooltip.style("display", "block")
                .html(`<strong>${d.properties.NAME}</strong><br/>Papers: ${d.properties.papers}`);
        })
        .on("mousemove", (event) => {
            // 获取视窗宽高
            const tooltipWidth = tooltip.node().offsetWidth;
            const tooltipHeight = tooltip.node().offsetHeight;
            const pageWidth = window.innerWidth;
            const pageHeight = window.innerHeight;

            let x = event.clientX + 10;
            let y = event.clientY - 20;

            // 限制 tooltip 不超出右边界
            if (x + tooltipWidth > pageWidth) {
                x = event.clientX - tooltipWidth - 10;
            }
            // 限制 tooltip 不超出顶部边界
            if (y < 0) {
                y = event.clientY + 20;
            }

            tooltip.style("left", x + "px")
                .style("top", y + "px");
        })
        .on("mouseout", () => tooltip.style("display", "none"));
});
// 颜色条尺寸和位置
const legendWidth = 20;
const legendHeight = 150;
const legendX = width - 80;  // 放在SVG右侧
const legendY = 50;

// 创建一个线性渐变（gradient）用于颜色条
const defs = svg.append("defs");

const linearGradient = defs.append("linearGradient")
    .attr("id", "legend-gradient")
    .attr("x1", "0%").attr("y1", "100%")  // 从下往上
    .attr("x2", "0%").attr("y2", "0%");

// 设置渐变的颜色点，和 colorScale.range() 对应
colorScale.range().forEach((color, i) => {
    linearGradient.append("stop")
        .attr("offset", `${(i / (colorScale.range().length - 1)) * 100}%`)
        .attr("stop-color", color);
});

// 绘制颜色条矩形
svg.append("rect")
    .attr("x", legendX)
    .attr("y", legendY)
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#legend-gradient)")
    .style("stroke", "#000")
    .style("stroke-width", 0.5);

// 创建一个线性比例尺，用来映射颜色条上的坐标到数据值
const legendScale = d3.scaleLinear()
    .domain([colorScale.domain()[0], colorScale.domain()[colorScale.domain().length - 1]])
    .range([legendHeight, 0]);

// 创建坐标轴（右侧纵轴）
const legendAxis = d3.axisRight(legendScale)
    .tickValues(colorScale.domain())  // 在阈值点显示刻度
    .tickFormat(d3.format(".0f"));    // 格式化数字

svg.append("g")
    .attr("class", "legend-axis")
    .attr("transform", `translate(${legendX + legendWidth}, ${legendY})`)
    .call(legendAxis);

