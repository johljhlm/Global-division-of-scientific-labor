function drawBarChart(data, title, containerSelector) {
    const width = 600;
    const height = 250;
    const margin = { top: 30, right: 50, bottom: 50, left: 200 };

    const svg = d3.select(containerSelector)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.rca)])
        .range([margin.left, width - margin.right]);

    const y = d3.scaleBand()
        .domain(data.map(d => d.country))
        .range([margin.top, height - margin.bottom])
        .padding(0.2);

    // 每个学科一个颜色
    const colorMap = {
        "Arts and Humanities": "#f3722c",
        "Engineering": "#f9c74f",
        "Social Sciences": "#90be6d",
        "Natural Sciences": "#577590",
        "Medical Sciences": "#2A9D8F"
    };
    const barColor = colorMap[title] || "#4e79a7"; // fallback color

    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", margin.left)
        .attr("y", d => y(d.country))
        .attr("width", d => x(d.rca) - margin.left)
        .attr("height", y.bandwidth())
        .attr("fill", barColor);

    // Y 轴国家名
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    // X 轴
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(5));

    // 添加 X 轴标签
    svg.append("text")
        .attr("class", "x-axis-label")
        .attr("x", width / 2 + 70)
        .attr("y", height - 5)  // 调整到更靠近x轴
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("RCA指数");

    // 添加 Y 轴标签
    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height - margin.bottom + margin.top) / 3)
        .attr("y", margin.left - 100)  // 调整到更靠近y轴
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("国家/地区");  // 更新标签文本，使其更准确

    // 数值标签（可选）
    svg.selectAll("text.rca-label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "rca-label")
        .attr("x", d => x(d.rca) + 3)
        .attr("y", d => y(d.country) + y.bandwidth() / 2 + 4)
        .text(d => d.rca.toFixed(2))
        .style("font-size", "10px")
        .style("fill", "black");
}

function loadAndProcessData() {
    d3.csv("../../data/RCA.csv").then(function (raw) {
        const specialtyMap = {};

        // 分组：将数据按 level_3（学科）分类
        raw.forEach(d => {
            const country = d.Country;
            const specialty = d.level_3;
            const rca = +d.RCA_Specialty;

            // 跳过非法或缺失数据
            if (!specialty || !country || isNaN(rca)) return;

            if (!specialtyMap[specialty]) {
                specialtyMap[specialty] = [];
            }

            specialtyMap[specialty].push({ country, rca });
        });

        // 获取每个学科RCA最高的前5国家
        const top5BySpecialty = {};
        Object.entries(specialtyMap).forEach(([specialty, entries]) => {
            const sorted = entries.sort((a, b) => b.rca - a.rca).slice(0, 5);
            top5BySpecialty[specialty] = sorted;
        });

        // 映射HTML容器ID
        const mapping = {
            "Arts and Humanities": "#arts-chart",
            "Engineering": "#eng-chart",
            "Social Sciences": "#soc-chart",
            "Natural Sciences": "#nat-chart",
            "Medical Sciences": "#med-chart"
        };

        // 绘图
        for (const [specialty, containerId] of Object.entries(mapping)) {
            if (top5BySpecialty[specialty]) {
                drawBarChart(top5BySpecialty[specialty], specialty, containerId);
            }
        }
    });
}

export { loadAndProcessData }; 