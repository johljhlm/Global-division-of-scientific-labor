function drawECIChart(data) {
    if (!data) {
        console.error("No data provided to drawECIChart");
        return;
    }

    const container = d3.select('#economic-chart');
    container.selectAll('*').remove();
    container.style('height', '500px');

    const width = container.node().clientWidth || 700;
    const height = container.node().clientHeight || 400;
    const margin = { top: 30, right: 200, bottom: 40, left: 70 };

    // 处理数据 - 更严格的数据过滤
    let processedData = [];

    // 直接处理数据，不使用Map
    data.forEach(d => {
        const country = d.Country;
        const year = +d.Year;
        const eci = +d.ECI;

        // 只处理有效的数据
        if (country && !isNaN(year) && !isNaN(eci)) {
            processedData.push({
                "Country": country,
                "Year": year,
                "ECI": eci
            });
        }
    });

    // 按国家分组数据
    const groupedData = d3.group(processedData, d => d.Country);

    // 过滤掉数据点太少的国家
    const filteredGroupedData = new Map(
        Array.from(groupedData).filter(([_, values]) => values.length > 10)
    );

    // 找出2015年ECI最高和最低的各三个国家
    const countriesWithECI2015 = Array.from(filteredGroupedData.entries())
        .map(([country, values]) => {
            const data2015 = values.find(d => d.Year === 2015);
            return {
                country: country,
                eci: data2015 ? data2015.ECI : null
            };
        })
        .filter(d => d.eci !== null)
        .sort((a, b) => b.eci - a.eci);

    const top3Countries = countriesWithECI2015.slice(0, 3).map(d => d.country);
    const bottom3Countries = countriesWithECI2015.slice(-3).map(d => d.country);
    const highlightCountries = [...top3Countries, ...bottom3Countries];

    console.log("Top 3 countries by ECI in 2015:", top3Countries);
    console.log("Bottom 3 countries by ECI in 2015:", bottom3Countries);

    // 创建SVG
    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('display', 'block')
        .style('margin', '0 auto')
        .style('overflow', 'visible');

    // 设置比例尺
    const x = d3.scaleLinear()
        .domain(d3.extent(processedData, d => d.Year))
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([-3, 3])
        .range([height - margin.bottom, margin.top]);

    // 创建线条生成器
    const line = d3.line()
        .x(d => x(d.Year))
        .y(d => y(d.ECI))
        .curve(d3.curveMonotoneX);

    // 绘制坐标轴
    const xAxis = g => g
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x)
            .tickFormat(d3.format('d'))
            .ticks(10));

    const yAxis = g => g
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y)
            .ticks(6)
            .tickFormat(d3.format('.1f')));

    // 添加零线
    svg.append('line')
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', y(0))
        .attr('y2', y(0))
        .attr('stroke', '#666')
        .attr('stroke-dasharray', '2,2');

    svg.append('g').call(xAxis);
    svg.append('g').call(yAxis);

    // 添加标题和标签
    svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', width / 2)
        .attr('y', margin.top - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('各国/地区经济复杂度指数(ECI)变化折线图');

    svg.append('text')
        .attr('class', 'y-axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', margin.left - 60)
        .attr('x', -(height / 2))
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('经济复杂度指数(ECI)');

    svg.append('text')
        .attr('class', 'x-axis-label')
        .attr('x', width / 2)
        .attr('y', height - margin.bottom + 40)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('年份');

    // 设置颜色比例尺
    const color = d3.scaleOrdinal(d3.schemeTableau10)
        .domain(highlightCountries);

    // 创建一个用于显示国家名称的标签组
    const labelGroup = svg.append('g')
        .attr('class', 'labels-group');

    // 更新标签函数
    function updateLabels(hoveredCountry = null) {
        labelGroup.selectAll('text').remove();

        const countriesToLabel = hoveredCountry ? [hoveredCountry] : highlightCountries;

        // 收集所有标签的位置信息
        const labelPositions = [];

        countriesToLabel.forEach(country => {
            const countryData = filteredGroupedData.get(country);
            if (!countryData) return;

            const lastPoint = countryData[countryData.length - 1];
            if (lastPoint) {
                const x = width - margin.right + 25; // 将标签向右移动
                const yPos = y(lastPoint.ECI);
                labelPositions.push({
                    country,
                    eci: lastPoint.ECI,
                    x,
                    y: yPos,
                    height: 14
                });
            }
        });

        // 对标签位置进行调整以避免重叠
        labelPositions.sort((a, b) => a.y - b.y);
        for (let i = 1; i < labelPositions.length; i++) {
            const prev = labelPositions[i - 1];
            const curr = labelPositions[i];
            const minDistance = 20; // 增加最小垂直间距

            if (curr.y - prev.y < minDistance) {
                curr.y = prev.y + minDistance;
            }
        }

        // 绘制调整后的标签
        labelPositions.forEach(label => {
            labelGroup.append('text')
                .attr('x', label.x)
                .attr('y', label.y)
                .text(`${label.country} (${label.eci.toFixed(2)})`)
                .attr('fill', color(label.country))
                .style('font-weight', 'bold')
                .style('font-size', '12px')
                .style('dominant-baseline', 'middle');
        });
    }

    // 绘制线条
    const linesGroup = svg.append('g')
        .attr('class', 'lines-group');

    // 首先绘制所有线条
    const lines = linesGroup.selectAll('path.line')
        .data(Array.from(filteredGroupedData.entries()))
        .join('path')
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke-width', d => highlightCountries.includes(d[0]) ? 2 : 1)
        .attr('stroke', d => highlightCountries.includes(d[0]) ? color(d[0]) : '#888')
        .attr('opacity', d => highlightCountries.includes(d[0]) ? 1 : 0.25)
        .attr('d', d => {
            const countryData = d[1];
            countryData.sort((a, b) => a.Year - b.Year);
            return line(countryData);
        });

    // 添加透明的宽线条用于更容易的鼠标交互
    const hoverLines = linesGroup.selectAll('path.hover-area')
        .data(Array.from(filteredGroupedData.entries()))
        .join('path')
        .attr('class', 'hover-area')
        .attr('fill', 'none')
        .attr('stroke', 'transparent')
        .attr('stroke-width', 10)
        .attr('d', d => {
            const countryData = d[1];
            countryData.sort((a, b) => a.Year - b.Year);
            return line(countryData);
        })
        .style('cursor', 'pointer')
        .on('mouseover', function (event, d) {
            const country = d[0];

            // 高亮选中的线条，并为非高亮国家使用相同的颜色
            lines
                .attr('stroke', ([c, _]) => {
                    if (c === country) {
                        return highlightCountries.includes(c) ? color(c) : color(country);
                    }
                    return highlightCountries.includes(c) ? color(c) : '#777';
                })
                .attr('opacity', ([c, _]) => c === country ? 1 : (highlightCountries.includes(c) ? 0.8 : 0.25))
                .attr('stroke-width', ([c, _]) => c === country ? 2.5 : (highlightCountries.includes(c) ? 2 : 1));

            // 更新标签
            updateLabels(country);
        })
        .on('mouseout', function () {
            // 恢复原始状态
            lines
                .attr('stroke', ([c, _]) => highlightCountries.includes(c) ? color(c) : '#777')
                .attr('opacity', ([c, _]) => highlightCountries.includes(c) ? 1 : 0.25)
                .attr('stroke-width', ([c, _]) => highlightCountries.includes(c) ? 2 : 1);

            // 恢复原始标签
            updateLabels();
        });

    // 初始显示标签
    updateLabels();
}

export { drawECIChart }; 