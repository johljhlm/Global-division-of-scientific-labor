function navigateTo(type) {
    const economic = document.getElementById("economic-section");
    const historical = document.getElementById("historical-section");

    if (type === "economic") {
        economic.style.display = "block";
        historical.style.display = "none";
    } else if (type === "historical") {
        economic.style.display = "none";
        historical.style.display = "block";
    }
}

// 画GDP的div，加载CSV数据
d3.csv('../data/GDP_WB.csv').then(data => {
    const years = Object.keys(data[0]).filter(k => /^\d{4}$/.test(k));

    const allCountries = data.map(d => ({
        name: d["Country Name"],
        values: years.map(y => ({ year: +y, value: +d[y] }))
    }));

    const selectedCountries = allCountries;
    const highlightCountries = ["High income", "Middle income", "Lower middle income", "World"];


    const container = d3.select('#gdp-chart');
    container.selectAll('*').remove();

    const width = container.node().clientWidth || 700;
    const height = container.node().clientHeight || 400;

    const margin = { top: 30, right: 120, bottom: 40, left: 70 };

    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('display', 'block')
        .style('margin', '0 auto')
        .style('overflow', 'visible');

    const x = d3.scaleLinear()
        .domain(d3.extent(years, d => +d))
        .range([margin.left, width - margin.right]);

    const maxGDP = d3.max(selectedCountries, c => d3.max(c.values, v => v.value));
    const y = d3.scaleLinear()
        .domain([0, maxGDP])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const xAxis = g => g
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(d3.format('d')));

    const yAxis = g => g
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(6).tickFormat(d => (d / 1e8).toFixed(0) + '亿'));

    svg.append('g').call(xAxis);
    svg.append('g').call(yAxis);


    const color = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(selectedCountries.map(d => d.name));
    const lineGen = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.value))
        .defined(d => !isNaN(d.value) && d.value !== null);

    const linesGroup = svg.append('g').attr('class', 'lines-group');

    const lines = linesGroup.selectAll('path.line')
        .data(selectedCountries)
        .join('path')
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke-width', d => highlightCountries.includes(d.name) ? 3 : 1.5)
        .attr('stroke', d => highlightCountries.includes(d.name) ? color(d.name) : '#ccc')
        .attr('opacity', d => highlightCountries.includes(d.name) ? 1 : 0.3)
        .attr('d', d => lineGen(d.values))
        .style('pointer-events', 'none');

    const hoverLines = linesGroup.selectAll('path.hover-area')
        .data(selectedCountries)
        .join('path')
        .attr('class', 'hover-area')
        .attr('fill', 'none')
        .attr('stroke', 'transparent')
        .attr('stroke-width', 10)
        .attr('d', d => lineGen(d.values))
        .style('cursor', 'pointer')
        .on('mouseover', function (event, d) {
            lines
                .attr('stroke', c => c.name === d.name ? color(c.name) : '#ccc')
                .attr('opacity', c => c.name === d.name ? 1 : 0.2)
                .attr('stroke-width', c => c.name === d.name ? 3 : 1.5);

            labelGroup.selectAll('text').remove();
            labelGroup.selectAll('text')
                .data([d])
                .join('text')
                .attr('x', d => x(d.values[d.values.length - 1].year) + 5)
                .attr('y', d => y(d.values[d.values.length - 1].value))
                .text(d => d.name)
                .attr('fill', color(d.name))
                .style('font-weight', 'bold')
                .style('font-size', '12px');
        })
        .on('mouseout', function () {
            lines
                .attr('stroke', d => highlightCountries.includes(d.name) ? color(d.name) : '#ccc')
                .attr('opacity', d => highlightCountries.includes(d.name) ? 1 : 0.3)
                .attr('stroke-width', d => highlightCountries.includes(d.name) ? 3 : 1.5);

            labelGroup.selectAll('text').remove();
            labelGroup.selectAll('text')
                .data(selectedCountries.filter(d => highlightCountries.includes(d.name)))
                .join('text')
                .attr('x', d => x(d.values[d.values.length - 1].year) + 5)
                .attr('y', d => y(d.values[d.values.length - 1].value))
                .text(d => d.name)
                .attr('fill', d => color(d.name))
                .style('font-weight', 'bold')
                .style('font-size', '12px');
        });

    const labelGroup = svg.append('g').attr('class', 'labels-group');
    labelGroup.selectAll('text')
        .data(selectedCountries.filter(d => highlightCountries.includes(d.name)))
        .join('text')
        .attr('x', d => x(d.values[d.values.length - 1].year) + 5)
        .attr('y', d => y(d.values[d.values.length - 1].value))
        .text(d => d.name)
        .attr('fill', d => color(d.name))
        .style('font-weight', 'bold')
        .style('font-size', '12px');
});

/**
 * RCA学科优势分析可视化
 * 功能：加载RCA.csv数据，绘制各学科Top5国家柱状图
 */

function loadAndProcessData() {
    d3.csv("../data/RCA.csv").then(function (raw) {
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

function drawBarChart(data, title, containerSelector) {
    const width = 500;
    const height = 250;
    const margin = { top: 30, right: 50, bottom: 30, left: 100 };

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

// 初始化执行
loadAndProcessData();


