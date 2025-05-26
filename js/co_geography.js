// 这里假设使用 d3 v7，支持 Promise + async/await
(async function () {
    // 宽高设定，统一用
    const width = 500;
    const height = 350;

    // 地图投影
    const projection = d3.geoMercator()
        .scale(70)
        .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);




    // 读取数据
    const [world, data] = await Promise.all([
        d3.json("../data/world.json"),          // 地理json
        d3.csv("../data/RCA.csv")       // 数据csv
    ]);

    // 过滤只要Botany的部分（根据示例，若需要筛选不同Discipline可以调）
    const filteredData = data.filter(d => d.Discipline === "Biology" && d.Specialty === "Botany");

    // 找最大最小RCA_Specialty，用于颜色比例尺domain
    const rcaValues = filteredData.map(d => +d.RCA_Specialty);
    const maxRCA = d3.max(rcaValues);
    const minRCA = d3.min(rcaValues);
    // 颜色比例尺
    // const colorScale = d3.scaleSequential()
    //     .interpolator(d3.interpolateViridis)  // 新配色
    //     .clamp(true)
    //     .domain([minRCA, maxRCA]);
    const colorScale = d3.scaleLinear()
        .domain([minRCA, maxRCA])
        .range(["#e0f3dc", "#43a2ca"]); // 浅绿到深蓝


    // 将数据按年份分组，方便4张图使用
    const dataByYear = d3.group(filteredData, d => d.Year);

    // world.json 的处理：
    // 假设是GeoJSON格式，如果是TopoJSON，需转换：
    // const countries = topojson.feature(world, world.objects.countries).features;
    // 这里示例按GeoJSON
    const countries = world.features;
    function drawLegend(containerId, colorScale, minVal, maxVal) {
        const legendWidth = 140;
        const legendHeight = 20;

        const canvas = d3.select(`#${containerId}`)
            .append("canvas")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("width", legendWidth + "px")
            .style("height", legendHeight + "px");

        const ctx = canvas.node().getContext("2d");

        // 画渐变色条
        const image = ctx.createImageData(legendWidth, legendHeight);
        for (let i = 0; i < legendWidth; ++i) {
            const c = d3.rgb(colorScale(minVal + (i / legendWidth) * (maxVal - minVal)));
            for (let j = 0; j < legendHeight; ++j) {
                const index = 4 * (j * legendWidth + i);
                image.data[index] = c.r;
                image.data[index + 1] = c.g;
                image.data[index + 2] = c.b;
                image.data[index + 3] = 255;
            }
        }
        ctx.putImageData(image, 0, 0);

        // 用svg加刻度文字
        const svg = d3.select(`#${containerId}`)
            .append("svg")
            .attr("width", legendWidth)
            .attr("height", 30);

        const scale = d3.scaleLinear()
            .domain([minVal, maxVal])
            .range([0, legendWidth]);

        const axisBottom = d3.axisBottom(scale)
            .ticks(5)
            .tickFormat(d3.format(".2f"));

        svg.append("g")
            .attr("transform", "translate(0,10)")
            .call(axisBottom);
    }

    // 调用颜色条绘制函数
    drawLegend("legend", colorScale, minRCA, maxRCA);

    // 画图函数
    function drawMap(containerId, year) {
        // drawMap函数中
        const svg = d3.select(`#${containerId}`)
            .append("svg")
            .attr("width", "100%")      // 宽度改为100%适应父容器
            .attr("height", height);    // 高度保持固定350


        // 获取当年数据，变成Map，key是国家名，value是RCA_Specialty
        const yearData = dataByYear.get(year.toString()) || [];
        const rcaMap = new Map(yearData.map(d => [d.Country, +d.RCA_Specialty]));

        // 绘制国家路径
        svg.selectAll("path")
            .data(countries)
            .join("path")
            .attr("d", path)
            .attr("fill", d => {
                // 国家名字字段，可能叫 properties.name 或 properties.ADMIN，视json结构调整
                const countryName = d.properties.name || d.properties.ADMIN || "";
                const val = rcaMap.get(countryName);
                return val != null ? colorScale(val) : "#eee"; // 无数据国家填灰
            })
            .attr("stroke", "#999")
            .attr("stroke-width", 0.5)
            .on("mouseover", function (event, d) {
                const countryName = d.properties.name || d.properties.ADMIN || "";
                const val = rcaMap.get(countryName);
                const tooltip = d3.select("#tooltip");
                tooltip
                    .style("opacity", 1)
                    // .html(`<strong>${countryName}</strong><br/>RCA: ${val != null ? val.toFixed(2) : "无数据"}`)
                    .html(`<strong>${countryName}</strong>${val != null ? `<br/>RCA: ${val.toFixed(2)}` : ""}`)

                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px");
            })
            .on("mouseout", function () {
                d3.select("#tooltip").style("opacity", 0);
            });

        // 标题
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 25)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .text(year + "年");
    }

    // 四个年份循环绘图
    [2014, 2015, 2016, 2017].forEach(year => {
        drawMap("chart-" + year, year);
    });
})();
